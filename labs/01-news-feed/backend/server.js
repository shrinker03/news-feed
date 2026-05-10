const express = require('express');
const cors = require('cors');
const { generatePosts } = require('./posts');

const app = express();
const PORT = 3001;

const posts = generatePosts(); // 1000 posts, descending by id

// 30ms ± 20ms: spreads p50/p95/p99 so autocannon numbers tell a story
const sleep = ms => new Promise(r => setTimeout(r, ms));
const jitter = () => 10 + Math.random() * 40;

app.use(cors());
app.use(express.json());

// Stage 0: offset pagination. Breaks under concurrent inserts — that's the point.
app.get('/api/posts', async (req, res) => {
  await sleep(jitter());
  const offset = Math.max(0, parseInt(req.query.offset) || 0);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const items = posts.slice(offset, offset + limit);
  res.json({ items });
});

app.listen(PORT, () => {
  console.log(`backend :${PORT}  — stage 0 naive`);
});
