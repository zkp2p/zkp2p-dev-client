import { createContext } from 'react';

import { RequestLog, CaptureStatus, DiscoveryOptions, DiscoveryResult, ProviderSettings } from '@helpers/types/providerBuilder';

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

  // Submission state
  isSubmitting: boolean;
  submissionError: string | null;
  submissionId: string | null;

  // Capture actions
  startCapture: () => Promise<void>;
  stopCapture: () => Promise<RequestLog[]>;
  clearCapture: () => void;

  // Import/Export actions
  exportCapturedRequests: () => Promise<RequestLog[]>;
  importCapturedRequests: (requests: RequestLog[]) => Promise<{ success: boolean; count: number }>;

  // Discovery actions
  discoverProvider: (options: DiscoveryOptions) => Promise<DiscoveryResult | null>;
  clearDiscovery: () => void;

  // Submission actions
  submitProvider: (
    platform: string,
    providerTemplate: ProviderSettings,
    countryCode?: string,
    submitterAddress?: string
  ) => Promise<string | null>;
  clearSubmission: () => void;

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

  isSubmitting: false,
  submissionError: null,
  submissionId: null,

  startCapture: async () => {},
  stopCapture: async () => [],
  clearCapture: () => {},

  exportCapturedRequests: async () => [],
  importCapturedRequests: async () => ({ success: false, count: 0 }),

  discoverProvider: async () => null,
  clearDiscovery: () => {},

  submitProvider: async () => null,
  clearSubmission: () => {},

  refreshExtensionStatus: () => {},
};

const ProviderBuilderContext = createContext<ProviderBuilderValues>(defaultValues);

export default ProviderBuilderContext;
