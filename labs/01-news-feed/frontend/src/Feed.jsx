import { useRef, useLayoutEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { fetchPostsPage } from './api';
import PostCard from './PostCard';

const PAGE_SIZE = 20;

export default function Feed() {
  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error, refetch,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam, signal }) => fetchPostsPage({ pageParam, limit: PAGE_SIZE, signal }),
    initialPageParam: null,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 250,
  });

  const posts = data?.pages.flatMap(p => p.items) ?? [];

  // scrollMargin = distance from page top to the list container.
  // useWindowVirtualizer uses this to translate between page-scroll position
  // and item position within the container.
  const listRef = useRef(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  useLayoutEffect(() => {
    if (listRef.current) setScrollMargin(listRef.current.offsetTop);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: posts.length,
    estimateSize: () => 340, // approx card height; measureElement corrects per-item
    overscan: 6,             // render 6 extra items above/below viewport to prevent blank flashes
    scrollMargin,
  });

  if (status === 'pending') {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading...</div>;
  }

  if (status === 'error') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#c00', marginBottom: '1rem' }}>Failed to load posts: {error.message}</p>
        <button onClick={() => refetch()} style={{ padding: '0.5rem 1.5rem', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}>
          Try again
        </button>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={listRef} style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      {/*
        getTotalSize() is the full pixel height of ALL items — even the thousands not in the DOM.
        This div holds that height so the scrollbar represents the real content length.
        Only the ~10 items inside the viewport are actually rendered (see virtualItems below).
      */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualItems.map(item => (
          <div
            key={item.key}
            data-index={item.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              // item.start is the pixel offset from page top; subtract scrollMargin
              // to get the offset relative to this container's top edge.
              transform: `translateY(${item.start - scrollMargin}px)`,
            }}
          >
            <PostCard post={posts[item.index]} />
          </div>
        ))}
      </div>

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
