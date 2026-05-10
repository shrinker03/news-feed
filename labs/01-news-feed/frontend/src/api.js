export async function fetchPosts({ offset, limit }) {
  const res = await fetch(`/api/posts?offset=${offset}&limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
