import { createContext } from 'react';

import { RequestLog, CaptureStatus, DiscoveryOptions, DiscoveryResult } from '@helpers/types/providerBuilder';

interface ProviderBuilderValues {
  // Extension connection status
  isExtensionConnected: boolean;
  extensionVersion: string | null;

  // Capture state
  captureStatus: CaptureStatus;
  capturedRequests: RequestLog[];
  isCapturing: boolean;

  // Discovery state
  discoveryResult: DiscoveryResult | null;
  isDiscovering: boolean;
  discoveryError: string | null;

  // Capture actions
  startCapture: () => Promise<void>;
  stopCapture: () => Promise<RequestLog[]>;
  clearCapture: () => void;

  // Discovery actions
  discoverProvider: (options: DiscoveryOptions) => Promise<DiscoveryResult | null>;
  clearDiscovery: () => void;

  // Refresh extension status
  refreshExtensionStatus: () => void;
}

const defaultCaptureStatus: CaptureStatus = {
  isCapturing: false,
  startTime: null,
  requestCount: 0,
  error: null,
};

const defaultValues: ProviderBuilderValues = {
  isExtensionConnected: false,
  extensionVersion: null,

  captureStatus: defaultCaptureStatus,
  capturedRequests: [],
  isCapturing: false,

  discoveryResult: null,
  isDiscovering: false,
  discoveryError: null,

  startCapture: async () => {},
  stopCapture: async () => [],
  clearCapture: () => {},

  discoverProvider: async () => null,
  clearDiscovery: () => {},

  refreshExtensionStatus: () => {},
};

const ProviderBuilderContext = createContext<ProviderBuilderValues>(defaultValues);

export default ProviderBuilderContext;
