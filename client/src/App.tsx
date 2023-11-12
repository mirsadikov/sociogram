import Routes from './routes/routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './main.css';
import { Provider } from 'react-redux';
import { store } from './store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 5 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Routes />
          <Toaster />
        </QueryClientProvider>
      </Provider>
    </>
  );
}

export default App;

export { queryClient };
