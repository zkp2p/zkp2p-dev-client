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
    sarCredentialStatus?: SarCredentialStatus | null;
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

export type SarCredentialCapture = {
  captureId?: string;
  offchainId?: string;
  payeeId?: string;
  platform?: string;
  [key: string]: unknown;
};

export type SarCredentialStatus = {
  credentialType?: string | null;
  payeeIdHash?: string;
  platform?: string;
  status?: string;
  [key: string]: unknown;
};

export const ExtensionPostMessage = {
  OPEN_NEW_TAB: "open_new_tab",
  FETCH_EXTENSION_VERSION: "fetch_extension_version",
  OPEN_SIDEBAR: "open_sidebar",
  FETCH_PROVIDER_BASE_URL: "fetch_provider_base_url",
};

export const ExtensionReceiveMessage = {
  EXTENSION_VERSION_RESPONSE: "extension_version_response",
  METADATA_MESSAGES_RESPONSE: "metadata_messages_response",
  FETCH_PROVIDER_BASE_URL_RESPONSE: "fetch_provider_base_url_response",
};
