// pageParam is the cursor (last post id seen), or null for the first page
export async function fetchPostsPage({ pageParam = null, limit = 20 }) {
  const url = pageParam
    ? `/api/posts?cursor=${pageParam}&limit=${limit}`
    : `/api/posts?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { items, nextCursor }
}
