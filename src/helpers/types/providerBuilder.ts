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
 * Placeholder for Phase 2 - Discovery Agent result
 */
export interface DiscoveryResult {
  success: boolean;
  provider: ProviderTemplate | null;
  suggestions: string[];
  error: string | null;
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
