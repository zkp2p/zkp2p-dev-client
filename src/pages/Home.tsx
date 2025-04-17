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
  const [intentHash, setIntentHash] = useState(
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  );
  const [actionType, setActionType] = useState('transfer_venmo');
  const [paymentPlatform, setPaymentPlatform] = useState('venmo');
  const [isInstallClicked, setIsInstallClicked] = useState(false);

  const [selectedMetadata, setSelectedMetadata] =
    useState<ExtensionRequestMetadata | null>(null);
  const [proofStatus, setProofStatus] = useState<ProofGenerationStatusType>('idle');
  const [resultProof, setResultProof] = useState('');

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

  useEffect(() => {
    refetchExtensionVersion();
  }, [refetchExtensionVersion]);

  useEffect(() => {
    if (!paymentProof) return;
    if (paymentProof.status === 'success') {
      setProofStatus('success');
      setResultProof(JSON.stringify(paymentProof.proof, null, 2));
      setTriggerProofFetchPolling(false);
    } else if (paymentProof.status === 'error') {
      setProofStatus('error');
      setResultProof(JSON.stringify(paymentProof.proof, null, 2));
      setTriggerProofFetchPolling(false);
    } else {
      // keep status "generating"
      setProofStatus('generating');
    }
  }, [paymentProof]);

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
    generatePaymentProof(paymentPlatform, intentHash, meta.originalIndex);

    setTriggerProofFetchPolling(true);
  };

  const browserSvgIcon = () =>
    browserName === 'Brave' ? braveSvg : chromeSvg;
  const addToBrowserText = () =>
    browserName === 'Brave' ? 'Add to Brave' : 'Add to Chrome';

  return (
    <PageWrapper $isMobile={false}>
      <ContentContainer>
        <FlexContainer $centered={proofStatus === 'idle'}>
          <SettingsPanel>
            <Section>
              <StatusItem>
                <StatusLabel>Extension Version:</StatusLabel>
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
                onChange={(e) => setPaymentPlatform(e.target.value)}
                valueFontSize="16px"
              />
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

            {platformMetadata[paymentPlatform]?.metadata && (
              <Section>
                <StatusItem>
                  <StatusLabel>Available Metadata</StatusLabel>
                </StatusItem>
                <MetadataList>
                  {platformMetadata[paymentPlatform].metadata.map(
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
                          Generate Proof
                        </AccessoryButton>
                      </MetadataItem>
                    )
                  )}
                </MetadataList>
              </Section>
            )}
          </SettingsPanel>

          {proofStatus !== 'idle' && (
            <OutputPanel>
              <ProofContainer>
                {proofStatus === 'generating' && (
                  <>
                    <SpinnerContainer>
                      <Spinner color={colors.defaultBorderColor} size={40} />
                      <SpinnerMessage>
                        Generating zero-knowledge proof...
                        <br />
                        This may take up to 30 seconds
                      </SpinnerMessage>
                    </SpinnerContainer>
                  </>
                )}
                {(proofStatus === 'success' || proofStatus === 'error') && (
                  <>
                    <ThemedText.LabelSmall>
                      {proofStatus === 'success'
                        ? '👍 Proof generated!'
                        : <>
                          Error generating proof: {' '}
                          <ErrorMessage>
                            {paymentProof?.error.message}
                          </ErrorMessage>
                        </>
                      }
                    </ThemedText.LabelSmall>
                    <ProofTextArea readOnly value={resultProof} />
                  </>
                )}
                {proofStatus === 'timeout' && (
                  <ThemedText.LabelSmall>
                    ⏱ Timeout: no proof received.
                  </ThemedText.LabelSmall>
                )}
              </ProofContainer>
            </OutputPanel>
          )}
        </FlexContainer>
      </ContentContainer>
    </PageWrapper>
  );
};

const PageWrapper = styled.div<{ $isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => props.$isMobile ? '0' : '4px 8px'};
  padding-bottom: ${props => props.$isMobile ? '4.5rem' : '10rem'};
  height: ${props => props.$isMobile ? '100%' : 'auto'};
  overflow: ${props => props.$isMobile ? 'hidden' : 'visible'};
  max-width: 1440px;
  margin: 0 auto;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  
  @media (max-width: 600px) {
    height: calc(100vh - 5rem);
    overflow-y: auto;
    padding-bottom: 4.5rem;
  }
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

const FlexContainer = styled.div<{ $centered: boolean }>`
  display: flex;
  gap: 30px;
  align-items: stretch;
  height: calc(100vh - 150px);
  transition: all 0.5s ease;
  
  ${props => props.$centered && `
    justify-content: center;
  `}
`;

const SettingsPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  max-width: 500px;
  width: 100%;
  overflow-y: visible;
  padding-bottom: 15px;
`;

const OutputPanel = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  overflow-y: auto;
  padding-bottom: 20px;
  box-sizing: border-box;
  
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
    border: 3px solid transparent;
  }
  
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.7);
  }
`;

const Section = styled.div`
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
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
  padding: 20px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
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
  
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
    border: 3px solid transparent;
  }
  
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.7);
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
  margin-top: 10px;
  padding: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 4px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.02);
  min-height: 500px;
  flex: 1;
`;

const SpinnerMessage = styled(ThemedText.LabelSmall)`
  margin-top: 15px;
  text-align: center;
  opacity: 0.8;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 5px;
`;

const MetadataList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
    border: 3px solid transparent;
  }
  
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.7);
  }
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
  width: 24px;
  height: 24px;
  color: ${colors.white};
`;

export { Home };