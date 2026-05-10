import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Feed from './Feed';

// QueryClient lives here so it survives re-renders of App
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <header style={{ padding: '1rem 1.5rem', background: '#fff', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>News Feed Lab — Stage 1: Correctness</h1>
        </header>
        <Feed />
      </div>
    </QueryClientProvider>
  );
}
