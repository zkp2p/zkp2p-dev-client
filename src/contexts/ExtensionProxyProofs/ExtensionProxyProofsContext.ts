import { createContext } from 'react';

import {
  BuyerTeePaymentCapture,
  ExtensionNotaryProofRequest,
  ExtensionRequestMetadata,
  ProofCaptureMode,
} from '@helpers/types';

export interface MetadataInfo {
  metadata: ExtensionRequestMetadata[] | null;
  expiresAt: number | null;
  buyerTeeCapture: BuyerTeePaymentCapture | null;
  errorMessage: string | null;
}

interface ExtensionProxyProofsValues {
  isSidebarInstalled: boolean;
  sideBarVersion: string | null;
  refetchExtensionVersion: () => void;

  openNewTab: (
    actionType: string,
    platform: string,
    captureMode?: ProofCaptureMode,
    attestationServiceUrl?: string | null
  ) => void;
  openSidebar: (path: string) => void;
  platformMetadata: Record<string, MetadataInfo>;

  paymentProof: ExtensionNotaryProofRequest | null;
  generatePaymentProof: (platform: string, intentHash: string, originalIndex: number, proofIndex?: number) => void;
  fetchPaymentProof: (platform: string) => void;
  resetProofState: () => void;
};

const defaultValues: ExtensionProxyProofsValues = {
  isSidebarInstalled: false,
  sideBarVersion: null,
  refetchExtensionVersion: () => { },

  openNewTab: (
    _actionType: string,
    _platform: string,
    _captureMode?: ProofCaptureMode,
    _attestationServiceUrl?: string | null
  ) => { },
  openSidebar: (_path: string) => { },
  platformMetadata: {} as Record<string, MetadataInfo>,

  paymentProof: null,
  generatePaymentProof: (_platform: string, _intentHash: string, _originalIndex: number, _proofIndex?: number) => { },
  fetchPaymentProof: (_platform: string) => { },
  resetProofState: () => { },
};

const ExtensionProxyProofsContext = createContext<ExtensionProxyProofsValues>(defaultValues);

export default ExtensionProxyProofsContext;
