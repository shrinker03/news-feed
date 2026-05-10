# Lab 01 — News Feed Pattern Stack

Five stages, four pattern layers. Each git tag is independently runnable.

## How to run any stage

```sh
git checkout stage-N-<name>
cd labs/01-news-feed/backend  && npm install && npm run dev   # :3001
cd ../frontend                && npm install && npm run dev   # :5173
# open http://localhost:5173
```

## Load test (after backend is running)

```powershell
cd labs/01-news-feed/load-test
.\run.ps1
```

## Metrics

| Metric                              | Stage 0 Naive | Stage 1 Correctness | Stage 2 Reliability | Stage 3 Performance | Stage 4 Polish |
|-------------------------------------|---------------|---------------------|---------------------|---------------------|----------------|
| p50 latency (ms)                    | 41            |                     |                     |                     |                |
| p95 latency (ms)                    | 111 (p97.5)   |                     |                     |                     |                |
| p99 latency (ms)                    | 136           |                     |                     |                     |                |
| Error rate @ 100 connections (%)    | 0             |                     |                     |                     |                |
| Initial JS bundle gzipped (KB)      | 46.5          |                     |                     |                     |                |
| DOM nodes after 100 posts loaded    | 377           |                     |                     |                     |                |
| Network bytes, first 50 posts (KB)  | 2,044         |                     |                     |                     |                |
| LCP (ms, Lighthouse mobile)         | 10,400        |                     |                     |                     |                |
| TBT (ms, Lighthouse mobile)         | 50            |                     |                     |                     |                |

Fill each column at its tag. The story is in the deltas between adjacent columns.

## Per-stage takeaways

### Stage 0 — Naive
- 10.4s LCP is almost entirely picsum image load time — eager `<img src>` with no lazy loading fires all 20 requests at once
- 2 MB for 50 posts is the image-bytes penalty; the API JSON itself is tiny
- 0% errors and low TBT because there's no JS complexity yet — the bundle is just React + fetch
- DOM grows unboundedly: every "Load more" adds nodes forever, no cleanup

### Stage 1 — Correctness
<!-- fill in after measuring -->

### Stage 2 — Reliability
<!-- fill in after measuring -->

### Stage 3 — Performance
<!-- fill in after measuring -->

### Stage 4 — Polish
<!-- fill in after measuring -->

## What this lab is NOT

- Not multi-user, not persistent, not deployed
- Latency is simulated; real network conditions will dominate over jitter
- Picsum is a CDN (stages 0–2) — image bytes reflect that CDN, not your origin
