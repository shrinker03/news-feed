#!/usr/bin/env node
/**
 * Automated metrics for each stage.
 *
 * First-time setup:
 *   cd load-test && npm install && npx playwright install chromium
 *
 * Each run (backend :3001 + frontend :5173 must be running):
 *   npm run metrics
 *
 * Covers: bundle size, latency percentiles, DOM nodes, network bytes, LCP, TBT.
 * TBT here is a long-task proxy — not identical to Lighthouse TBT, but consistent
 * across stages so the deltas are meaningful.
 */

const autocannon = require('autocannon');
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const { gzipSync, constants } = require('zlib');
const fs   = require('fs');
const path = require('path');

const BACKEND  = 'http://localhost:3001';
const FRONTEND = 'http://localhost:5173';
// 1 initial page + 4 clicks = 100 posts — matches README "100 posts" metric
const LOAD_MORE_CLICKS = 4;

async function getBundleSize() {
  const frontendDir = path.resolve(__dirname, '../frontend');
  const assetsDir   = path.join(frontendDir, 'dist', 'assets');

  // Delete stale dist so we never read last run's output on build failure
  if (fs.existsSync(assetsDir)) fs.rmSync(assetsDir, { recursive: true, force: true });

  // shell:true lets npm.cmd resolve correctly on Windows without PATH gymnastics
  spawnSync('npm', ['run', 'build'], { cwd: frontendDir, shell: true, stdio: 'ignore' });

  if (!fs.existsSync(assetsDir)) return null; // build failed

  // Gzip the built JS ourselves — more reliable than parsing Vite's ANSI-colored output
  const jsFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.js'));
  if (!jsFile) return null;
  const raw     = fs.readFileSync(path.join(assetsDir, jsFile));
  const gzipped = gzipSync(raw, { level: constants.Z_BEST_COMPRESSION });
  return +(gzipped.length / 1024).toFixed(2);
}

async function getLatencyMetrics() {
  return new Promise((resolve, reject) => {
    autocannon(
      { url: `${BACKEND}/api/posts?limit=20`, connections: 100, duration: 20 },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          p50:       result.latency.p50,
          p97_5:     result.latency.p97_5,
          p99:       result.latency.p99,
          errorRate: +((result.non2xx / Math.max(1, result.requests.total)) * 100).toFixed(1),
        });
      }
    );
  });
}

async function getBrowserMetrics() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page    = await context.newPage();

  // CDP must be enabled before navigation to capture all network events
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  let totalBytes = 0;
  cdp.on('Network.loadingFinished', e => { totalBytes += e.encodedDataLength; });

  // Long task observer must be installed before navigation to catch all tasks
  await page.addInitScript(() => {
    window.__longTasks = [];
    try {
      new PerformanceObserver(list => {
        window.__longTasks.push(...list.getEntries());
      }).observe({ type: 'longtask' });
    } catch (_) {}
  });

  await page.goto(FRONTEND, { waitUntil: 'domcontentloaded', timeout: 30_000 });

  // Wait for initial images to settle so LCP candidate is final
  await page.waitForTimeout(5000);

  // Load more posts to reach ~100
  for (let i = 0; i < LOAD_MORE_CLICKS; i++) {
    try {
      await page.click('button:has-text("Load more")', { timeout: 5000 });
      await page.waitForTimeout(2000);
    } catch (_) {
      break; // no more pages or button not found
    }
  }

  const domNodes = await page.evaluate(() => document.querySelectorAll('*').length);

  // LCP: last entry from buffered observer = final LCP candidate
  const lcp = await page.evaluate(() => new Promise(resolve => {
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      if (entries.length) resolve(Math.round(entries[entries.length - 1].startTime));
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    setTimeout(() => resolve(null), 3000);
  }));

  // TBT proxy: blocking time = sum of (task - 50ms) for all long tasks
  const tbt = await page.evaluate(() =>
    Math.round((window.__longTasks || []).reduce((s, t) => s + Math.max(0, t.duration - 50), 0))
  );

  await browser.close();
  return { domNodes, networkKB: Math.round(totalBytes / 1024), lcp: lcp ?? 'n/a', tbt };
}

async function main() {
  console.log('\n=== Stage metrics collector ===');
  console.log('Prereq: backend :3001 and frontend :5173 must be running.\n');

  process.stdout.write('1/3  Bundle size (vite build)...           ');
  const bundleKB = await getBundleSize();
  console.log(`${bundleKB} KB gzipped`);

  process.stdout.write('2/3  Autocannon 100c × 20s...              ');
  const lat = await getLatencyMetrics();
  console.log(`p50=${lat.p50}ms  p97.5=${lat.p97_5}ms  p99=${lat.p99}ms  errors=${lat.errorRate}%`);

  process.stdout.write('3/3  Playwright (DOM / bytes / LCP / TBT)... ');
  const br = await getBrowserMetrics();
  console.log('done\n');

  const w = 36;
  const row = (label, val) => `  ${label.padEnd(w)}${val}`;
  console.log('─'.repeat(52));
  console.log(row('Metric', 'Value'));
  console.log('─'.repeat(52));
  console.log(row('p50 latency',                `${lat.p50} ms`));
  console.log(row('p95 latency (p97.5)',         `${lat.p97_5} ms`));
  console.log(row('p99 latency',                `${lat.p99} ms`));
  console.log(row('Error rate @ 100c',          `${lat.errorRate}%`));
  console.log(row('JS bundle gzipped',          `${bundleKB} KB`));
  console.log(row(`DOM nodes (${1 + LOAD_MORE_CLICKS} pages loaded)`, `${br.domNodes}`));
  console.log(row(`Network bytes (${1 + LOAD_MORE_CLICKS} pages)`,    `${br.networkKB} KB`));
  console.log(row('LCP',                        `${br.lcp} ms`));
  console.log(row('TBT (long-task proxy)',       `${br.tbt} ms`));
  console.log('─'.repeat(52));
}

main().catch(err => {
  console.error('\nFailed:', err.message);
  if (err.message.includes('ECONNREFUSED')) {
    console.error('→ Make sure backend (:3001) and frontend (:5173) are both running.');
  }
  process.exit(1);
});
