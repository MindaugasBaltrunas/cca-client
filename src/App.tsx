import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppProviders from "./providers";
import Routing from "./presentation/routes/Routing";

const App: React.FC = () => {
  return (
    <AppProviders>
      <Routing />
    </AppProviders>
  );
};

export default App;
