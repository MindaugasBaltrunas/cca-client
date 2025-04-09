import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { store } from "./store/store";
import { FormikProvider } from "./shared/providers/formik/formikProvider";
import { PaginationProvider } from "./shared/providers/paginationProvider";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders component
 * Combines all application providers in the correct order
 */
const AppProviders: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <FormikProvider
            config={{
              validateOnBlur: true,
              validateOnChange: false,
              validateOnMount: false,
            }}
          >
            <PaginationProvider>
                  {children}
            </PaginationProvider>
          </FormikProvider>
        </Router>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

export default AppProviders;
