import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPostsPage } from './api';

const PAGE_SIZE = 20;

export default function Feed() {
  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error, refetch,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    // TanStack Query injects { signal } automatically — fetchPostsPage threads it into fetch()
    // so abandoned requests (unmount, fast navigation) are cancelled, not left dangling.
    queryFn: ({ pageParam, signal }) => fetchPostsPage({ pageParam, limit: PAGE_SIZE, signal }),
    initialPageParam: null,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    // Exponential backoff + jitter: spreads retry storms so a recovering server
    // isn't immediately re-slammed by all clients retrying in sync.
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 250,
  });

  const posts = data?.pages.flatMap(p => p.items) ?? [];

  if (status === 'pending') {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading...</div>;
  }

  // Error state: show message + refetch button instead of silent failure (stage 0 behaviour).
  // Only fires after all 3 retries are exhausted.
  if (status === 'error') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#c00', marginBottom: '1rem' }}>
          Failed to load posts: {error.message}
        </p>
        <button
          onClick={() => refetch()}
          style={{ padding: '0.5rem 1.5rem', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      {/* Every post stays in the DOM forever. Stage 3 virtualizes this. */}
      {posts.map(post => (
        <div key={post.id} style={{ background: '#fff', borderRadius: 8, marginBottom: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          {/* Still eager loading images — stage 3 adds loading="lazy" */}
          <img src={post.imageUrl} alt="" style={{ display: 'block', width: '100%', height: 200, objectFit: 'cover' }} />
          <div style={{ padding: '0.75rem 1rem' }}>
            <strong>{post.author}</strong>
            <p style={{ margin: '0.4rem 0 0.6rem' }}>{post.text}</p>
            <small style={{ color: '#888' }}>{post.likes} likes &middot; {new Date(post.createdAt).toLocaleString()}</small>
          </div>
        </div>
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          style={{ display: 'block', width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #ccc', background: '#fff', cursor: isFetchingNextPage ? 'default' : 'pointer', color: '#333', fontSize: '0.95rem' }}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
