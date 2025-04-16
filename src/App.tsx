import React, { ReactNode } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";

import useMediaQuery from '@hooks/useMediaQuery';

import { BottomNav } from "@components/layouts/BottomNav";

import { Home } from "./pages/Home";
import { Privacy } from "./pages/Privacy";
import { Tos } from "./pages/Tos";

import ExtensionProxyProofsProvider from './contexts/ExtensionProxyProofs/ExtensionProxyProofsProvider';
import { ModalSettingsProvider } from 'contexts/ModalSettings';

import "./App.css";
import "./styles.css";

const App = () => {
  /*
   * Context
   */

  const currentDeviceSize = useMediaQuery();

  /*
   * Component
   */

  return (
    <Router>
      <Providers>
        <div className="app-container">
          {/* <TopNav /> */}
          <div className="app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pp" element={<Privacy />} />
              <Route path="/tos" element={<Tos />} />
              <Route element={<>Not found</>} />
            </Routes>
          </div>

          {(currentDeviceSize === 'mobile') &&
            <BottomNav />
          }
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

  [ModalSettingsProvider, {}],
];

const ProviderTree = buildProvidersTree(providersWithProps);

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <ProviderTree>{children}</ProviderTree>;
}

export default App;
