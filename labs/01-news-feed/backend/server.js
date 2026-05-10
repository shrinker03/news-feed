const express = require('express');
const cors = require('cors');
const { generatePosts } = require('./posts');

const app = express();
const PORT = process.env.PORT || 3001;

const posts = generatePosts(); // 1000 posts, descending by id

// 30ms ± 20ms: spreads p50/p95/p99 so autocannon numbers tell a story
const sleep = ms => new Promise(r => setTimeout(r, ms));
const jitter = () => 10 + Math.random() * 40;

app.use(cors());
app.use(express.json());

// FAIL_RATE env var: fraction of requests to fail with 503 (e.g. FAIL_RATE=0.2 = 20%).
// Fires before the latency sleep so the client sees a real network-style failure, not a slow one.
const FAIL_RATE = parseFloat(process.env.FAIL_RATE) || 0;

app.get('/api/posts', async (req, res) => {
  if (FAIL_RATE > 0 && Math.random() < FAIL_RATE) {
    return res.status(503).json({ error: 'service unavailable' });
  }

  await sleep(jitter());
  const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  const page = cursor
    ? posts.filter(p => p.id < cursor).slice(0, limit)
    : posts.slice(0, limit);

  const nextCursor = page.length === limit ? page[page.length - 1].id : null;
  res.json({ items: page, nextCursor });
});

app.listen(PORT, () => {
  const failMsg = FAIL_RATE > 0 ? `  FAIL_RATE=${FAIL_RATE}` : '';
  console.log(`backend :${PORT}  — stage 2 reliability${failMsg}`);
});
