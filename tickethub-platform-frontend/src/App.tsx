import RouterLayout from "./routes";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterLayout />
      </QueryClientProvider>
    </>
  );
}

export default App;
