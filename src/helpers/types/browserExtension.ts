export type ExtensionEventMessage = {
  origin: string;
  data: {
    type: string;
    providersBaseUrl: string;
    status: string;
    proofId?: string;
    requestHistory?: {
      notaryRequests: ExtensionNotaryProofRequest[];
      notaryRequest: ExtensionNotaryProofRequest;
    };
    platform?: string;
  }
};

export type ExtensionEventVersionMessage = {
  origin: string;
  data: {
    type: string;
    status: string;
    version: string;
  }
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
    requestId: string;
  }
};

export type ExtensionRequestMetadata = {
  recipient?: string;
  amount?: string;
  date?: string;
  currency?: string;
  originalIndex: number;
  hidden: boolean;
  [key: string]: unknown;
};

export type ProofCaptureMode = "sellerCredential" | "buyerTee";

export type BuyerTeePaymentCapture = {
  encryptedSessionMaterial: string;
  params: BuyerTeePaymentParams[];
};

export type BuyerTeePaymentParams = Record<string, string | number | boolean>;

export type ExtensionNotaryProofRequest = {
  body: string,
  headers: string,
  id: string,
  maxTranscriptSize: number,
  method: string,
  notaryUrl: string,
  proof: any,
  error: any,
  secretHeaders: string[],
  secretResps: string[],
  status: string,
  url: string,
  verification: any,
  metadata: any,
  websocketProxyUrl: string,
};

export const ExtensionPostMessage = {
  OPEN_NEW_TAB: "open_new_tab",
  FETCH_EXTENSION_VERSION: "fetch_extension_version",
  FETCH_PROOF_BY_ID: "fetch_proof_by_id",
  GENERATE_PROOF: "generate_proof",
  OPEN_SIDEBAR: "open_sidebar",
  FETCH_PROVIDER_BASE_URL: "fetch_provider_base_url",
};

export const ExtensionReceiveMessage = {
  EXTENSION_VERSION_RESPONSE: "extension_version_response",
  METADATA_MESSAGES_RESPONSE: "metadata_messages_response",
  FETCH_PROOF_BY_ID_RESPONSE: "fetch_proof_by_id_response",
  FETCH_PROOF_REQUEST_ID_RESPONSE: "fetch_proof_request_id_response",
  FETCH_PROVIDER_BASE_URL_RESPONSE: 'fetch_provider_base_url_response',
};
