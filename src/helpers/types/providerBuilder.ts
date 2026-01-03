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
 * Submission data for provider review
 */
export interface ProviderSubmission {
  platformName: string;
  authUrl: string;
  countryCode?: string;
  template: ProviderTemplate;
  capturedRequests: RequestLog[];
  submittedAt: number;
  submittedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Platform details input by user
 */
export interface PlatformDetails {
  platformName: string;
  authUrl: string;
  countryCode: string;
}
