import { createContext } from "react";

import {
  BuyerTeePaymentCapture,
  ExtensionRequestMetadata,
  ProofCaptureMode,
} from "@helpers/types";

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
  platformMetadata: Record<string, MetadataInfo>;
}

const defaultValues: ExtensionProxyProofsValues = {
  isSidebarInstalled: false,
  sideBarVersion: null,
  refetchExtensionVersion: () => {},

  openNewTab: (
    _actionType: string,
    _platform: string,
    _captureMode?: ProofCaptureMode,
    _attestationServiceUrl?: string | null
  ) => {},
  platformMetadata: {} as Record<string, MetadataInfo>,
};

const ExtensionProxyProofsContext =
  createContext<ExtensionProxyProofsValues>(defaultValues);

export default ExtensionProxyProofsContext;
