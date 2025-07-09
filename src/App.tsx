import React from "react";
import AppProviders from "./providers";
import { Routing } from "./presentation/routes/index";

const App: React.FC = () => {
  return (
    <AppProviders>
      <Routing />
    </AppProviders>
  );
};

export default App;
