import React, { useEffect, useState, ReactNode, useCallback, useRef } from 'react';

import { RequestLog, CaptureStatus } from '@helpers/types/providerBuilder';

import ProviderBuilderContext from './ProviderBuilderContext';

// Message types for extension communication
const ProviderBuilderPostMessage = {
  FETCH_EXTENSION_VERSION: 'fetch_extension_version',
  START_CAPTURE: 'provider_builder_start_capture',
  STOP_CAPTURE: 'provider_builder_stop_capture',
  CLEAR_CAPTURE: 'provider_builder_clear_capture',
};

const ProviderBuilderReceiveMessage = {
  EXTENSION_VERSION_RESPONSE: 'extension_version_response',
  CAPTURE_STARTED: 'provider_builder_capture_started',
  CAPTURE_STOPPED: 'provider_builder_capture_stopped',
  CAPTURE_REQUEST: 'provider_builder_capture_request',
  CAPTURE_ERROR: 'provider_builder_capture_error',
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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

    window.postMessage({ type: ProviderBuilderPostMessage.CLEAR_CAPTURE }, '*');
    console.log('ProviderBuilder: Posted Message:', ProviderBuilderPostMessage.CLEAR_CAPTURE);
  }, []);

  /*
   * Message Handlers
   */

  const handleExtensionVersionResponse = useCallback((event: MessageEvent) => {
    console.log('ProviderBuilder: Received EXTENSION_VERSION_RESPONSE');
    const version = event.data.version;

    setExtensionVersion(version);
    setIsExtensionConnected(true);

    // Clear the interval once we receive the version
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

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

  const handleCaptureRequest = useCallback((event: MessageEvent) => {
    const request = event.data.request as RequestLog;
    if (request) {
      console.log('ProviderBuilder: Captured request:', request.url);
      setCapturedRequests((prev) => [...prev, request]);
      setCaptureStatus((prev) => ({
        ...prev,
        requestCount: prev.requestCount + 1,
      }));
    }
  }, []);

  const handleCaptureError = useCallback((event: MessageEvent) => {
    console.error('ProviderBuilder: Capture error:', event.data.error);
    setCaptureStatus((prev) => ({
      ...prev,
      isCapturing: false,
      error: event.data.error || 'Unknown capture error',
    }));
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

      if (messageType === ProviderBuilderReceiveMessage.CAPTURE_REQUEST) {
        handleCaptureRequest(event);
      }

      if (messageType === ProviderBuilderReceiveMessage.CAPTURE_ERROR) {
        handleCaptureError(event);
      }
    },
    [
      handleExtensionVersionResponse,
      handleCaptureStarted,
      handleCaptureStopped,
      handleCaptureRequest,
      handleCaptureError,
    ]
  );

  /*
   * Effects
   */

  useEffect(() => {
    // Set up the event listener
    window.addEventListener('message', handleExtensionMessage);

    // Initial delay to give extension time to initialize
    const initialCheckTimeout = setTimeout(() => {
      refreshExtensionStatus();

      // Start with frequent checks initially
      const initialFrequentChecks = setInterval(() => {
        refreshExtensionStatus();
      }, 500);

      // After 2 seconds, switch to less frequent interval
      setTimeout(() => {
        clearInterval(initialFrequentChecks);
        intervalRef.current = setInterval(refreshExtensionStatus, 5000);
      }, 2000);
    }, 100);

    return () => {
      window.removeEventListener('message', handleExtensionMessage);
      clearTimeout(initialCheckTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [handleExtensionMessage, refreshExtensionStatus]);

  return (
    <ProviderBuilderContext.Provider
      value={{
        isExtensionConnected,
        extensionVersion,

        captureStatus,
        capturedRequests,
        isCapturing: captureStatus.isCapturing,

        startCapture,
        stopCapture,
        clearCapture,

        refreshExtensionStatus,
      }}
    >
      {children}
    </ProviderBuilderContext.Provider>
  );
};

export default ProviderBuilderProvider;
