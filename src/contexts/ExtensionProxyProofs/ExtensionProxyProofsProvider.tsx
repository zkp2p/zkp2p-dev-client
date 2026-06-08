import React, {
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";

import {
  ExtensionEventVersionMessage,
  ExtensionPostMessage,
  ExtensionReceiveMessage,
  ExtensionRequestMetadataMessage,
  ProofCaptureMode,
} from "@helpers/types";

import ExtensionProxyProofsContext, {
  MetadataInfo,
} from "./ExtensionProxyProofsContext";

interface ProvidersProps {
  children: ReactNode;
}

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

  const [platformMetadata, setPlatformMetadata] = useState<
    Record<string, MetadataInfo>
  >({} as Record<string, MetadataInfo>);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const frequentChecksIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const switchToNormalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  //
  // EXTENSION POST MESSAGES
  //

  const refetchExtensionVersion = useCallback(() => {
    window.postMessage(
      { type: ExtensionPostMessage.FETCH_EXTENSION_VERSION },
      "*"
    );
    console.log(
      "Posted Message: ",
      ExtensionPostMessage.FETCH_EXTENSION_VERSION
    );
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

  const openNewTab = (
    actionType: string,
    platform: string,
    captureMode?: ProofCaptureMode,
    attestationServiceUrl?: string | null
  ) => {
    const message: Record<string, unknown> = {
      type: ExtensionPostMessage.OPEN_NEW_TAB,
      actionType,
      platform,
    };

    if (captureMode) {
      message.captureMode = captureMode;
    }

    if (attestationServiceUrl) {
      message.attestationServiceUrl = attestationServiceUrl;
    }

    window.postMessage(message, "*");

    console.log(
      "Posted Message: ",
      ExtensionPostMessage.OPEN_NEW_TAB,
      actionType,
      platform,
      captureMode,
      attestationServiceUrl
    );
  };

  /*
   * Handlers
   */

  const handleExtensionVersionMessageReceived = useCallback(
    function (event: ExtensionEventVersionMessage) {
      console.log("Client received EXTENSION_VERSION_RESPONSE message");
      console.log("event.data", event.data);

      const version = event.data.version;

      setSideBarVersion(version);
      setIsSidebarInstalled(true);
      clearVersionPollingTimers();
    },
    [clearVersionPollingTimers]
  );

  const handleExtensionMetadataMessagesResponse = useCallback(function (
    event: ExtensionRequestMetadataMessage
  ) {
    console.log("Client received METADATA_MESSAGES_RESPONSE message");
    console.log("event.data", event.data);

    if (event.data.sarCredentialCapture) {
      return;
    }

    const platform = event.data.platform as string;
    const buyerTeeCapture = event.data.buyerTeeCapture ?? null;

    setPlatformMetadata((prev) => ({
      ...prev,
      [platform]: {
        metadata: event.data.metadata,
        expiresAt: event.data.expiresAt,
        buyerTeeCapture,
        errorMessage: event.data.errorMessage ?? null,
      },
    }));
  },
  []);

  const handleExtensionMessage = useCallback(
    function (event: any) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (
        event.data.type &&
        event.data.type === ExtensionReceiveMessage.EXTENSION_VERSION_RESPONSE
      ) {
        handleExtensionVersionMessageReceived(event);
      }

      if (
        event.data.type &&
        event.data.type === ExtensionReceiveMessage.METADATA_MESSAGES_RESPONSE
      ) {
        handleExtensionMetadataMessagesResponse(event);
      }
    },
    [
      handleExtensionVersionMessageReceived,
      handleExtensionMetadataMessagesResponse,
    ]
  );

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
    };
  }, [
    clearVersionPollingTimers,
    handleExtensionMessage,
    refetchExtensionVersion,
  ]);

  return (
    <ExtensionProxyProofsContext.Provider
      value={{
        isSidebarInstalled,
        sideBarVersion,
        refetchExtensionVersion,

        openNewTab,
        platformMetadata,
      }}
    >
      {children}
    </ExtensionProxyProofsContext.Provider>
  );
};

export default ExtensionNotarizationsProvider;
