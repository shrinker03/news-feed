import Feed from './Feed';

export default function App() {
  return (
    <div>
      <header style={{ padding: '1rem 1.5rem', background: '#fff', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>News Feed Lab — Stage 0: Naive</h1>
      </header>
      <Feed />
    </div>
  );
}
