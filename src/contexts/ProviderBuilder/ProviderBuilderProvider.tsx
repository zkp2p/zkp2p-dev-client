import React, { useEffect, useState, ReactNode, useCallback, useRef } from 'react';

import { RequestLog, CaptureStatus, DiscoveryOptions, DiscoveryResult, ProviderSettings, ProviderSubmission } from '@helpers/types/providerBuilder';
import { getPresignedUrl, uploadSubmission } from '@helpers/api/providerSubmission';

import ProviderBuilderContext from './ProviderBuilderContext';

// Extend Window interface to include peer API
declare global {
  interface Window {
    peer?: {
      discoverProvider?: (options: DiscoveryOptions) => Promise<DiscoveryResult>;
      exportCapturedRequests?: () => Promise<RequestLog[]>;
      importCapturedRequests?: (requests: RequestLog[]) => Promise<{ success: boolean; count: number }>;
    };
  }
}

// Message types for extension communication
// These must match the extension's PageToContentAction and ContentToPageAction types
const ProviderBuilderPostMessage = {
  FETCH_EXTENSION_VERSION: 'fetch_extension_version',
  START_CAPTURE: 'start_provider_capture',
  STOP_CAPTURE: 'stop_provider_capture',
  GET_CAPTURE_STATUS: 'get_capture_status',
};

const ProviderBuilderReceiveMessage = {
  EXTENSION_VERSION_RESPONSE: 'extension_version_response',
  CAPTURE_STARTED: 'provider_capture_started',
  CAPTURE_STOPPED: 'provider_capture_stopped',
  CAPTURE_STATUS: 'capture_status_response',
};

interface ProvidersProps {
  children: ReactNode;
}

const ProviderBuilderProvider = ({ children }: ProvidersProps) => {
  /*
   * State
   */

  const [isExtensionConnected, setIsExtensionConnected] = useState<boolean>(false);
  const [extensionVersion, setExtensionVersion] = useState<string | null>(null);
  const [capturedRequests, setCapturedRequests] = useState<RequestLog[]>([]);
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>({
    isCapturing: false,
    startTime: null,
    requestCount: 0,
    error: null,
  });

  // Discovery state
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const frequentChecksRef = useRef<NodeJS.Timeout | null>(null);
  const slowIntervalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopCaptureResolveRef = useRef<((requests: RequestLog[]) => void) | null>(null);

  /*
   * Extension Post Messages
   */

  const refreshExtensionStatus = useCallback(() => {
    window.postMessage({ type: ProviderBuilderPostMessage.FETCH_EXTENSION_VERSION }, '*');
    console.log('ProviderBuilder: Posted Message:', ProviderBuilderPostMessage.FETCH_EXTENSION_VERSION);
  }, []);

  const startCapture = useCallback(async (): Promise<void> => {
    setCapturedRequests([]);
    setCaptureStatus({
      isCapturing: true,
      startTime: Date.now(),
      requestCount: 0,
      error: null,
    });

    window.postMessage({ type: ProviderBuilderPostMessage.START_CAPTURE }, '*');
    console.log('ProviderBuilder: Posted Message:', ProviderBuilderPostMessage.START_CAPTURE);
  }, []);

  const stopCapture = useCallback((): Promise<RequestLog[]> => {
    return new Promise((resolve) => {
      stopCaptureResolveRef.current = resolve;

      window.postMessage({ type: ProviderBuilderPostMessage.STOP_CAPTURE }, '*');
      console.log('ProviderBuilder: Posted Message:', ProviderBuilderPostMessage.STOP_CAPTURE);

      // Timeout fallback - resolve with current requests after 2 seconds
      setTimeout(() => {
        if (stopCaptureResolveRef.current) {
          stopCaptureResolveRef.current(capturedRequests);
          stopCaptureResolveRef.current = null;
        }
      }, 2000);
    });
  }, [capturedRequests]);

  const clearCapture = useCallback(() => {
    setCapturedRequests([]);
    setCaptureStatus({
      isCapturing: false,
      startTime: null,
      requestCount: 0,
      error: null,
    });
    console.log('ProviderBuilder: Cleared capture state');
  }, []);

  /*
   * Import/Export Functions
   */

  const exportCapturedRequests = useCallback(async (): Promise<RequestLog[]> => {
    console.log('ProviderBuilder: Exporting captured requests');

    // Check if extension API is available
    if (!window.peer?.exportCapturedRequests) {
      console.error('ProviderBuilder: Export API not available. Please update the ZKP2P extension.');
      return [];
    }

    try {
      const requests = await window.peer.exportCapturedRequests();
      console.log('ProviderBuilder: Exported', requests.length, 'requests');
      return requests;
    } catch (error) {
      console.error('ProviderBuilder: Export error:', error);
      return [];
    }
  }, []);

  const importCapturedRequests = useCallback(async (requests: RequestLog[]): Promise<{ success: boolean; count: number }> => {
    console.log('ProviderBuilder: Importing', requests.length, 'requests');

    // Check if extension API is available
    if (!window.peer?.importCapturedRequests) {
      console.error('ProviderBuilder: Import API not available. Please update the ZKP2P extension.');
      return { success: false, count: 0 };
    }

    try {
      const result = await window.peer.importCapturedRequests(requests);
      console.log('ProviderBuilder: Import result:', result);

      if (result.success) {
        // Update local state with imported requests
        setCapturedRequests(requests);
        setCaptureStatus(prev => ({
          ...prev,
          requestCount: requests.length,
        }));
      }

      return result;
    } catch (error) {
      console.error('ProviderBuilder: Import error:', error);
      return { success: false, count: 0 };
    }
  }, []);

  /*
   * Discovery Functions
   */

  const discoverProvider = useCallback(async (options: DiscoveryOptions): Promise<DiscoveryResult | null> => {
    console.log('ProviderBuilder: Starting discovery with options:', options);

    // Check if extension API is available
    if (!window.peer?.discoverProvider) {
      const errorMsg = 'Discovery API not available. Please update the ZKP2P extension.';
      console.error('ProviderBuilder:', errorMsg);
      setDiscoveryError(errorMsg);
      return null;
    }

    setIsDiscovering(true);
    setDiscoveryError(null);
    setDiscoveryResult(null);

    try {
      const result = await window.peer.discoverProvider(options);
      console.log('ProviderBuilder: Discovery result:', result);

      setDiscoveryResult(result);

      if (!result.success) {
        const errorMsg = result.error || 'Discovery failed without error message';
        setDiscoveryError(errorMsg);
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown discovery error';
      console.error('ProviderBuilder: Discovery error:', errorMsg);
      setDiscoveryError(errorMsg);
      return null;
    } finally {
      setIsDiscovering(false);
    }
  }, []);

  const clearDiscovery = useCallback(() => {
    setDiscoveryResult(null);
    setDiscoveryError(null);
    setIsDiscovering(false);
  }, []);

  /*
   * Submission Functions
   */

  const submitProvider = useCallback(async (
    platform: string,
    providerTemplate: ProviderSettings,
    countryCode?: string,
    submitterAddress?: string
  ): Promise<string | null> => {
    console.log('ProviderBuilder: Starting submission for platform:', platform);

    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionId(null);

    try {
      // 1. Get presigned URL from Curator
      console.log('ProviderBuilder: Getting presigned URL...');
      const { uploadUrl, submissionId: newSubmissionId } = await getPresignedUrl(
        platform,
        submitterAddress
      );

      // 2. Build submission payload
      const submission: ProviderSubmission = {
        id: newSubmissionId,
        submittedAt: new Date().toISOString(),
        submittedBy: submitterAddress,
        platform,
        countryCode,
        providerTemplate,
        discovery: {
          confidence: discoveryResult?.confidence || 0,
          sampleTransactions: discoveryResult?.sampleTransactions || [],
          candidateEndpoints: discoveryResult?.debug?.candidateEndpoints
            ? Array(discoveryResult.debug.candidateEndpoints).fill('').map((_, i) => `endpoint_${i}`)
            : [],
          llmCallCount: discoveryResult?.debug?.llmCalls || 0,
          totalLatencyMs: discoveryResult?.debug?.totalLatencyMs || 0,
        },
      };

      // 3. Upload to S3 via presigned URL
      console.log('ProviderBuilder: Uploading submission to S3...');
      await uploadSubmission(uploadUrl, submission);

      console.log('ProviderBuilder: Submission successful, ID:', newSubmissionId);
      setSubmissionId(newSubmissionId);

      return newSubmissionId;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown submission error';
      console.error('ProviderBuilder: Submission error:', errorMsg);
      setSubmissionError(errorMsg);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [discoveryResult]);

  const clearSubmission = useCallback(() => {
    setSubmissionId(null);
    setSubmissionError(null);
    setIsSubmitting(false);
  }, []);

  /*
   * Message Handlers
   */

  const clearPollingTimers = useCallback(() => {
    if (initialCheckTimeoutRef.current) {
      clearTimeout(initialCheckTimeoutRef.current);
      initialCheckTimeoutRef.current = null;
    }

    if (slowIntervalTimeoutRef.current) {
      clearTimeout(slowIntervalTimeoutRef.current);
      slowIntervalTimeoutRef.current = null;
    }

    if (frequentChecksRef.current) {
      clearInterval(frequentChecksRef.current);
      frequentChecksRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleExtensionVersionResponse = useCallback((event: MessageEvent) => {
    console.log('ProviderBuilder: Received EXTENSION_VERSION_RESPONSE');
    const version = event.data.version;

    setExtensionVersion(version);
    setIsExtensionConnected(true);

    clearPollingTimers();
  }, [clearPollingTimers]);

  const handleCaptureStarted = useCallback(() => {
    console.log('ProviderBuilder: Capture started');
    setCaptureStatus((prev) => ({
      ...prev,
      isCapturing: true,
      startTime: Date.now(),
      error: null,
    }));
  }, []);

  const handleCaptureStopped = useCallback((event: MessageEvent) => {
    console.log('ProviderBuilder: Capture stopped');
    const requests = event.data.requests || [];

    setCapturedRequests(requests);
    setCaptureStatus((prev) => ({
      ...prev,
      isCapturing: false,
      requestCount: requests.length,
    }));

    // Resolve the stopCapture promise if pending
    if (stopCaptureResolveRef.current) {
      stopCaptureResolveRef.current(requests);
      stopCaptureResolveRef.current = null;
    }
  }, []);


  const handleExtensionMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const messageType = event.data.type;

      if (messageType === ProviderBuilderReceiveMessage.EXTENSION_VERSION_RESPONSE) {
        handleExtensionVersionResponse(event);
      }

      if (messageType === ProviderBuilderReceiveMessage.CAPTURE_STARTED) {
        handleCaptureStarted();
      }

      if (messageType === ProviderBuilderReceiveMessage.CAPTURE_STOPPED) {
        handleCaptureStopped(event);
      }
    },
    [
      handleExtensionVersionResponse,
      handleCaptureStarted,
      handleCaptureStopped,
    ]
  );

  /*
   * Effects
   */

  useEffect(() => {
    // Set up the event listener
    window.addEventListener('message', handleExtensionMessage);

    // Initial delay to give extension time to initialize
    initialCheckTimeoutRef.current = setTimeout(() => {
      refreshExtensionStatus();

      // Start with frequent checks initially
      frequentChecksRef.current = setInterval(() => {
        refreshExtensionStatus();
      }, 500);

      // After 2 seconds, switch to less frequent interval
      slowIntervalTimeoutRef.current = setTimeout(() => {
        if (frequentChecksRef.current) {
          clearInterval(frequentChecksRef.current);
          frequentChecksRef.current = null;
        }
        intervalRef.current = setInterval(refreshExtensionStatus, 5000);
      }, 2000);
    }, 100);

    return () => {
      window.removeEventListener('message', handleExtensionMessage);
      clearPollingTimers();
    };
  }, [clearPollingTimers, handleExtensionMessage, refreshExtensionStatus]);

  return (
    <ProviderBuilderContext.Provider
      value={{
        isExtensionConnected,
        extensionVersion,

        captureStatus,
        capturedRequests,
        isCapturing: captureStatus.isCapturing,

        discoveryResult,
        isDiscovering,
        discoveryError,

        isSubmitting,
        submissionError,
        submissionId,

        startCapture,
        stopCapture,
        clearCapture,

        exportCapturedRequests,
        importCapturedRequests,

        discoverProvider,
        clearDiscovery,

        submitProvider,
        clearSubmission,

        refreshExtensionStatus,
      }}
    >
      {children}
    </ProviderBuilderContext.Provider>
  );
};

export default ProviderBuilderProvider;
