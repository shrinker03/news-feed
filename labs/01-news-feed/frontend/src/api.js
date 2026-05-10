// pageParam is the cursor (last post id seen), or null for the first page.
// signal comes from TanStack Query — threads AbortController through to fetch so
// in-flight requests are cancelled when the component unmounts or the query is invalidated.
export async function fetchPostsPage({ pageParam = null, limit = 20, signal } = {}) {
  const url = pageParam
    ? `/api/posts?cursor=${pageParam}&limit=${limit}`
    : `/api/posts?limit=${limit}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { items, nextCursor }
}
