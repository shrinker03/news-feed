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

// Stage 1: cursor pagination. Stable under concurrent inserts — offset is not.
// cursor = id of the last post the client saw; server returns posts with id < cursor.
app.get('/api/posts', async (req, res) => {
  await sleep(jitter());
  const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  const page = cursor
    ? posts.filter(p => p.id < cursor).slice(0, limit)
    : posts.slice(0, limit);

  // null nextCursor signals the client there are no more pages
  const nextCursor = page.length === limit ? page[page.length - 1].id : null;
  res.json({ items: page, nextCursor });
});

app.listen(PORT, () => {
  console.log(`backend :${PORT}  — stage 1 correctness`);
});
