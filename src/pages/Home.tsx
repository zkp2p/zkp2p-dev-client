import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { browserName } from 'react-device-detect';
import { ThemedText } from '@theme/text';
import {
  colors,
  opacify,
  radii,
  fontFamilies,
  fontWeights,
  letterSpacing,
  lineHeights,
} from '@theme/colors';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import useExtensionProxyProofs from '@hooks/contexts/useExtensionProxyProofs';
import { ExtensionRequestMetadata, ProofGenerationStatusType } from '@helpers/types';
import chromeSvg from '../assets/images/browsers/chrome.svg';
import braveSvg from '../assets/images/browsers/brave.svg';
import { AccessoryButton } from '@components/common/AccessoryButton';
import Spinner from '@components/common/Spinner';
import { ChevronRight } from 'react-feather';
import { ethers } from 'ethers';
import { keccak256 } from '@helpers/keccack';
import { getDefaultVerifier, fetchIntentDetails, normalizeHex32, hexToDecimal } from '@helpers/contracts';

const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/zkp2p-extension/ijpgccednehjpeclfcllnjjcmiohdjih';
const PROOF_FETCH_INTERVAL = 3000;
const PROOF_GENERATION_TIMEOUT = 60000;

// Default calldata inputs stored at module scope (strict, visible defaults)
const DEFAULT_CALLDATA_INPUTS = {
  intentAmount: '0',
  intentTimestamp: '0',
  payeeDetails:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  fiatCurrency: keccak256('USD'),
  conversionRate: '0',
};

// Helper: derive platform (e.g., "venmo") from action type (e.g., "transfer_venmo").
const derivePlatformFromActionType = (action: string, fallback: string) => {
  if (!action) return fallback;
  const parts = action.split('_');
  return parts.length > 1 ? parts[parts.length - 1] : fallback;
};

// Step indicator component
const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-top: 5px;
  padding-bottom: 15px;
  border-bottom: 1px solid ${colors.defaultBorderColor};
  background: ${colors.backgroundSecondary};
`;

const StepNumber = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${colors.selectorHoverBorder};
  color: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
`;

const StepLabel = styled.div`
  font-family: ${fontFamilies.headline};
  font-weight: ${fontWeights.semibold};
  font-size: 14px;
  letter-spacing: ${letterSpacing.headline};
  line-height: ${lineHeights.headline};
  text-transform: uppercase;
  color: ${colors.white};
  text-wrap: balance;
`;

const Home: React.FC = () => {
  const [intentHash, setIntentHash] = useState(() => {
    return localStorage.getItem('intentHash') || '0x';
  });
  const [actionType, setActionType] = useState(() => {
    return localStorage.getItem('actionType') || 'transfer_venmo';
  });
  const [paymentPlatform, setPaymentPlatform] = useState(() => {
    return localStorage.getItem('paymentPlatform') || 'venmo';
  });
  const [metadataPlatform, setMetadataPlatform] = useState(() => {
    const initialPaymentPlatform = localStorage.getItem('paymentPlatform') || 'venmo';
    const initialActionType = localStorage.getItem('actionType') || 'transfer_venmo';
    return derivePlatformFromActionType(initialActionType, initialPaymentPlatform);
  });
  const [proofIndex, setProofIndex] = useState<number>(0);
  const [isInstallClicked, setIsInstallClicked] = useState(false);

  const [selectedMetadata, setSelectedMetadata] =
    useState<ExtensionRequestMetadata | null>(null);
  const [proofStatus, setProofStatus] = useState<ProofGenerationStatusType>('idle');
  const [resultProof, setResultProof] = useState('');
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [proofGenerationStartTime, setProofGenerationStartTime] = useState<number | null>(null);
  const [proofGenerationDuration, setProofGenerationDuration] = useState<number | null>(null);
  const [attestationResponse, setAttestationResponse] = useState<string | null>(null);
  const [attestationLoading, setAttestationLoading] = useState(false);
  const [attestationError, setAttestationError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(() => {
    const stored = localStorage.getItem('chainId');
    return stored ? parseInt(stored) : 84532;
  });
  const [verifyingContract, setVerifyingContract] = useState<string>(() => {
    const stored = localStorage.getItem('verifyingContract');
    const byChain = getDefaultVerifier(84532);
    return stored || byChain;
  });
  const [attestationBaseUrl, setAttestationBaseUrl] = useState<string>(() => {
    const stored = localStorage.getItem('attestationBaseUrl');
    return stored || 'https://attestation-service.zkp2p.xyz';
  });

  const [triggerProofFetchPolling, setTriggerProofFetchPolling] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const proofTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [calldataInputs, setCalldataInputs] = useState(DEFAULT_CALLDATA_INPUTS);
  // Input changes no longer used (auto-fetched intent); keep for completeness
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [generatedCalldata, setGeneratedCalldata] = useState<string>('');
  const [calldataError, setCalldataError] = useState<string | null>(null);
  // Step 4 independent intent hash for verification
  const [verifyIntentHash, setVerifyIntentHash] = useState<string>('');
  const [isIntentAdvancedOpen, setIsIntentAdvancedOpen] = useState(false);
  const [fetchIntentLoading, setFetchIntentLoading] = useState(false);
  const [fetchIntentError, setFetchIntentError] = useState<string | null>(null);
  const [paymentMethodHex, setPaymentMethodHex] = useState<string>('');
  const [postIntentHookData, setPostIntentHookData] = useState<string>('0x');

  // No localStorage persistence; inputs always reflect actual defaults or user edits

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
    localStorage.setItem('verifyingContract', verifyingContract);
  }, [verifyingContract]);

  useEffect(() => {
    localStorage.setItem('attestationBaseUrl', attestationBaseUrl);
  }, [attestationBaseUrl]);

  useEffect(() => {
    refetchExtensionVersion();
  }, [refetchExtensionVersion]);

  useEffect(() => {
    try {
      const hex = normalizeHex32(intentHash);
      localStorage.setItem('intentHash', hex);
    } catch {
      localStorage.setItem('intentHash', intentHash);
    }
  }, [intentHash]);

  useEffect(() => {
    localStorage.setItem('actionType', actionType);
  }, [actionType]);

  useEffect(() => {
    localStorage.setItem('paymentPlatform', paymentPlatform);
  }, [paymentPlatform]);

  // Auto-select verifier by chain (Base Sepolia / Base)
  useEffect(() => {
    if (chainId === 84532 || chainId === 8453) {
      const next = getDefaultVerifier(chainId === 8453 ? 8453 : 84532);
      setVerifyingContract(next);
    }
  }, [chainId]);

  // Keep metadata group aligned with action type or selected payment platform.
  useEffect(() => {
    const derived = derivePlatformFromActionType(actionType, paymentPlatform);
    setMetadataPlatform((prev) => (prev !== derived ? derived : prev));
  }, [actionType, paymentPlatform]);


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
  };

  const handleOpenSettings = () => {
    openSidebar('/proofs');
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
    // Extension expects decimal intent hash; convert from hex
    const intentForProof = hexToDecimal(intentHash);
    generatePaymentProof(metadataPlatform, intentForProof, meta.originalIndex, proofIndex);

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

      // Normalize to bytes32 using Step 4 hash
      const intentHashHex = normalizeHex32(verifyIntentHash);
      const amount = calldataInputs.intentAmount;
      const timestampSec = ethers.BigNumber.from(calldataInputs.intentTimestamp || '0');
      const timestampMs = timestampSec.mul(1000).toString();
      const paymentMethod = paymentMethodHex || keccak256(paymentPlatform);
      const fiatCurrency = calldataInputs.fiatCurrency;
      const conversionRate = calldataInputs.conversionRate;
      const payeeDetails = calldataInputs.payeeDetails;

      const payload = {
        proofType: 'reclaim',
        proof: JSON.stringify({
          claim: proofClaim,
          signatures: proofData.proof?.signatures || proofData.signatures || {},
        }),
        chainId: chainId,
        verifyingContract: verifyingContract,
        intent: {
          intentHash: intentHashHex,
          amount,
          timestampMs,
          paymentMethod,
          fiatCurrency,
          conversionRate,
          payeeDetails,
          timestampBufferMs: '10000000',
        },
      };

      console.log('Payload:', payload);

      const endpoint = `${attestationBaseUrl}/verify/${paymentPlatform}/transfer_${metadataPlatform}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || `HTTP error! status: ${response.status} ${responseData.message}`
        );
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

  const encodePaymentAttestation = (attestationResponse: any, intentHashFallback?: string) => {
    const abi = new ethers.utils.AbiCoder();
    const resp = attestationResponse.responseObject ?? attestationResponse;
    const td = resp.typedDataValue || resp.typedData || {};
    const signatures: string[] = Array.isArray(resp.signatures)
      ? resp.signatures
      : (resp.signature ? [resp.signature] : []);

    const rawIntentHash = td.intentHash || intentHashFallback;
    if (!rawIntentHash) {
      throw new Error('Attestation response missing intent hash');
    }
    const intentHash = normalizeHex32(rawIntentHash);
    const releaseAmount = td.releaseAmount ?? resp.releaseAmount;
    const dataHash: string = td.dataHash ?? resp.dataHash;
    const encodedPaymentDetails: string = resp.encodedPaymentDetails;
    const metadata: string = resp.metadata || td.metadata || '0x';

    if (releaseAmount == null || !dataHash || !encodedPaymentDetails) {
      throw new Error('Attestation response missing required fields');
    }

    return abi.encode(
      ['tuple(bytes32,uint256,bytes32,bytes[],bytes,bytes)'],
      [[intentHash, ethers.BigNumber.from(releaseAmount), dataHash, signatures, encodedPaymentDetails, metadata]]
    );
  };

  const resolveVerificationData = (respObj: any) => {
    if (respObj?.verificationData) return respObj.verificationData;
    const signer = respObj?.signer || respObj?.attestorAddress || respObj?.attestor;
    if (!signer) {
      throw new Error('Attestation response missing verification data');
    }
    return ethers.utils.defaultAbiCoder.encode(['address'], [signer]);
  };

  // Function to generate fulfillIntent params
  const handleGenerateCalldata = () => {
    try {
      setCalldataError(null);
      setGeneratedCalldata('');
      
      // Validate required inputs
      if (!attestationResponse) throw new Error('Please generate an attestation first');

      // Parse attestation response
      const parsedAttestation = JSON.parse(attestationResponse);
      const respObj = parsedAttestation.responseObject ?? parsedAttestation;
      const td = respObj.typedDataValue || respObj.typedData || {};

      const rawIntentHash = td.intentHash || verifyIntentHash;
      if (!rawIntentHash) {
        throw new Error('Missing intent hash for fulfillIntent params');
      }
      const intentHashHex = normalizeHex32(rawIntentHash);

      const paymentProof = encodePaymentAttestation(parsedAttestation, intentHashHex);
      const verificationData = resolveVerificationData(respObj);
      const postIntentHookDataHex = postIntentHookData?.trim() ? postIntentHookData : '0x';

      const fulfillIntentParams = {
        paymentProof,
        intentHash: intentHashHex,
        verificationData,
        postIntentHookData: postIntentHookDataHex,
      };

      setGeneratedCalldata(JSON.stringify(fulfillIntentParams, null, 2));
    } catch (error) {
      console.error('Error generating fulfillIntent params:', error);
      setCalldataError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleCalldataInputChange = (field: string, value: string) => {
    setCalldataInputs((prev: typeof DEFAULT_CALLDATA_INPUTS) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle pasted proof changes
  const handlePastedProofChange = (value: string) => {
    setResultProof(value);
    // Try to validate if it's a valid proof JSON
    if (value.trim()) {
      try {
        const parsed = JSON.parse(value);
        // Check if it has the expected proof structure
        if (parsed.proof?.claim || parsed.claim) {
          setProofStatus('success');
        }
      } catch {
        // Not valid JSON yet, keep current status
      }
    } else {
      setProofStatus('idle');
    }
  };

  // Toggle paste mode
  const handleTogglePasteMode = () => {
    setIsPasteMode(!isPasteMode);
    if (!isPasteMode) {
      // Entering paste mode - reset proof state
      setResultProof('');
      setProofStatus('idle');
      setAttestationResponse(null);
      setAttestationError(null);
    }
  };

  // Initialize Step 4 intent hash once from Step 1 on mount
  useEffect(() => {
    setVerifyIntentHash(intentHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetchIntentFromChain = async () => {
    try {
      setFetchIntentError(null);
      setFetchIntentLoading(true);
      const netChain: 84532 | 8453 = chainId === 8453 ? 8453 : 84532;
      const hex = normalizeHex32(verifyIntentHash);
      const onchain = await fetchIntentDetails(netChain, hex);
      setCalldataInputs({
        intentAmount: onchain.amount,
        intentTimestamp: onchain.timestampSec,
        fiatCurrency: onchain.fiatCurrency,
        conversionRate: onchain.conversionRate,
        payeeDetails: onchain.payeeDetails || calldataInputs.payeeDetails,
      });
      setPaymentMethodHex(onchain.paymentMethod);
    } catch (e: any) {
      setFetchIntentError(e?.message || 'Failed to fetch intent from chain');
    } finally {
      setFetchIntentLoading(false);
    }
  };

  return (
    <PageWrapper>
      <MainContent>
        <AppContainer>
        <LeftPanel>
          <Section>
            <StepIndicator>
              <StepNumber>1</StepNumber>
              <StepLabel>Enter Provider</StepLabel>
            </StepIndicator>
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
              onChange={(e) => {
                const v = e.target.value;
                // Allow empty, optional 0x, and hex digits (unprefixed ok)
                if (v === '' || /^(0x)?[0-9a-fA-F]*$/.test(v)) {
                  setIntentHash(v);
                }
              }}
              onBlur={() => {
                try { setIntentHash(normalizeHex32(intentHash)); } catch {}
              }}
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
              <AdvancedHeader
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                aria-expanded={isAdvancedOpen}
                aria-controls="advanced-settings-panel"
              >
                <ThemedText.BodySmall>Advanced Settings</ThemedText.BodySmall>
                <AdvancedChevron size={16} $expanded={isAdvancedOpen} />
              </AdvancedHeader>
              {isAdvancedOpen && (
                <AdvancedContent id="advanced-settings-panel">
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
                    type="number"
                    step="1"
                    inputMode="numeric"
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
            <StepIndicator>
              <StepNumber>2</StepNumber>
              <StepLabel>Fetch Metadata</StepLabel>
            </StepIndicator>
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

        <ProofPanel>
          <Section>
            <StepIndicator>
              <StepNumber>3</StepNumber>
              <StepLabel>Generate zkTLS Proof</StepLabel>
            </StepIndicator>
            <StatusItem>
              <StatusLabel>Proof Status</StatusLabel>
              <AccessoryButton
                onClick={handleTogglePasteMode}
                height={32}
              >
                {isPasteMode ? 'Generate Mode' : 'Paste Proof'}
              </AccessoryButton>
            </StatusItem>
            {isPasteMode ? (
              <ProofContainer>
                <ThemedText.BodySecondary>
                  Paste your proof JSON below:
                </ThemedText.BodySecondary>
                <ProofTextArea
                  value={resultProof}
                  onChange={(e) => handlePastedProofChange(e.target.value)}
                  aria-label="Proof JSON"
                  placeholder='Paste your proof JSON here…&#10;&#10;Expected format:&#10;{&#10;  "proof": {&#10;    "claim": { … },&#10;    "signatures": { … }&#10;  }&#10;}'
                />
                {proofStatus === 'success' && (
                  <ThemedText.BodySecondary style={{ color: colors.validGreen }}>
                    Valid proof detected
                  </ThemedText.BodySecondary>
                )}
              </ProofContainer>
            ) : proofStatus !== 'idle' ? (
              <ProofContainer>
                {proofStatus === 'generating' && (
                  <SpinnerContainer>
                    <Spinner color={colors.defaultBorderColor} size={40} />
                    <SpinnerMessage>
                      Generating zero-knowledge proof…
                      <br />
                      This may take up to 30 seconds
                    </SpinnerMessage>
                  </SpinnerContainer>
                )}
                {(proofStatus === 'success' || proofStatus === 'error') && (
                  <>
                    <ThemedText.BodySecondary>
                      {proofStatus === 'success'
                        ? `Proof generated! ${proofGenerationDuration ? `(${(proofGenerationDuration / 1000).toFixed(1)}s)` : ''}`
                        : <>
                          Error generating proof: {' '}
                          <ErrorMessage>
                            {paymentProof?.error.message}
                          </ErrorMessage>
                        </>
                      }
                    </ThemedText.BodySecondary>
                    <ProofTextArea
                      readOnly
                      value={resultProof}
                      aria-label="Generated proof JSON"
                    />
                  </>
                )}
                {proofStatus === 'timeout' && (
                  <ThemedText.LabelSmall>
                    Timeout: no proof received.
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
        </ProofPanel>

        <VerifyPanel>
          <Section>
            <StepIndicator>
              <StepNumber>4</StepNumber>
              <StepLabel>Verify zkTLS Proof & Generate FulfillIntent Params</StepLabel>
            </StepIndicator>

            
            <VerifyGrid>
                <AttestationContainer>
                  <AttestationControls>
                    <StatusItem>
                      <StatusLabel>Attestation Service</StatusLabel>
                    </StatusItem>
                    <StyledInputContainer>
                    <StyledInputLabel htmlFor="verifyIntentHash">
                      Intent Hash (for Verify)
                    </StyledInputLabel>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                    <StyledSelect
                      as="input"
                      id="verifyIntentHash"
                      name="verifyIntentHash"
                      value={verifyIntentHash}
                      onChange={(e: any) => {
                        const v = e.target.value;
                        if (v === '' || /^(0x)?[0-9a-fA-F]*$/.test(v)) setVerifyIntentHash(v);
                      }}
                      onBlur={() => { try { setVerifyIntentHash(normalizeHex32(verifyIntentHash)); } catch {} }}
                      autoComplete="off"
                      inputMode="text"
                      spellCheck="false"
                      style={{ flex: 1 }}
                    />
                        <AccessoryButton
                          onClick={handleFetchIntentFromChain}
                          loading={fetchIntentLoading}
                          disabled={fetchIntentLoading}
                          height={40}
                          icon="chevronRight"
                          title="Fetch Intent"
                        />
                      </div>
                      {fetchIntentError && (
                        <ThemedText.LabelSmall style={{ color: colors.invalidRed, marginTop: 6 }}>
                          {fetchIntentError}
                        </ThemedText.LabelSmall>
                      )}
                    </StyledInputContainer>
                  <Input
                    label="Attestation Service URL"
                    name="attestationBaseUrl"
                    value={attestationBaseUrl}
                    onChange={(e) => setAttestationBaseUrl(e.target.value)}
                    valueFontSize="14px"
                    placeholder="https://attestation-service-staging.zkp2p.xyz…"
                    type="url"
                    inputMode="url"
                    readOnly={attestationLoading}
                  />
                  <StyledInputContainer>
                    <StyledInputLabel htmlFor="chainId">Chain</StyledInputLabel>
            <StyledSelect
              id="chainId"
              name="chainId"
              value={chainId}
              onChange={(e) => setChainId(parseInt(e.target.value))}
              disabled={attestationLoading}
            >
              <option value="84532">Base Sepolia (84532)</option>
              <option value="8453">Base (8453)</option>
            </StyledSelect>
                  </StyledInputContainer>
                  {/* Verifying Contract moved to Advanced */}
                  <AdvancedSection>
                    <AdvancedHeader
                      type="button"
                      onClick={() => setIsIntentAdvancedOpen(!isIntentAdvancedOpen)}
                      aria-expanded={isIntentAdvancedOpen}
                      aria-controls="intent-advanced-panel"
                    >
                      <ThemedText.BodySmall>Intent Details (Advanced)</ThemedText.BodySmall>
                      <AdvancedChevron size={16} $expanded={isIntentAdvancedOpen} />
                    </AdvancedHeader>
                    {isIntentAdvancedOpen && (
                      <AdvancedContent id="intent-advanced-panel">
                        <CalldataInputsContainer>
                          <CalldataInputsGrid>
                            <Input
                              label="Amount"
                              name="intentAmount"
                              value={calldataInputs.intentAmount}
                              onChange={(e) => handleCalldataInputChange('intentAmount', e.target.value)}
                              type="number"
                              step="1"
                              inputMode="numeric"
                              valueFontSize="14px"
                              placeholder="e.g. 1000000…"
                            />
                            <Input
                              label="Timestamp (sec)"
                              name="intentTimestamp"
                              value={calldataInputs.intentTimestamp}
                              onChange={(e) => handleCalldataInputChange('intentTimestamp', e.target.value)}
                              type="number"
                              step="1"
                              inputMode="numeric"
                              valueFontSize="14px"
                              placeholder="e.g. 1712345678…"
                            />
                            <Input
                              label="Payee Details (bytes32)"
                              name="payeeDetails"
                              value={calldataInputs.payeeDetails}
                              onChange={(e) => handleCalldataInputChange('payeeDetails', e.target.value)}
                              valueFontSize="14px"
                              placeholder="0x…"
                            />
                            <Input
                              label="Fiat Currency (bytes32)"
                              name="fiatCurrency"
                              value={calldataInputs.fiatCurrency}
                              onChange={(e) => handleCalldataInputChange('fiatCurrency', e.target.value)}
                              valueFontSize="14px"
                              placeholder="0x…"
                            />
                            <Input
                              label="Conversion Rate (1e18)"
                              name="conversionRate"
                              value={calldataInputs.conversionRate}
                              onChange={(e) => handleCalldataInputChange('conversionRate', e.target.value)}
                              type="number"
                              step="any"
                              inputMode="decimal"
                              valueFontSize="14px"
                              placeholder="e.g. 1.00…"
                            />
                            <Input
                              label="Payment Method (bytes32)"
                              name="paymentMethod"
                              value={paymentMethodHex}
                              onChange={(e) => setPaymentMethodHex(e.target.value)}
                              valueFontSize="14px"
                              placeholder="0x…"
                            />
                            <Input
                              label="Verifying Contract"
                              name="verifyingContract"
                              value={verifyingContract}
                              onChange={(e) => setVerifyingContract(e.target.value)}
                              valueFontSize="12px"
                              placeholder="e.g. 0x16b3…"
                            />
                            <Input
                              label="Post Intent Hook Data (bytes)"
                              name="postIntentHookData"
                              value={postIntentHookData}
                              onChange={(e) => setPostIntentHookData(e.target.value)}
                              valueFontSize="12px"
                              placeholder="0x…"
                            />
                          </CalldataInputsGrid>
                        </CalldataInputsContainer>
                      </AdvancedContent>
                    )}
                  </AdvancedSection>

                  <ButtonContainer>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Button
                        onClick={handleSendToAttestation}
                        disabled={attestationLoading || !resultProof || proofStatus !== 'success'}
                        loading={attestationLoading}
                        height={48}
                        width={216}
                      >
                        Verify Proof
                      </Button>
                      <Button
                        onClick={handleGenerateCalldata}
                        height={48}
                        width={216}
                        disabled={!attestationResponse}
                      >
                        Generate Params
                      </Button>
                    </div>
                  </ButtonContainer>
                </AttestationControls>
                </AttestationContainer>
                <VerifyRight>
                  {attestationResponse && (
                    <AttestationResultSection>
                      <ThemedText.BodySecondary>
                        ✅ Attestation Response:
                      </ThemedText.BodySecondary>
                      <AttestationResponseArea
                        readOnly
                        value={attestationResponse}
                        aria-label="Attestation response"
                      />
                    </AttestationResultSection>
                  )}
                  {attestationError && (
                    <AttestationErrorMessage>
                      ❌ Attestation Error: {attestationError}
                    </AttestationErrorMessage>
                  )}
                  {attestationResponse ? (
                    <CalldataOutputContainer>
                      {calldataError && (
                        <CalldataErrorMessage>
                          ❌ Error: {calldataError}
                        </CalldataErrorMessage>
                      )}
                      {generatedCalldata && (
                        <>
                          <ThemedText.BodySecondary>
                            ✅ FulfillIntent params generated successfully:
                          </ThemedText.BodySecondary>
                          <CalldataTextArea
                            readOnly
                            value={generatedCalldata}
                            aria-label="Fulfill intent calldata"
                            placeholder="Generated fulfillIntent params will appear here…"
                          />
                        </>
                      )}
                    </CalldataOutputContainer>
                  ) : null}
                </VerifyRight>
              </VerifyGrid>
            
          </Section>
        </VerifyPanel>
        </AppContainer>
      </MainContent>
    </PageWrapper>
  );
};

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem;
  width: 100%;
  max-width: 100vw;
  height: auto;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: visible;
  box-sizing: border-box;
  
  /* Tablet view - allow vertical scrolling */
  @media (max-width: 1400px) and (min-width: 769px) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
  
  @media (max-width: 768px) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
    align-items: flex-start;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1440px;
  height: auto;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    gap: 0;
  }
`;

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  height: auto;
  max-height: none;
  border-radius: ${radii.xl}px;
  border: 1px solid ${colors.defaultBorderColor};
  overflow: visible;
  background: ${colors.backgroundSecondary};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  
  /* Tablet view (landscape) - 2x2 grid with scrollable container */
  @media (max-width: 1400px) and (min-width: 769px) {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: minmax(320px, auto);
    row-gap: 0;
    column-gap: 0;
    height: auto;
    max-height: none;
    overflow: visible;
    padding: 0;
    
    /* Custom scrollbar for the container */
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
    }
  }
  
  /* Mobile view - stack vertically */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
    height: auto;
    max-height: none;
    border-radius: 0;
    border-left: none;
    border-right: none;
    overflow: visible;
  }
`;

const LeftPanel = styled.div`
  padding: 12px;
  overflow: visible;
  border-right: 1px solid ${colors.defaultBorderColor};
  height: auto;
  display: flex;
  flex-direction: column;
  
  /* Tablet view (landscape) - 2x2 grid */
  @media (max-width: 1400px) and (min-width: 769px) {
    border-right: 1px solid ${colors.defaultBorderColor};
    border-bottom: 1px solid ${colors.defaultBorderColor};
    height: auto; /* Let content size the cell */
    min-height: 0; /* Allow proper sizing within grid */
    overflow: visible;
  }
  
  /* Mobile view */
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid ${colors.defaultBorderColor};
    height: auto;
  }
`;

const MiddlePanel = styled.div`
  padding: 12px;
  overflow: visible;
  border-right: 1px solid ${colors.defaultBorderColor};
  height: auto;
  display: flex;
  flex-direction: column;
  
  /* Tablet view (landscape) - 2x2 grid */
  @media (max-width: 1400px) and (min-width: 769px) {
    border-right: none;
    border-bottom: 1px solid ${colors.defaultBorderColor};
    height: auto; /* Let content size the cell */
    min-height: 0; /* Allow proper sizing within grid */
    overflow: visible;
  }
  
  /* Mobile view */
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid ${colors.defaultBorderColor};
    height: auto;
  }
`;

const ProofPanel = styled.div`
  padding: 12px;
  overflow: visible;
  border-right: none;
  height: auto;
  display: flex;
  flex-direction: column;
  
  /* Tablet view (landscape) - 2x2 grid */
  @media (max-width: 1400px) and (min-width: 769px) {
    border-right: 1px solid ${colors.defaultBorderColor};
    border-bottom: none;
    height: auto; /* Let content size the cell */
    min-height: 0; /* Allow proper sizing within grid */
    overflow: visible;
  }
  
  /* Mobile view */
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid ${colors.defaultBorderColor};
    height: auto;
  }
`;

const VerifyPanel = styled.div`
  padding: 12px;
  overflow: visible;
  border-right: none;
  border-top: 1px solid ${colors.defaultBorderColor};
  height: auto;
  display: flex;
  flex-direction: column;
  grid-column: 1 / -1; /* span all columns */
  
  @media (max-width: 1400px) and (min-width: 769px) {
    border-right: none;
    border-bottom: none;
    height: auto;
    min-height: 0;
    overflow: visible;
  }
  
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid ${colors.defaultBorderColor};
    height: auto;
  }
`;

const Section = styled.div`
  padding: 5px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: auto;
  min-height: 0;
  min-width: 0;
  width: 100%;
  overflow: visible;
  
  /* Custom scrollbar for internal content */
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.3) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.3);
    border-radius: 20px;
  }
  
  /* Ensure content doesn't overflow in tablet view */
  @media (max-width: 1400px) and (min-width: 769px) {
    height: 100%;
    min-height: 0;
    overflow-y: auto;
  }
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
`;

const StatusLabel = styled.div`
  font-family: ${fontFamilies.headline};
  font-weight: ${fontWeights.semibold};
  letter-spacing: ${letterSpacing.headline};
  line-height: ${lineHeights.headline};
  text-transform: uppercase;
  margin-right: 10px;
  text-wrap: balance;
`;

const StatusValue = styled.div`
  color: ${colors.connectionStatusGreen};
  margin-right: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 2px;
`;

const MetadataList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* Keep the list from stretching the page; scroll within the panel */
  max-height: min(520px, 60vh);
  overflow-y: auto;
  padding-right: 4px;
  -webkit-overflow-scrolling: touch;
  
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
  
  @media (max-width: 768px) {
    max-height: 45vh;
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
  border-radius: ${radii.md}px;
  background-color: ${(p) =>
    p.selected ? opacify(10, colors.white) : colors.backgroundSecondary};
  
  &:hover {
    background-color: ${(p) =>
      p.selected ? opacify(14, colors.white) : opacify(6, colors.white)};
  }
`;

const MetadataInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  word-break: break-word;
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
  min-height: 260px;
  max-height: 440px;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: ${radii.md}px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-sizing: border-box;
  background: ${colors.inputDefaultColor};
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
  
  @media (max-width: 768px) {
    min-height: 250px;
  }
`;

const ErrorMessage = styled.span`
  color: ${colors.invalidRed};
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  border-radius: ${radii.md}px;
  box-sizing: border-box;
  background-color: ${colors.backgroundSecondary};
  flex: 1;
`;

const SpinnerMessage = styled(ThemedText.LabelSmall)`
  margin-top: 15px;
  text-align: center;
  opacity: 0.8;
`;

const IconButton = styled.button.attrs({ type: 'button' })`
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

  &:focus-visible {
    outline: 1px solid ${opacify(30, colors.white)};
    outline-offset: 2px;
  }
`;

const StyledChevronRight = styled(ChevronRight).attrs({ 'aria-hidden': true })`
  width: 16px;
  height: 16px;
  color: ${colors.white};
`;

const AdvancedChevron = styled(ChevronRight).attrs({ 'aria-hidden': true })<{
  $expanded?: boolean;
}>`
  width: 16px;
  height: 16px;
  color: ${colors.white};
  transition: transform 0.2s ease;
  transform: ${({ $expanded }) => ($expanded ? 'rotate(90deg)' : 'rotate(0deg)')};
`;

const EmptyStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  padding: 20px;
  
  @media (max-width: 768px) {
    min-height: 200px;
  }
`;

const EmptyStateMessage = styled(ThemedText.BodySmall)`
  text-align: center;
  opacity: 0.6;
`;

const AdvancedSection = styled.div`
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: ${radii.md}px;
  overflow: hidden;
  background: ${colors.backgroundSecondary};
`;

const AdvancedHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  background: ${opacify(8, colors.white)};
  border: none;
  width: 100%;
  text-align: left;
  
  &:hover {
    background: ${opacify(12, colors.white)};
  }

  &:focus-visible {
    outline: 1px solid ${opacify(30, colors.white)};
    outline-offset: 2px;
  }
`;

const AdvancedContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-top: 1px solid ${colors.defaultBorderColor};
`;

// (AttestationPanel removed after consolidating Step 4 and Step 5)

const AttestationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const AttestationControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: stretch;
  
  @media (max-width: 480px) {
    flex-direction: column;
    
    select, button, input {
      width: 100%;
    }
  }
`;

const AttestationResultSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: ${radii.md}px;
  border: 1px solid transparent;
  background-color: ${colors.inputDefaultColor};
  width: 100%;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-within {
    border-color: ${colors.white};
    box-shadow: 0 0 0 2px ${opacify(20, colors.white)};
  }
`;

const StyledInputLabel = styled.label`
  font-size: 14px;
  font-weight: ${fontWeights.semibold};
  color: ${colors.textSecondary};
  margin-bottom: 10px;
`;

const StyledSelect = styled.select`
  width: 100%;
  border: 0;
  padding: 0;
  color: ${colors.darkText};
  background-color: transparent;
  font-size: 14px;
  font-family: ${fontFamilies.body};
  font-weight: ${fontWeights.medium};
  line-height: ${lineHeights.body};
  font-variant-numeric: tabular-nums;
  cursor: pointer;

  &:focus {
    box-shadow: none;
    outline: none;
  }

  &:focus-visible {
    box-shadow: none;
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  option {
    background: ${colors.container};
    color: ${colors.darkText};
  }
`;

const AttestationResponseArea = styled.textarea`
  width: 100%;
  flex: 1;
  min-height: 250px;
  max-height: calc(100vh - 300px);
  padding: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: ${radii.md}px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-sizing: border-box;
  background: ${colors.inputDefaultColor};
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
  
  @media (max-width: 768px) {
    min-height: 250px;
  }
`;

const AttestationErrorMessage = styled.div`
  padding: 10px;
  background: ${opacify(10, colors.invalidRed)};
  border: 1px solid ${opacify(30, colors.invalidRed)};
  border-radius: ${radii.sm}px;
  color: ${colors.invalidRed};
  font-size: 14px;
`;

// CalldataSection/CalldataContent removed after inlining into the App grid



const CalldataInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CalldataInputsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CalldataOutputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const VerifyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const VerifyRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

const CalldataTextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  height: auto;
  max-height: 300px;
  padding: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: ${radii.md}px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  box-sizing: border-box;
  background: ${colors.inputDefaultColor};
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
  
  @media (max-width: 768px) {
    min-height: 150px;
  }
`;

const CalldataErrorMessage = styled.div`
  padding: 10px;
  background: ${opacify(10, colors.invalidRed)};
  border: 1px solid ${opacify(30, colors.invalidRed)};
  border-radius: ${radii.sm}px;
  color: ${colors.invalidRed};
  font-size: 14px;
`;

export { Home };
