import React from "react";
import ReactDOM from "react-dom";
import { Provider as RollbarProvider, ErrorBoundary as RollbarErrorBoundary } from '@rollbar/react';

import "./index.css";
import ReactErrorBoundary from './ErrorBoundary';
import App from "./App";

const rollbarConfig = {
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: "developer-production",
  autoInstrument: {
    log: false,
    network: false,
    dom: false,
    navigation: false,
  }
};

ReactDOM.render(
  <React.StrictMode>
    <ReactErrorBoundary>
      <RollbarProvider config={rollbarConfig}>
        <RollbarErrorBoundary>
          <App />
        </RollbarErrorBoundary>
      </RollbarProvider>
    </ReactErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
