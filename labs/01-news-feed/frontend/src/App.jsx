import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Feed from './Feed';

// staleTime + gcTime + refetchOnWindowFocus = the SWR knobs.
// staleTime: serve cached data for up to 30s before re-fetching in the background.
// gcTime: keep unused cache entries for 5 min so back-navigation is instant.
// refetchOnWindowFocus: off because the feed doesn't need to be live on tab switch.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <header style={{ padding: '1rem 1.5rem', background: '#fff', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>News Feed Lab — Stage 3: Performance</h1>
        </header>
        <Feed />
      </div>
    </QueryClientProvider>
  );
}
