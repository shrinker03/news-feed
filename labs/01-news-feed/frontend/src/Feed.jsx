import { useState, useEffect } from 'react';
import { fetchPosts } from './api';

const PAGE_SIZE = 20;

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  // No cleanup, no abort signal, no error handling — that's the point.
  // Stage 2 adds all of these.
  useEffect(() => {
    load(0);
  }, []);

  async function load(nextOffset) {
    setLoading(true);
    const { items } = await fetchPosts({ offset: nextOffset, limit: PAGE_SIZE });
    setPosts(prev => [...prev, ...items]);
    setOffset(nextOffset + PAGE_SIZE);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      {/* Every post stays in the DOM forever. Stage 3 virtualizes this. */}
      {posts.map(post => (
        <div key={post.id} style={{ background: '#fff', borderRadius: 8, marginBottom: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          {/* Eager load: all images fetch on render. Stage 3 adds loading="lazy". */}
          <img src={post.imageUrl} alt="" style={{ display: 'block', width: '100%', height: 200, objectFit: 'cover' }} />
          <div style={{ padding: '0.75rem 1rem' }}>
            <strong>{post.author}</strong>
            <p style={{ margin: '0.4rem 0 0.6rem' }}>{post.text}</p>
            <small style={{ color: '#888' }}>{post.likes} likes &middot; {new Date(post.createdAt).toLocaleString()}</small>
          </div>
        </div>
      ))}

      <button
        onClick={() => load(offset)}
        disabled={loading}
        style={{ display: 'block', width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #ccc', background: '#fff', cursor: loading ? 'default' : 'pointer', color: '#333', fontSize: '0.95rem' }}
      >
        {loading ? 'Loading...' : 'Load more'}
      </button>
    </div>
  );
}
