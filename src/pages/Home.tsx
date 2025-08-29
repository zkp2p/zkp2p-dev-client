import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { browserName } from 'react-device-detect';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import useExtensionProxyProofs from '@hooks/contexts/useExtensionProxyProofs';
import { ExtensionRequestMetadata, ProofGenerationStatusType } from '@helpers/types';
import chromeSvg from '../assets/images/browsers/chrome.svg';
import braveSvg from '../assets/images/browsers/brave.svg';
import { AccessoryButton } from '@components/common/AccessoryButton';
import Spinner from '@components/common/Spinner';
import { ChevronRight } from 'react-feather';

const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/zkp2p-extension/ijpgccednehjpeclfcllnjjcmiohdjih';
const PROOF_FETCH_INTERVAL = 3000;
const PROOF_GENERATION_TIMEOUT = 60000;

const Home: React.FC = () => {
  const [intentHash, setIntentHash] = useState(() => {
    return localStorage.getItem('intentHash') || '0x0000000000000000000000000000000000000000000000000000000000000000';
  });
  const [actionType, setActionType] = useState(() => {
    return localStorage.getItem('actionType') || 'transfer_venmo';
  });
  const [paymentPlatform, setPaymentPlatform] = useState(() => {
    return localStorage.getItem('paymentPlatform') || 'venmo';
  });
  const [metadataPlatform, setMetadataPlatform] = useState(() => {
    const initialStoredPaymentPlatform = localStorage.getItem('paymentPlatform') || 'venmo';
    const storedMetadataVal = localStorage.getItem('metadataPlatform');
    if (storedMetadataVal === null) {
      return initialStoredPaymentPlatform;
    }
    return storedMetadataVal;
  });
  const [proofIndex, setProofIndex] = useState<number>(0);
  const [isInstallClicked, setIsInstallClicked] = useState(false);

  const [selectedMetadata, setSelectedMetadata] =
    useState<ExtensionRequestMetadata | null>(null);
  const [proofStatus, setProofStatus] = useState<ProofGenerationStatusType>('idle');
  const [resultProof, setResultProof] = useState('');
  const [proofGenerationStartTime, setProofGenerationStartTime] = useState<number | null>(null);
  const [proofGenerationDuration, setProofGenerationDuration] = useState<number | null>(null);
  const [attestationResponse, setAttestationResponse] = useState<string | null>(null);
  const [attestationLoading, setAttestationLoading] = useState(false);
  const [attestationError, setAttestationError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(() => {
    const stored = localStorage.getItem('chainId');
    return stored ? parseInt(stored) : 84532;
  });

  const [triggerProofFetchPolling, setTriggerProofFetchPolling] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const proofTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
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
  } = useExtensionProxyProofs();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('chainId', chainId.toString());
  }, [chainId]);

  useEffect(() => {
    refetchExtensionVersion();
  }, [refetchExtensionVersion]);

  useEffect(() => {
    localStorage.setItem('intentHash', intentHash);
  }, [intentHash]);

  useEffect(() => {
    localStorage.setItem('actionType', actionType);
  }, [actionType]);

  useEffect(() => {
    localStorage.setItem('paymentPlatform', paymentPlatform);
  }, [paymentPlatform]);


  useEffect(() => {
    if (!paymentProof) return;
    if (paymentProof.status === 'success') {
      setProofStatus('success');
      setResultProof(JSON.stringify(paymentProof, null, 2));
      setTriggerProofFetchPolling(false);
      if (proofGenerationStartTime) {
        setProofGenerationDuration(Date.now() - proofGenerationStartTime);
      }
    } else if (paymentProof.status === 'error') {
      setProofStatus('error');
      setResultProof(JSON.stringify(paymentProof, null, 2));
      setTriggerProofFetchPolling(false);
    } else {
      // keep status "generating"
      setProofStatus('generating');
    }
  }, [paymentProof, proofGenerationStartTime]);

  useEffect(() => {
    if (triggerProofFetchPolling && paymentPlatform) {
      if (intervalId) clearInterval(intervalId);
        const id = setInterval(() => {
          fetchPaymentProof(paymentPlatform);
        }, PROOF_FETCH_INTERVAL);
        setIntervalId(id);

        proofTimeoutRef.current = setTimeout(() => {
          clearInterval(id);
          setTriggerProofFetchPolling(false);
          setProofStatus('timeout');
        }, PROOF_GENERATION_TIMEOUT);

        return () => {
          clearInterval(id);
          if (proofTimeoutRef.current) clearTimeout(proofTimeoutRef.current);
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [triggerProofFetchPolling, paymentPlatform, fetchPaymentProof]
  );

  useEffect(() => {
    if (proofStatus !== 'generating' && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setTriggerProofFetchPolling(false);
      if (proofTimeoutRef.current) {
        clearTimeout(proofTimeoutRef.current);
        proofTimeoutRef.current = null;
      }
    }
  }, [proofStatus, intervalId]);

  const handleInstall = () => {
    window.open(CHROME_EXTENSION_URL, '_blank');
    setIsInstallClicked(true);
  };

  const handlePaymentPlatformChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setPaymentPlatform(newValue);
    setMetadataPlatform(newValue);
  };

  const handleMetadataPlatformChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setMetadataPlatform(newValue);
    localStorage.setItem('metadataPlatform', newValue);
  };

  const handleOpenSettings = () => {
    openSidebar('/settings');
  };

  const handleAuthenticate = () => {
    if (!intentHash || !actionType || !paymentPlatform) {
      alert('Please fill out all fields');
      return;
    }
    openNewTab(actionType, paymentPlatform);
    setSelectedMetadata(null);
    setProofStatus('idle');
    setResultProof('');
  };

  const handleGenerateProof = (meta: ExtensionRequestMetadata) => {
    setSelectedMetadata(meta);
    setProofStatus('generating');
    setResultProof('');
    setProofGenerationStartTime(Date.now());
    setProofGenerationDuration(null);
    setAttestationResponse(null);
    setAttestationError(null);

    setTriggerProofFetchPolling(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    if (proofTimeoutRef.current) {
      clearTimeout(proofTimeoutRef.current);
      proofTimeoutRef.current = null;
    }

    resetProofState();
    generatePaymentProof(metadataPlatform, intentHash, meta.originalIndex, proofIndex);

    setTriggerProofFetchPolling(true);
  };

  const handleSendToAttestation = async () => {
    if (!resultProof) return;
    
    setAttestationLoading(true);
    setAttestationError(null);
    setAttestationResponse(null);
    
    try {
      const proofData = JSON.parse(resultProof);
      const proofClaim = proofData.proof?.claim || proofData.claim;
      
      if (!proofClaim) {
        throw new Error('No proof claim found in the generated proof');
      }
      
      const payload = {
        proofType: "reclaim",
        proof: {
          claim: proofClaim,
          signatures: proofData.proof?.signatures || proofData.signatures || {}
        },
        chainId: chainId
      };
      
      const endpoint = `https://attestation-service-staging.zkp2p.xyz/verify/${paymentPlatform}/transfer_${paymentPlatform}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }
      
      setAttestationResponse(JSON.stringify(responseData, null, 2));
    } catch (error) {
      console.error('Error sending to attestation service:', error);
      setAttestationError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setAttestationLoading(false);
    }
  };

  const browserSvgIcon = () =>
    browserName === 'Brave' ? braveSvg : chromeSvg;
  const addToBrowserText = () =>
    browserName === 'Brave' ? 'Add to Brave' : 'Add to Chrome';

  return (
    <PageWrapper>
      <AppContainer>
        <LeftPanel>
          <Section>
            <StatusItem>
              <StatusLabel>Version:</StatusLabel>
              <StatusValue>
                {isSidebarInstalled ? sideBarVersion : 'Not Installed'}
              </StatusValue>
              <IconButton 
                onClick={handleOpenSettings}
                disabled={proofStatus === 'generating'}
                title="Open Settings"
              >
                Open Settings
                <StyledChevronRight />
              </IconButton>
            </StatusItem>
            <Input
              label="Intent Hash"
              name="intentHash"
              value={intentHash}
              onChange={(e) => setIntentHash(e.target.value)}
              valueFontSize="16px"
            />
            <Input
              label="Action Type"
              name="actionType"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              valueFontSize="16px"
            />
            <Input
              label="Payment Platform"
              name="paymentPlatform"
              value={paymentPlatform}
              onChange={handlePaymentPlatformChange}
              valueFontSize="16px"
            />
            <AdvancedSection>
              <AdvancedHeader onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}>
                <ThemedText.BodySmall>Advanced Settings</ThemedText.BodySmall>
                <ChevronRight 
                  size={16} 
                  style={{ 
                    transform: isAdvancedOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </AdvancedHeader>
              {isAdvancedOpen && (
                <AdvancedContent>
                  <Input
                    label="Metadata Group (e.g. zelle)"
                    name="metadataPlatform"
                    value={metadataPlatform}
                    onChange={handleMetadataPlatformChange}
                    valueFontSize="16px"
                  />
                  <Input
                    label="Proof Index"
                    name="proofIndex"
                    value={proofIndex.toString()}
                    onChange={(e) => setProofIndex(Number(e.target.value))}
                    valueFontSize="16px"
                  />
                </AdvancedContent>
              )}
            </AdvancedSection>
            <ButtonContainer>
              {isSidebarInstalled ? (
                <Button
                  onClick={handleAuthenticate}
                  height={48}
                  width={216}
                  disabled={!isSidebarInstalled}
                >
                  Authenticate
                </Button>
              ) : (
                <Button
                  onClick={handleInstall}
                  leftAccessorySvg={browserSvgIcon()}
                  loading={isInstallClicked}
                  disabled={isInstallClicked}
                  height={48}
                  width={216}
                >
                  {addToBrowserText()}
                </Button>
              )}
            </ButtonContainer>
          </Section>
        </LeftPanel>

        <MiddlePanel>
          <Section>
            <StatusItem>
              <StatusLabel>Available Metadata</StatusLabel>
            </StatusItem>
            {platformMetadata[metadataPlatform]?.metadata ? (
              <MetadataList>
                {platformMetadata[metadataPlatform].metadata.map(
                  (m, idx) => (
                    <MetadataItem
                      key={idx}
                      selected={
                        selectedMetadata?.originalIndex === m.originalIndex
                      }
                    >
                      <MetadataInfo>
                        <ThemedText.BodySmall>
                          Amount: {m.amount || 'N/A'}
                        </ThemedText.BodySmall>
                        <ThemedText.BodySmall>
                          Date: {m.date || 'N/A'}
                        </ThemedText.BodySmall>
                        <ThemedText.BodySmall>
                          Recipient: {m.recipient || 'N/A'}
                        </ThemedText.BodySmall>
                        <ThemedText.BodySmall>
                          Index: {m.originalIndex}
                        </ThemedText.BodySmall>
                      </MetadataInfo>
                      <AccessoryButton
                        onClick={() => handleGenerateProof(m)}
                        icon="chevronRight"
                        disabled={
                          selectedMetadata?.originalIndex === m.originalIndex &&
                          proofStatus === 'generating'
                        }
                      >
                        Prove
                      </AccessoryButton>
                    </MetadataItem>
                  )
                )}
              </MetadataList>
            ) : (
              <EmptyStateContainer>
                <EmptyStateMessage>
                  Authenticate to see available metadata
                </EmptyStateMessage>
              </EmptyStateContainer>
            )}
          </Section>
        </MiddlePanel>

        <RightPanel>
          <Section>
            <StatusItem>
              <StatusLabel>Proof Status</StatusLabel>
            </StatusItem>
            {proofStatus !== 'idle' ? (
              <ProofContainer>
                {proofStatus === 'generating' && (
                  <SpinnerContainer>
                    <Spinner color={colors.defaultBorderColor} size={40} />
                    <SpinnerMessage>
                      Generating zero-knowledge proof...
                      <br />
                      This may take up to 30 seconds
                    </SpinnerMessage>
                  </SpinnerContainer>
                )}
                {(proofStatus === 'success' || proofStatus === 'error') && (
                  <>
                    <ThemedText.BodySecondary>
                      {proofStatus === 'success'
                        ? `👍 Proof generated! ${proofGenerationDuration ? `(${(proofGenerationDuration / 1000).toFixed(1)}s)` : ''}`
                        : <>
                          Error generating proof: {' '}
                          <ErrorMessage>
                            {paymentProof?.error.message}
                          </ErrorMessage>
                        </>
                      }
                    </ThemedText.BodySecondary>
                    <ProofTextArea readOnly value={resultProof} />
                    {proofStatus === 'success' && (
                      <AttestationSection>
                        <AttestationDivider />
                        <AttestationHeader>
                          <AttestationHeaderLeft>
                            <ThemedText.BodySmall>Attestation Service</ThemedText.BodySmall>
                            <ChainIdSelect
                              value={chainId}
                              onChange={(e) => setChainId(parseInt(e.target.value))}
                              disabled={attestationLoading}
                            >
                              <option value="84532">Base Sepolia (84532)</option>
                              <option value="8453">Base (8453)</option>
                              <option value="31337">Local (31337)</option>
                            </ChainIdSelect>
                          </AttestationHeaderLeft>
                          <Button
                            onClick={handleSendToAttestation}
                            disabled={attestationLoading}
                            loading={attestationLoading}
                            height={36}
                            width={180}
                          >
                            Verify Attestation
                          </Button>
                        </AttestationHeader>
                        {attestationResponse && (
                          <>
                            <ThemedText.BodySecondary>
                              ✅ Attestation Response:
                            </ThemedText.BodySecondary>
                            <AttestationResponseArea readOnly value={attestationResponse} />
                          </>
                        )}
                        {attestationError && (
                          <AttestationErrorMessage>
                            ❌ Attestation Error: {attestationError}
                          </AttestationErrorMessage>
                        )}
                      </AttestationSection>
                    )}
                  </>
                )}
                {proofStatus === 'timeout' && (
                  <ThemedText.LabelSmall>
                    ⏱ Timeout: no proof received.
                  </ThemedText.LabelSmall>
                )}
              </ProofContainer>
            ) : (
              <EmptyStateContainer>
                <EmptyStateMessage>
                  Select metadata and generate a proof to see results here
                </EmptyStateMessage>
              </EmptyStateContainer>
            )}
          </Section>
        </RightPanel>
      </AppContainer>
    </PageWrapper>
  );
};

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem;
`;

const AppContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1400px;
  border-radius: 8px;
  border: 1px solid ${colors.defaultBorderColor};
  overflow: hidden;
  background: ${colors.container};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const LeftPanel = styled.div`
  flex: 1;
  max-width: 340px;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid ${colors.defaultBorderColor};
  
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
  }
`;

const MiddlePanel = styled.div`
  flex: 1.2;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid ${colors.defaultBorderColor};
  
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
  }
`;

const RightPanel = styled.div`
  flex: 2;
  padding: 20px;
  overflow-y: auto;
  
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
  }
`;

const Section = styled.div`
  padding: 10px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const StatusLabel = styled.div`
  font-weight: bold;
  margin-right: 10px;
`;

const StatusValue = styled.div`
  color: ${colors.connectionStatusGreen};
  margin-right: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 5px;
`;

const MetadataList = styled.div`
  max-height: 600px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
  }
`;

const MetadataItem = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid
    ${(p) =>
      p.selected
        ? colors.selectorHoverBorder
        : colors.defaultBorderColor};
  border-radius: 8px;
  background-color: ${(p) =>
    p.selected ? colors.selectorHoverBorder : 'transparent'};
  
  &:hover {
    background-color: ${(p) =>
      p.selected ? colors.selectorHoverBorder : colors.selectorHover};
  }
`;

const MetadataInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ProofContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;

  > * {
    max-width: 100%;
  }
`;

const ProofTextArea = styled.textarea`
  width: 100%;
  flex: 1;
  min-height: 500px;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: none;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.1);
  color: ${colors.white};
  
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
  }
`;

const ErrorMessage = styled.span`
  color: #FF3B30;
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.05);
  flex: 1;
`;

const SpinnerMessage = styled(ThemedText.LabelSmall)`
  margin-top: 15px;
  text-align: center;
  opacity: 0.8;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${colors.white};
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    opacity: 0.8;
  }
`;

const StyledChevronRight = styled(ChevronRight)`
  width: 16px;
  height: 16px;
  color: ${colors.white};
`;

const EmptyStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 550px;
  padding: 20px;
`;

const EmptyStateMessage = styled(ThemedText.BodySmall)`
  text-align: center;
  opacity: 0.6;
`;

const AdvancedSection = styled.div`
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
  overflow: hidden;
`;

const AdvancedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const AdvancedContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-top: 1px solid ${colors.defaultBorderColor};
`;

const AttestationSection = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AttestationDivider = styled.div`
  height: 1px;
  background: ${colors.defaultBorderColor};
  width: 100%;
`;

const AttestationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AttestationHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ChainIdSelect = styled.select`
  background: rgba(0, 0, 0, 0.3);
  color: ${colors.white};
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    border-color: ${colors.selectorHoverBorder};
  }
  
  option {
    background: ${colors.container};
  }
`;

const AttestationResponseArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: none;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-sizing: border-box;
  background: rgba(0, 128, 0, 0.1);
  color: ${colors.white};
  
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
  }
`;

const AttestationErrorMessage = styled.div`
  padding: 10px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 4px;
  color: #FF3B30;
  font-size: 14px;
`;

export { Home };