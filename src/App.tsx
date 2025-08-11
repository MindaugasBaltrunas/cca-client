import React from "react";
import AppProviders from "./providers";
import { Routing } from "./presentation/routes/Routing";
import { ErrorBoundary } from "./presentation/routes/components/ErrorBoundary";


const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Routing />
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
