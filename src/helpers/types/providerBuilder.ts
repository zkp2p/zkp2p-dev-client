/**
 * Types for the Provider Builder feature
 */

/**
 * Represents a captured HTTP request from network traffic
 * Matches the extension's RequestLog interface
 */
export interface RequestLog {
  id: string;
  url: string;
  method: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  statusCode?: number;
  timestamp: number;
  initiator?: string;
  type?: string;
}

/**
 * Status of the network traffic capture
 */
export interface CaptureStatus {
  isCapturing: boolean;
  startTime: number | null;
  requestCount: number;
  error: string | null;
}

/**
 * LLM settings for discovery agent
 */
export interface LLMSettings {
  apiKey?: string;
  model?: string;
  proxyUrl?: string;
}

/**
 * Options for the discovery agent
 */
export interface DiscoveryOptions {
  platformName: string;
  authUrl: string;
  countryCode?: string;
  llmSettings?: LLMSettings;
}

/**
 * Field discovery mapping - paths to extract transaction fields
 */
export interface FieldDiscovery {
  amount: string;
  recipient: string;
  date: string;
  paymentId: string;
  currency?: string;
}

/**
 * Discovered endpoint information
 */
export interface DiscoveredEndpoint {
  url: string;
  urlRegex: string;
  method: string;
  isTransactionList: boolean;
}

/**
 * Discovered structure of the transaction data
 */
export interface DiscoveredStructure {
  transactionArrayPath: string;
  fields: FieldDiscovery;
}

/**
 * Sample transaction extracted during discovery
 */
export interface SampleTransaction {
  amount: string;
  recipient: string;
  date: string;
  paymentId: string;
  currency?: string;
}

/**
 * Debug information from discovery process
 */
export interface DiscoveryDebug {
  analyzedRequests: number;
  candidateEndpoints: number;
  llmCalls: number;
  totalLatencyMs: number;
}

/**
 * Discovery Agent result from Phase 2
 */
export interface DiscoveryResult {
  success: boolean;
  confidence: number;
  endpoint: DiscoveredEndpoint | null;
  structure: DiscoveredStructure | null;
  sampleTransactions: SampleTransaction[];
  providerTemplate: ProviderSettings | null;
  debug: DiscoveryDebug;
  error?: string;
}

/**
 * Provider settings object (matches extension's ProviderSettings)
 */
export interface ProviderSettings {
  name: string;
  logoUrl?: string;
  authUrl: string;
  countryCode?: string;
  hostUrl: string;
  urlRegex: string;
  httpMethod: string;
  responseType: string;
  responseExtraction?: {
    path: string;
    type: string;
  };
  paymentIdPath: string;
  paymentIdPattern?: string;
  amountPath: string;
  amountPattern?: string;
  datePath: string;
  datePattern?: string;
  counterpartyPath: string;
  counterpartyPattern?: string;
  currencyPath?: string;
  currencyPattern?: string;
}

/**
 * Provider template structure
 */
export interface ProviderTemplate {
  name: string;
  description?: string;
  authUrl: string;
  countryCode?: string;
  endpoints: ProviderEndpoint[];
  extractionRules: ExtractionRule[];
}

/**
 * Provider endpoint configuration
 */
export interface ProviderEndpoint {
  url: string;
  method: string;
  headers?: Record<string, string>;
  bodyPattern?: string;
}

/**
 * Data extraction rule for provider
 */
export interface ExtractionRule {
  field: string;
  path: string;
  type: 'json' | 'regex' | 'xpath';
  pattern?: string;
}

/**
 * Response from the presigned URL endpoint
 */
export interface PresignedUrlResponse {
  uploadUrl: string;           // Presigned S3 PUT URL (expires in 15 min)
  submissionId: string;        // UUID for this submission
  objectKey: string;           // S3 object key: submissions/{date}/{id}.json
}

/**
 * Status of a provider submission
 */
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

/**
 * Discovery metadata included in submission
 */
export interface SubmissionDiscoveryMetadata {
  confidence: number;
  sampleTransactions: SampleTransaction[];
  candidateEndpoints: string[];
  llmCallCount: number;
  totalLatencyMs: number;
}

/**
 * Provider submission payload uploaded to S3
 * Matches the format defined in the Provider Builder plan
 */
export interface ProviderSubmission {
  id: string;                      // Submission UUID
  submittedAt: string;             // ISO 8601
  submittedBy?: string;            // Optional wallet address

  platform: string;
  countryCode?: string;

  providerTemplate: ProviderSettings;

  discovery: SubmissionDiscoveryMetadata;
}

/**
 * Legacy submission data for provider review (deprecated)
 * @deprecated Use ProviderSubmission instead
 */
export interface LegacyProviderSubmission {
  platformName: string;
  authUrl: string;
  countryCode?: string;
  template: ProviderTemplate;
  capturedRequests: RequestLog[];
  submittedAt: number;
  submittedBy?: string;
  status: SubmissionStatus;
}

/**
 * Platform details input by user
 */
export interface PlatformDetails {
  platformName: string;
  authUrl: string;
  countryCode: string;
}
