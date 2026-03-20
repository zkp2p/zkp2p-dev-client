import React, { useEffect, useState, ReactNode, useCallback, useRef } from 'react';

import {
  ExtensionEventMessage,
  ExtensionNotaryProofRequest,
  ExtensionEventVersionMessage,
  ExtensionPostMessage,
  ExtensionReceiveMessage,
  ExtensionRequestMetadataMessage,
} from '@helpers/types';

import ExtensionProxyProofsContext, { MetadataInfo } from './ExtensionProxyProofsContext';

interface ProvidersProps {
  children: ReactNode;
};

type PendingProofRequest = {
  reject: (error: Error) => void;
  resolve: (proofId: string) => void;
  timeoutId: NodeJS.Timeout;
};

const PROOF_ID_RESPONSE_TIMEOUT_MS = 30000;

const ExtensionNotarizationsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  // no-op

  /*
   * State
   */

  const [isSidebarInstalled, setIsSidebarInstalled] = useState<boolean>(false);
  const [sideBarVersion, setSideBarVersion] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<ExtensionNotaryProofRequest | null>(null);

  const [platformMetadata, setPlatformMetadata] = useState<Record<string, MetadataInfo>>({} as Record<string, MetadataInfo>);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const frequentChecksIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const switchToNormalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingProofRequestRef = useRef<PendingProofRequest | null>(null);

  //
  // EXTENSION POST MESSAGES
  //

  const refetchExtensionVersion = useCallback(() => {
    window.postMessage({ type: ExtensionPostMessage.FETCH_EXTENSION_VERSION }, '*');
    console.log('Posted Message: ', ExtensionPostMessage.FETCH_EXTENSION_VERSION);
  }, []);

  const clearVersionPollingTimers = useCallback(() => {
    if (initialCheckTimeoutRef.current) {
      clearTimeout(initialCheckTimeoutRef.current);
      initialCheckTimeoutRef.current = null;
    }

    if (frequentChecksIntervalRef.current) {
      clearInterval(frequentChecksIntervalRef.current);
      frequentChecksIntervalRef.current = null;
    }

    if (switchToNormalTimeoutRef.current) {
      clearTimeout(switchToNormalTimeoutRef.current);
      switchToNormalTimeoutRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const openNewTab = (actionType: string, platform: string) => {
    window.postMessage({ type: ExtensionPostMessage.OPEN_NEW_TAB, actionType, platform }, '*');

    console.log('Posted Message: ', ExtensionPostMessage.OPEN_NEW_TAB, actionType, platform);
  };

  const openSidebar = (route: string) => {
    window.postMessage({ type: ExtensionPostMessage.OPEN_SIDEBAR, route }, '*');

    console.log('Posted Message: ', ExtensionPostMessage.OPEN_SIDEBAR, route);
  };

  /*
   * Generate Transfer Proof
   */

  const resetProofState = useCallback(() => {
    console.log('resetting proof state');

    setPaymentProof(null);
  }, []);

  const clearPendingProofRequest = useCallback(() => {
    const pendingProofRequest = pendingProofRequestRef.current;

    if (!pendingProofRequest) {
      return null;
    }

    clearTimeout(pendingProofRequest.timeoutId);
    pendingProofRequestRef.current = null;

    return pendingProofRequest;
  }, []);

  const rejectPendingProofRequest = useCallback((message: string) => {
    const pendingProofRequest = clearPendingProofRequest();

    if (!pendingProofRequest) {
      return;
    }

    pendingProofRequest.reject(new Error(message));
  }, [clearPendingProofRequest]);

  const generatePaymentProof = useCallback((
    platform: string,
    intentHash: string,
    originalIndex: number,
    proofIndex?: number,
  ) => {
    if (pendingProofRequestRef.current) {
      return Promise.reject(new Error('A proof request is already in progress.'));
    }

    resetProofState();

    return new Promise<string>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pendingProofRequestRef.current = null;
        reject(new Error('Timed out waiting for the extension to return a proof id.'));
      }, PROOF_ID_RESPONSE_TIMEOUT_MS);

      pendingProofRequestRef.current = {
        resolve,
        reject,
        timeoutId,
      };

      try {
        window.postMessage({
          type: ExtensionPostMessage.GENERATE_PROOF,
          intentHash,
          originalIndex,
          platform,
          proofIndex,
        }, '*');

        console.log('Posted Message: ', intentHash, originalIndex, platform, proofIndex);
      } catch (error) {
        clearTimeout(timeoutId);
        pendingProofRequestRef.current = null;
        reject(error instanceof Error ? error : new Error('Failed to post generate_proof message.'));
      }
    });
  }, [resetProofState]);

  /*
   * Fetch Transfer Proof
   */

  const fetchPaymentProof = useCallback((nextProofId: string) => {
    window.postMessage({ type: ExtensionPostMessage.FETCH_PROOF_BY_ID, proofId: nextProofId }, '*');
  }, []);

  /*
   * Handlers
   */

  const handleExtensionVersionMessageReceived = useCallback(function(event: ExtensionEventVersionMessage) {
    console.log('Client received EXTENSION_VERSION_RESPONSE message');
    console.log('event.data', event.data);  

    const version = event.data.version;

    setSideBarVersion(version);
    setIsSidebarInstalled(true);
    clearVersionPollingTimers();
  }, [clearVersionPollingTimers]);

  const handleExtensionMetadataMessagesResponse = useCallback(function(event: ExtensionRequestMetadataMessage) {
    console.log('Client received METADATA_MESSAGES_RESPONSE message');
    console.log('event.data', event.data);

    const platform = event.data.platform as string;
    
    setPlatformMetadata(prev => ({
      ...prev,
      [platform]: {
        metadata: event.data.metadata,
        expiresAt: event.data.expiresAt
      }
    }));
  }, []);

  const handleExtensionProofIdMessageReceived = useCallback(function(event: ExtensionEventMessage) {
    console.log('Client received FETCH_PROOF_REQUEST_ID_RESPONSE message');

    if (!event.data.proofId) {
      rejectPendingProofRequest('Extension returned no proof id.');
      return;
    }

    const pendingProofRequest = clearPendingProofRequest();

    if (!pendingProofRequest) {
      console.warn('Received proof id without an active proof request.');
      return;
    }

    pendingProofRequest.resolve(event.data.proofId);
  }, [clearPendingProofRequest, rejectPendingProofRequest]);

  const handleExtensionProofByIdMessageReceived = useCallback(function(event: ExtensionEventMessage) {
    console.log('Client received FETCH_PROOF_BY_ID_RESPONSE message');
    console.log('event.data', event.data);

    if (event.data.requestHistory && event.data.requestHistory.notaryRequest) {
      const requestHistory = event.data.requestHistory.notaryRequest;
      setPaymentProof(requestHistory);
    }
  }, []);

  const handleExtensionMessage = useCallback(function(event: any) {
    if (event.origin !== window.location.origin) {
      return;
    };

    if (event.data.type && event.data.type === ExtensionReceiveMessage.EXTENSION_VERSION_RESPONSE) {
      handleExtensionVersionMessageReceived(event);
    };

    if (event.data.type && event.data.type === ExtensionReceiveMessage.METADATA_MESSAGES_RESPONSE) {
      handleExtensionMetadataMessagesResponse(event);
    };

    if (event.data.type && event.data.type === ExtensionReceiveMessage.FETCH_PROOF_REQUEST_ID_RESPONSE) {
      handleExtensionProofIdMessageReceived(event);
    };

    if (event.data.type && event.data.type === ExtensionReceiveMessage.FETCH_PROOF_BY_ID_RESPONSE) {
      handleExtensionProofByIdMessageReceived(event);
    };
  }, [
    handleExtensionVersionMessageReceived,
    handleExtensionMetadataMessagesResponse,
    handleExtensionProofIdMessageReceived,
    handleExtensionProofByIdMessageReceived,
  ]);

  

  /*
   * Hooks
   */

  useEffect(() => {
    // Set up the event listener first
    window.addEventListener("message", handleExtensionMessage);
    
    // Small initial delay to give extension time to initialize
    initialCheckTimeoutRef.current = setTimeout(() => {
      refetchExtensionVersion();
      
      // Start with more frequent checks initially, then switch to 5s interval
      frequentChecksIntervalRef.current = setInterval(() => {
        refetchExtensionVersion();
      }, 500); // Check every 500ms initially
      
      // After 2 seconds of frequent checks, switch to normal interval
      switchToNormalTimeoutRef.current = setTimeout(() => {
        if (frequentChecksIntervalRef.current) {
          clearInterval(frequentChecksIntervalRef.current);
          frequentChecksIntervalRef.current = null;
        }
        intervalRef.current = setInterval(refetchExtensionVersion, 5000);
      }, 2000);
      
    }, 100); // Small delay before first check

    return () => {
      window.removeEventListener("message", handleExtensionMessage);
      clearVersionPollingTimers();
      rejectPendingProofRequest('Extension proof request was interrupted before the proof id was received.');
    };
  }, [
    clearVersionPollingTimers,
    handleExtensionMessage,
    refetchExtensionVersion,
    rejectPendingProofRequest,
  ]);

  return (
    <ExtensionProxyProofsContext.Provider
      value={{
        isSidebarInstalled,
        sideBarVersion,
        refetchExtensionVersion,

        openNewTab,
        openSidebar,
        platformMetadata,

        paymentProof,
        generatePaymentProof,
        fetchPaymentProof,
        resetProofState,
      }}
    >
      {children}
    </ExtensionProxyProofsContext.Provider>
  );
};

export default ExtensionNotarizationsProvider;
