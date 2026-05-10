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
| p50 latency (ms)                    |               |                     |                     |                     |                |
| p95 latency (ms)                    |               |                     |                     |                     |                |
| p99 latency (ms)                    |               |                     |                     |                     |                |
| Error rate @ 100 connections (%)    |               |                     |                     |                     |                |
| Initial JS bundle gzipped (KB)      |               |                     |                     |                     |                |
| DOM nodes after 100 posts loaded    |               |                     |                     |                     |                |
| Network bytes, first 50 posts (KB)  |               |                     |                     |                     |                |
| LCP (ms, Lighthouse mobile)         |               |                     |                     |                     |                |
| TTI (ms, Lighthouse mobile)         |               |                     |                     |                     |                |

Fill each column at its tag. The story is in the deltas between adjacent columns.

## Per-stage takeaways

### Stage 0 — Naive
<!-- fill in after measuring -->

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
