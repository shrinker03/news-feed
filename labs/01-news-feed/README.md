# Lab 01 — News Feed Pattern Stack

Five stages, four pattern layers. Each git tag is independently runnable.

## How to run any stage

```sh
git checkout stage-N-<name>
cd labs/01-news-feed/backend  && npm install && npm run dev   # :3001
cd ../frontend                && npm install && npm run dev   # :5173
# open http://localhost:5173
```

## Automated metrics (stages 1+)

```powershell
cd labs/01-news-feed/load-test
npm run metrics   # backend :3001 + frontend :5173 must be running
```

First-time setup: `npm install && npx playwright install chromium`

> LCP and TBT are headless-browser proxies, not Lighthouse scores. Values are consistent
> across stages (same tool, same methodology) so deltas are meaningful even if absolutes differ.

## Metrics

| Metric                              | Stage 0 Naive | Stage 1 Correctness | Stage 2 Reliability | Stage 3 Performance | Stage 4 Polish |
|-------------------------------------|---------------|---------------------|---------------------|---------------------|----------------|
| p50 latency (ms)                    | 39            | 39                  | 39                  | 39                  |                |
| p95 latency (ms)                    | 62 (p97.5)    | 63 (p97.5)          | 63 (p97.5)          | 63 (p97.5)          |                |
| p99 latency (ms)                    | 66            | 67                  | 66                  | 66                  |                |
| Error rate @ 100c, no FAIL_RATE (%) | 0             | 0                   | 0                   | 0                   |                |
| Error rate @ 100c, FAIL_RATE=0.2(%) | —             | —                   | 19.9 raw → ~0.16 UX | —                   |                |
| JS bundle gzipped (KB)              | 45.34         | 56.85               | 56.98               | 61.97               |                |
| DOM nodes after 100 posts loaded    | 736           | 616                 | 616                 | **152**             |                |
| Network bytes, 5 pages (KB)         | 4,588         | 4,758               | 4,762               | **2,391**           |                |
| LCP (ms, headless proxy)            | 1,064         | 1,032               | 1,064               | 1,076               |                |
| TBT (ms, long-task proxy)           | 0             | 0                   | 0                   | 2                   |                |

The story is in the deltas between adjacent columns.

## Per-stage takeaways

### Stage 0 — Naive
- 45 KB bundle is lean — just React + fetch, no abstractions yet
- DOM grows unboundedly: every "Load more" appends 6 nodes × 20 posts; no ceiling
- p99 (66ms) vs p50 (39ms) gap shows jitter spread — backend is doing its job as a baseline

### Stage 1 — Correctness
- Bundle jumped 11.5 KB (45 → 56.85): the cost of bringing in TanStack Query
- DOM node count dropped 120 nodes despite same post count — QueryClientProvider and React Query's internal tree are lighter than the manual state boilerplate they replaced
- Latency nearly identical to stage 0 — cursor vs offset makes no throughput difference at 1000 posts in-memory; the win is correctness under inserts, not speed

### Stage 2 — Reliability
- No latency/bundle/DOM change — this stage is purely about failure behaviour, not speed
- Raw backend error rate at FAIL_RATE=0.2 is 19.9%; with retry=3 + jitter the user-visible failure rate drops to ~0.16% (0.2⁴ — all 4 attempts must fail)
- Jitter on retryDelay prevents thundering-herd: without it, all clients would retry at the same instant and re-slam a recovering server
- AbortController cancels in-flight requests on unmount — without it, a slow request completing after navigation writes stale state into the cache

### Stage 3 — Performance
- DOM nodes: 616 → 152 (-75%) with 100 posts loaded — only ~10 cards exist in the DOM at any time regardless of scroll depth; this is the virtualization payoff
- Network bytes: 4,762 → 2,391 KB (-50%) — lazy loading means images outside the viewport never fetch; WebP further cuts per-image bytes vs JPEG
- Bundle cost of react-virtual: +5 KB gzipped — cheap for the DOM savings
- Latency flat: backend unchanged, virtualization is pure client-side
- LCP headless proxy unchanged — headless Chrome doesn't have a viewport so lazy load doesn't trigger differently; in real Chrome, LCP would drop because the first image loads faster when it's not competing with 19 eager requests

### Stage 4 — Polish
<!-- fill in after measuring -->

## What this lab is NOT

- Not multi-user, not persistent, not deployed
- Latency is simulated; real network conditions will dominate over jitter
- Picsum is a CDN (stages 0–2) — image bytes reflect that CDN, not your origin
