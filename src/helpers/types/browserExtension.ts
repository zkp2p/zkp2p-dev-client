export type ExtensionEventVersionMessage = {
  origin: string;
  data: {
    type: string;
    status: string;
    version: string;
  };
};

export type ExtensionRequestMetadataMessage = {
  origin: string;
  data: {
    type: string;
    status: string;
    metadata: ExtensionRequestMetadata[];
    platform: string;
    expiresAt: number;
    errorMessage?: string;
    buyerTeeCapture?: BuyerTeePaymentCapture | null;
    sarCredentialCapture?: SarCredentialCapture | null;
    requestId: string;
  };
};

export type ExtensionRequestMetadata = {
  recipient?: string;
  amount?: string;
  date?: string;
  currency?: string;
  paymentId?: string;
  originalIndex: number;
  hidden: boolean;
  params?: BuyerTeePaymentParams;
  [key: string]: unknown;
};

export type ProofCaptureMode = "sellerCredential" | "buyerTee";

export type BuyerTeePaymentCapture = {
  encryptedSessionMaterial: string;
};

export type BuyerTeePaymentParams = Record<string, string | number | boolean>;

export type SarCredentialBundle = {
  bundleSignature: string;
  credentialExpiresAt: string | null;
  credentialType: string;
  credentialValidatedAt: string;
  encryptedBlob: string;
  encryptedDataKey: string;
  nonce: string;
  payeeIdHash: `0x${string}`;
  platform: string;
};

export type SarCredentialCapture = {
  credentialBundle: SarCredentialBundle;
  offchainId: string;
};

export const ExtensionPostMessage = {
  OPEN_NEW_TAB: "open_new_tab",
  FETCH_EXTENSION_VERSION: "fetch_extension_version",
};

export const ExtensionReceiveMessage = {
  EXTENSION_VERSION_RESPONSE: "extension_version_response",
  METADATA_MESSAGES_RESPONSE: "metadata_messages_response",
};
