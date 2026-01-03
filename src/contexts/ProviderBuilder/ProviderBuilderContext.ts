import { createContext } from 'react';

import { RequestLog, CaptureStatus } from '@helpers/types/providerBuilder';

interface ProviderBuilderValues {
  // Extension connection status
  isExtensionConnected: boolean;
  extensionVersion: string | null;

  // Capture state
  captureStatus: CaptureStatus;
  capturedRequests: RequestLog[];
  isCapturing: boolean;

  // Capture actions
  startCapture: () => Promise<void>;
  stopCapture: () => Promise<RequestLog[]>;
  clearCapture: () => void;

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

  startCapture: async () => {},
  stopCapture: async () => [],
  clearCapture: () => {},

  refreshExtensionStatus: () => {},
};

const ProviderBuilderContext = createContext<ProviderBuilderValues>(defaultValues);

export default ProviderBuilderContext;
