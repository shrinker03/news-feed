const AUTHORS = [
  'Alice Chen', 'Bob Patel', 'Carol Kim', 'Dave Osei', 'Eve Larsson',
  'Frank Muller', 'Grace Obi', 'Hank Torres', 'Iris Novak', 'Jack Yamada',
];

const TEXTS = [
  'Deployed to prod on a Friday. No regrets. Well, some regrets.',
  'Spent 3 hours debugging. The variable was shadowed the whole time.',
  'Cursor pagination is one of those things you only appreciate after offset pagination burns you.',
  'Hot take: a loading spinner with no error state is just a slow way to say nothing.',
  'Rewrote the whole component, then realized I was looking at the wrong file.',
  'The bug was a missing await. It\'s always a missing await.',
  'Infinite scroll sounds great until you have to implement keyboard navigation.',
  'Every "small change" has a mandatory discovery phase.',
  'The code review comment was right. I hate that it was right.',
  'Write the ugly version first. Always. Optimize after you have a baseline.',
  'AbortController is the most underrated Web API.',
  'The DOM had 4,000 nodes. The virtualized version has 20. Same UX.',
  'Exponential backoff with jitter: feels like a lot, saves the server every time.',
  'Skeleton screens don\'t make things faster. They make waiting feel shorter.',
  'Optimistic UI is a bet that the server will agree with the user.',
  'LCP is a UX metric dressed as a perf metric. Treat it like both.',
  'The image was 1.2 MB. The WebP was 190 KB. Same visual quality.',
  'useEffect + fetch: the "I\'ll figure out cleanup later" combo.',
  'A cursor that points past the end of the list is not an error. It\'s done.',
  'Jitter on retries exists because a thousand clients all agree on backoff timing.',
];

function generatePosts() {
  const posts = [];
  // Posts stored descending by id so index 0 = newest (id 1000), index 999 = oldest (id 1)
  for (let id = 1000; id >= 1; id--) {
    posts.push({
      id,
      author: AUTHORS[id % AUTHORS.length],
      text: TEXTS[id % TEXTS.length],
      // Stage 3: local images with WebP + srcset. PostCard constructs the full srcset from this base.
      imageUrl: `/images/photo-${((id - 1) % 20) + 1}`,
      likes: Math.floor(Math.abs(Math.sin(id)) * 200),
      createdAt: new Date(Date.now() - (1000 - id + 1) * 5 * 60_000).toISOString(),
    });
  }
  return posts;
}

module.exports = { generatePosts };
