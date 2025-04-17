import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";

import { Home } from "./pages/Home";
import { TopNav } from '@components/layouts/TopNav';

import ExtensionProxyProofsProvider from './contexts/ExtensionProxyProofs/ExtensionProxyProofsProvider';

import "./App.css";
import "./styles.css";

const App = () => {
  /*
   * Component
   */

  return (
    <Router>
      <Providers>
        <div className="app-container">
          <TopNav />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route element={<>Not found</>} />
            </Routes>
          </div>
        </div>
      </Providers>
    </Router>
  );
};

type ProvidersType = [React.ElementType, Record<string, unknown>];
type ChildrenType = {
  children: Array<React.ElementType>;
};

export const buildProvidersTree = (
  componentsWithProps: Array<ProvidersType>,
) => {
  const initialComponent = ({children}: {children: React.ReactNode}) => <>{children}</>;
  return componentsWithProps.reduce(
    (
      AccumulatedComponents: React.ElementType,
      [Provider, props = {}]: ProvidersType,
    ) => {
      return ({children}: ChildrenType) => {
        return (
          <AccumulatedComponents>
            <Provider {...props}>{children}</Provider>
          </AccumulatedComponents>
        );
      };
    },
    initialComponent,
  );
};

const providersWithProps: ProvidersType[] = [
  [ExtensionProxyProofsProvider, {}],
];

const ProviderTree = buildProvidersTree(providersWithProps);

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <ProviderTree>{children}</ProviderTree>;
}

export default App;
