import { createContext } from 'react';

import {
  ExtensionDiscoveryDraft,
  ExtensionNotaryProofRequest,
  ExtensionRequestMetadata,
} from '@helpers/types';

export interface MetadataInfo {
  metadata: ExtensionRequestMetadata[] | null;
  expiresAt: number | null;
}

interface ExtensionProxyProofsValues {
  isSidebarInstalled: boolean;
  sideBarVersion: string | null;
  refetchExtensionVersion: () => void;

  openNewTab: (actionType: string, platform: string) => void;
  openSidebar: (path: string) => void;
  platformMetadata: Record<string, MetadataInfo>;

  paymentProof: ExtensionNotaryProofRequest | null;
  generatePaymentProof: (platform: string, intentHash: string, originalIndex: number, proofIndex?: number) => void;
  fetchPaymentProof: (platform: string) => void;
  resetProofState: () => void;

  discoveryStatus: 'idle' | 'started' | 'stopped' | 'error';
  discoverySessionId: string | null;
  discoveryDraft: ExtensionDiscoveryDraft | null;
  discoveryError: string | null;
  startDiscoverySession: (args: { platform: string; actionType: string }) => void;
  stopDiscoverySession: () => void;
  fetchDiscoveryDraft: () => void;
  resetDiscoveryState: () => void;
};

const defaultValues: ExtensionProxyProofsValues = {
  isSidebarInstalled: false,
  sideBarVersion: null,
  refetchExtensionVersion: () => { },

  openNewTab: (_actionType: string, _platform: string) => { },
  openSidebar: (_path: string) => { },
  platformMetadata: {} as Record<string, MetadataInfo>,

  paymentProof: null,
  generatePaymentProof: (_platform: string, _intentHash: string, _originalIndex: number, _proofIndex?: number) => { },
  fetchPaymentProof: (_platform: string) => { },
  resetProofState: () => { },

  discoveryStatus: 'idle',
  discoverySessionId: null,
  discoveryDraft: null,
  discoveryError: null,
  startDiscoverySession: (_args: { platform: string; actionType: string }) => { },
  stopDiscoverySession: () => { },
  fetchDiscoveryDraft: () => { },
  resetDiscoveryState: () => { },
};

const ExtensionProxyProofsContext = createContext<ExtensionProxyProofsValues>(defaultValues);

export default ExtensionProxyProofsContext;
