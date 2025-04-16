import React, { useEffect, useState, ReactNode, useCallback, useRef } from 'react';

import {
  ExtensionEventMessage,
  ExtensionNotaryProofRequest,
  ExtensionEventVersionMessage,
  ExtensionPostMessage,
  ExtensionReceiveMessage,
  ExtensionRequestMetadataMessage,
  ExtensionRequestMetadata,
} from '@helpers/types';

import ExtensionProxyProofsContext, { MetadataInfo } from './ExtensionProxyProofsContext';

interface ProvidersProps {
  children: ReactNode;
};

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
  const [proofId, setProofId] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<ExtensionNotaryProofRequest | null>(null);

  const [platformMetadata, setPlatformMetadata] = useState<Record<string, MetadataInfo>>({} as Record<string, MetadataInfo>);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  //
  // EXTENSION POST MESSAGES
  //

  const refetchExtensionVersion = () => {
    window.postMessage({ type: ExtensionPostMessage.FETCH_EXTENSION_VERSION }, '*');
    console.log('Posted Message: ', ExtensionPostMessage.FETCH_EXTENSION_VERSION);
  };

  const refetchProvidersBaseUrl = () => {
    window.postMessage({ type: ExtensionPostMessage.FETCH_PROVIDER_BASE_URL }, '*');
    console.log('Posted Message: ', ExtensionPostMessage.FETCH_PROVIDER_BASE_URL);
  };

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

    setProofId(null);
    setPaymentProof(null);
  }, []);

  const generatePaymentProof = useCallback((
    platform: string,
    intentHash: string,
    originalIndex: number,
  ) => {
    resetProofState();

    window.postMessage({
      type: ExtensionPostMessage.GENERATE_PROOF,
      intentHash,
      originalIndex,
      platform,
    }, '*');

    console.log('Posted Message: ', intentHash, originalIndex, platform);
  }, []);

  /*
   * Fetch Transfer Proof
   */

  const fetchPaymentProof = useCallback(() => {
    if (proofId) {
      window.postMessage({ type: ExtensionPostMessage.FETCH_PROOF_BY_ID, proofId }, '*');
    } else {
      console.log('No proof id');
    }
  }, [proofId]);

  /*
   * Handlers
   */

  const handleExtensionMessage = function(event: any) {
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
  };

  const handleExtensionVersionMessageReceived = function(event: ExtensionEventVersionMessage) {
    console.log('Client received EXTENSION_VERSION_RESPONSE message');
    console.log('event.data', event.data);  

    const version = event.data.version;

    setSideBarVersion(version);
    setIsSidebarInstalled(true);

    // Clear the interval once we receive the version
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleExtensionMetadataMessagesResponse = function(event: ExtensionRequestMetadataMessage) {
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
  };

  const handleExtensionProofIdMessageReceived = function(event: ExtensionEventMessage) {
    console.log('Client received FETCH_PROOF_REQUEST_ID_RESPONSE message');

    if (!event.data.proofId) {
      setProofId(null);
      return;
    }

    setProofId(event.data.proofId);
  };

  const handleExtensionProofByIdMessageReceived = function(event: ExtensionEventMessage) {
    console.log('Client received FETCH_PROOF_BY_ID_RESPONSE message');
    console.log('event.data', event.data);

    if (event.data.requestHistory && event.data.requestHistory.notaryRequest) {
      const requestHistory = event.data.requestHistory.notaryRequest;
      setPaymentProof(requestHistory);
    }
  };

  /*
   * Hooks
   */

  useEffect(() => {
    intervalRef.current = setInterval(refetchExtensionVersion, 5000);
    refetchExtensionVersion();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleExtensionMessage);
  
    return () => {
      window.removeEventListener("message", handleExtensionMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper functions to maintain backward compatibility
  const getMetadata = (platform: string) => platformMetadata[platform]?.metadata || null;
  const getExpiresAt = (platform: string) => platformMetadata[platform]?.expiresAt || null;

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
