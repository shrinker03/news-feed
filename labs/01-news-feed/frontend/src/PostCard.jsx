// PostCard is extracted here (from Feed.jsx) so the virtualizer can measure
// a single consistent unit — one card = one virtual row.

export default function PostCard({ post }) {
  const base = post.imageUrl; // e.g. /images/photo-3

  return (
    <div style={{ background: '#fff', borderRadius: 8, marginBottom: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
      {/*
        <picture> lets the browser pick the best format + size it supports.
        The <source type="image/webp"> is tried first; the <img> JPEG srcset is
        the fallback for browsers that don't support WebP (essentially none in 2024,
        but the pattern is correct for progressive enhancement).
        loading="lazy" defers off-screen image fetches — the key fix for stage 0's
        eager-load penalty that drove LCP to 10s.
      */}
      <picture>
        <source
          type="image/webp"
          srcSet={`${base}_400.webp 400w, ${base}_800.webp 800w, ${base}_1200.webp 1200w`}
          sizes="(max-width: 640px) 100vw, 640px"
        />
        <img
          src={`${base}_800.jpg`}
          srcSet={`${base}_400.jpg 400w, ${base}_800.jpg 800w, ${base}_1200.jpg 1200w`}
          sizes="(max-width: 640px) 100vw, 640px"
          alt=""
          loading="lazy"
          decoding="async"
          style={{ display: 'block', width: '100%', height: 200, objectFit: 'cover' }}
        />
      </picture>
      <div style={{ padding: '0.75rem 1rem' }}>
        <strong>{post.author}</strong>
        <p style={{ margin: '0.4rem 0 0.6rem' }}>{post.text}</p>
        <small style={{ color: '#888' }}>{post.likes} likes &middot; {new Date(post.createdAt).toLocaleString()}</small>
      </div>
    </div>
  );
}
