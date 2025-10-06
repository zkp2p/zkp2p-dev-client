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
import { ethers } from 'ethers';
import { unifiedVerifierAbi } from '../abis/UnifiedVerifierAbi';
import { keccak256 } from '@helpers/keccack';

const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/zkp2p-extension/ijpgccednehjpeclfcllnjjcmiohdjih';
const PROOF_FETCH_INTERVAL = 3000;
const PROOF_GENERATION_TIMEOUT = 60000;

// Step indicator component
const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-top: 5px;
  padding-bottom: 15px;
  border-bottom: 1px solid ${colors.defaultBorderColor};
  background: ${colors.container};
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
`;

const StepLabel = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${colors.white};
`;

const Home: React.FC = () => {
  const [intentHash, setIntentHash] = useState(() => {
    return localStorage.getItem('intentHash') || '11114168264614898234767045087100892814911930784849242636571146569793237988689';
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
  const [verifyingContract, setVerifyingContract] = useState<string>(() => {
    const stored = localStorage.getItem('verifyingContract');
    return stored || '0xA22aE87e99d614e6e04d787c67C609E24F223F6C';
  });
  const [attestationBaseUrl, setAttestationBaseUrl] = useState<string>(() => {
    const stored = localStorage.getItem('attestationBaseUrl');
    return stored || 'https://attestation-service-staging.zkp2p.xyz';
  });

  const [triggerProofFetchPolling, setTriggerProofFetchPolling] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const proofTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calldata generation state
  const DEFAULT_CALLDATA_INPUTS = {
    depositToken: '',
    intentAmount: '',
    intentTimestamp: '',
    payeeDetails: '',
    fiatCurrency: '',
    conversionRate: '',
    depositData: '0x0000000000000000000000000000000000000000000000000000000000000000'
  };

  const CALLDATA_LS_PREFIX = 'verifyPaymentCalldata:';

  const [calldataInputs, setCalldataInputs] = useState(() => {
    try {
      const saved = localStorage.getItem(`${CALLDATA_LS_PREFIX}${intentHash}`);
      return saved ? JSON.parse(saved) : DEFAULT_CALLDATA_INPUTS;
    } catch {
      return DEFAULT_CALLDATA_INPUTS;
    }
  });
  const [generatedCalldata, setGeneratedCalldata] = useState<string>('');
  const [calldataError, setCalldataError] = useState<string | null>(null);

  // Persist calldata inputs per-intent
  useEffect(() => {
    try {
      localStorage.setItem(`${CALLDATA_LS_PREFIX}${intentHash}`, JSON.stringify(calldataInputs));
    } catch {}
  }, [calldataInputs, intentHash]);

  // Load saved calldata inputs when intentHash changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${CALLDATA_LS_PREFIX}${intentHash}`);
      setCalldataInputs(saved ? JSON.parse(saved) : DEFAULT_CALLDATA_INPUTS);
    } catch {
      setCalldataInputs(DEFAULT_CALLDATA_INPUTS);
    }
  }, [intentHash]);

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

      // Derive intent fields from existing inputs
      const amount = calldataInputs.intentAmount || '0';
      const timestampSec = calldataInputs.intentTimestamp
        ? ethers.BigNumber.from(calldataInputs.intentTimestamp)
        : ethers.BigNumber.from(0);
      const timestampMs = timestampSec.mul(1000).toString();
      const paymentMethod = keccak256(paymentPlatform);
      const fiatCurrency = calldataInputs.fiatCurrency || keccak256('USD');
      const conversionRate = calldataInputs.conversionRate || '0';
      const payeeDetails = calldataInputs.payeeDetails || '0x0000000000000000000000000000000000000000000000000000000000000000';
      // Normalize intentHash to bytes32 hex (support decimal input)
      const intentHashInput = (intentHash || '').trim();
      const intentHashHex = intentHashInput.startsWith('0x')
        ? ethers.utils.hexZeroPad(intentHashInput, 32)
        : ethers.utils.hexZeroPad(ethers.BigNumber.from(intentHashInput).toHexString(), 32);

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

      const endpoint = `${attestationBaseUrl}/verify/${paymentPlatform}/transfer_${paymentPlatform}`;

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

  // Helper function to encode PaymentAttestation struct (updated for new contract)
  const encodePaymentAttestation = (attestationResponse: any) => {
    const abiCoder = new ethers.utils.AbiCoder();

    const respObj = attestationResponse.responseObject || attestationResponse;
    const typedData = respObj.typedDataValue || respObj.typedData || {};

    // signatures may be a single string or an array
    const signaturesArray: string[] = Array.isArray(respObj.signatures)
      ? respObj.signatures
      : (respObj.signature ? [respObj.signature] : []);

    // Helpers
    const ZERO32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const toBytes32 = (v?: any, fallback?: string) => {
      try {
        if (!v || v === '0x') return fallback || ZERO32;
        if (ethers.utils.isHexString(v)) return ethers.utils.hexZeroPad(v, 32);
        // if decimal-like string
        if (typeof v === 'string' && /^\d+$/.test(v)) {
          return ethers.utils.hexZeroPad(ethers.BigNumber.from(v).toHexString(), 32);
        }
        // hash arbitrary string to bytes32
        if (typeof v === 'string') return keccak256(v);
      } catch {}
      return fallback || ZERO32;
    };

    // Normalize values from response/state
    const method = toBytes32(typedData.method || typedData.paymentMethod || keccak256(paymentPlatform));
    const currency = toBytes32(typedData.currency || calldataInputs.fiatCurrency || keccak256('USD'));

    // PaymentDetails tuple: (method, payeeId, amount, currency, timestamp, paymentId)
    const paymentDetailsTuple = [
      method,                                                     // bytes32 method
      toBytes32(typedData.payeeId || typedData.recipientId, toBytes32(calldataInputs.payeeDetails)), // bytes32 payeeId
      ethers.BigNumber.from(typedData.amount || 0),               // uint256 amount (cents)
      currency,                                                   // bytes32 currency
      ethers.BigNumber.from(typedData.timestamp || 0),            // uint256 timestamp (ms)
      toBytes32(typedData.paymentId),                             // bytes32 paymentId
    ];

    // IntentSnapshot tuple
    const intentHashInput = (typedData.intentHash || intentHash || '').trim();
    const intentHashHex = toBytes32(intentHashInput);

    const intentSnapshotTuple = [
      intentHashHex,                                              // bytes32 intentHash
      ethers.BigNumber.from(calldataInputs.intentAmount || '0'),  // uint256 amount (tokens)
      method,                                                     // bytes32 paymentMethod
      toBytes32(calldataInputs.fiatCurrency, currency),           // bytes32 fiatCurrency
      toBytes32(calldataInputs.payeeDetails),                     // bytes32 payeeDetails
      ethers.BigNumber.from(calldataInputs.conversionRate || '0'),// uint256 conversionRate
      ethers.BigNumber.from(calldataInputs.intentTimestamp || '0'),// uint256 signalTimestamp (sec)
      ethers.BigNumber.from('10000000'),                          // uint256 timestampBuffer (ms)
    ];

    // Encode payload data and compute hash (or use provided dataHash)
    const dataPayload = abiCoder.encode(
      [
        'tuple(bytes32,bytes32,uint256,bytes32,uint256,bytes32)',
        'tuple(bytes32,uint256,bytes32,bytes32,bytes32,uint256,uint256,uint256)'
      ],
      [paymentDetailsTuple, intentSnapshotTuple]
    );

    const dataHash = typedData.dataHash || ethers.utils.keccak256(dataPayload);
    const releaseAmount = typedData.releaseAmount;
    if (releaseAmount === undefined || releaseAmount === null) {
      throw new Error('Attestation typedData missing releaseAmount');
    }

    // PaymentAttestation tuple: (intentHash, releaseAmount, dataHash, signatures, data, metadata)
    const paymentAttestationTuple = [
      intentHashHex,
      ethers.BigNumber.from(releaseAmount),
      dataHash,
      signaturesArray,
      dataPayload,
      typedData.metadata || '0x',
    ];

    return abiCoder.encode(
      ['tuple(bytes32,uint256,bytes32,bytes[],bytes,bytes)'],
      [paymentAttestationTuple]
    );
  };

  // Function to generate calldata for verifyPayment
  const handleGenerateCalldata = () => {
    try {
      setCalldataError(null);
      setGeneratedCalldata('');
      
      // Validate required inputs
      if (!attestationResponse) {
        throw new Error('Please generate an attestation first');
      }
      
      if (!resultProof) {
        throw new Error('Please generate a zkTLS proof first');
      }
      
      
      // Parse attestation response
      const parsedAttestation = JSON.parse(attestationResponse);
      
      // Validate that the response has the expected structure (supports typedDataValue or typedData)
      const respObj = parsedAttestation.responseObject || parsedAttestation;
      if (!respObj.typedDataValue && !respObj.typedData) {
        throw new Error('Invalid attestation response structure');
      }
      
      // Parse the zkTLS proof to extract attestorAddress
      const zkTlsProof = JSON.parse(resultProof);
      if (!zkTlsProof.proof?.signatures?.attestorAddress) {
        throw new Error('Attestor address not found in zkTLS proof');
      }
      
      const attestorAddress = zkTlsProof.proof.signatures.attestorAddress;
      
      // Encode the attestorAddress as bytes for the data field
      // This matches the contract's expected format for attestation data
      const attestationData = ethers.utils.defaultAbiCoder.encode(
        ['address'],
        [attestorAddress]
      );

      // Encode PaymentAttestation as bytes using the full response
      const encodedPaymentProof = encodePaymentAttestation(parsedAttestation);
      
      // Create ethers Interface using the unifiedVerifierAbi
      const verifierInterface = new ethers.utils.Interface(unifiedVerifierAbi);
      
      // Normalize intentHash to bytes32 (supports decimal input)
      const intentHashInput = (intentHash || '').trim();
      const intentHashHex = intentHashInput.startsWith('0x')
        ? ethers.utils.hexZeroPad(intentHashInput, 32)
        : ethers.utils.hexZeroPad(ethers.BigNumber.from(intentHashInput).toHexString(), 32);

      // Create VerifyPaymentData struct for the new contract interface
      const verifyPaymentData = {
        intentHash: intentHashHex,
        paymentProof: encodedPaymentProof,
        data: attestationData
      } as const;
      
      // Use the Interface to encode the function call
      const calldata = verifierInterface.encodeFunctionData('verifyPayment', [verifyPaymentData]);
      
      setGeneratedCalldata(calldata);
    } catch (error) {
      console.error('Error generating calldata:', error);
      setCalldataError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleCalldataInputChange = (field: string, value: string) => {
    setCalldataInputs((prev: typeof DEFAULT_CALLDATA_INPUTS) => ({
      ...prev,
      [field]: value
    }));
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
        </ProofPanel>

        </AppContainer>

        <CalldataSection>
          <CalldataContent>
            <StepIndicator>
              <StepNumber>4</StepNumber>
              <StepLabel>Verify zkTLS Proof & Generate Calldata</StepLabel>
            </StepIndicator>

            <StatusItem>
              <StatusLabel>Attestation Service</StatusLabel>
            </StatusItem>
            {proofStatus === 'success' ? (
              <AttestationContainer>
                <AttestationControls>
                  <Input
                    label="Attestation Service URL"
                    name="attestationBaseUrl"
                    value={attestationBaseUrl}
                    onChange={(e) => setAttestationBaseUrl(e.target.value)}
                    valueFontSize="14px"
                    placeholder="http://localhost:8080"
                    readOnly={attestationLoading}
                  />
                  <StyledInputContainer>
                    <StyledInputLabel>Chain</StyledInputLabel>
                    <StyledSelect
                      value={chainId}
                      onChange={(e) => setChainId(parseInt(e.target.value))}
                      disabled={attestationLoading}
                    >
                      <option value="84532">Base Sepolia (84532)</option>
                      <option value="8453">Base (8453)</option>
                      <option value="31337">Local (31337)</option>
                    </StyledSelect>
                  </StyledInputContainer>
                  <Input
                    label="Verifying Contract"
                    name="verifyingContract"
                    value={verifyingContract}
                    onChange={(e) => setVerifyingContract(e.target.value)}
                    valueFontSize="12px"
                    placeholder="0xA22aE87e99d614e6e04d787c67C609E24F223F6C"
                    readOnly={attestationLoading}
                  />
                  <StatusItem>
                    <StatusLabel>VerifyPayment Calldata</StatusLabel>
                  </StatusItem>
                  <CalldataInputsContainer>
                    <CalldataInputsGrid>
                      <Input
                        label="Deposit Token Address"
                        name="depositToken"
                        value={calldataInputs.depositToken}
                        onChange={(e) => handleCalldataInputChange('depositToken', e.target.value)}
                        valueFontSize="14px"
                        placeholder="0x..."
                      />
                      <Input
                        label="Intent Amount"
                        name="intentAmount"
                        value={calldataInputs.intentAmount}
                        onChange={(e) => handleCalldataInputChange('intentAmount', e.target.value)}
                        valueFontSize="14px"
                        placeholder="Amount in wei"
                      />
                      <Input
                        label="Intent Timestamp"
                        name="intentTimestamp"
                        value={calldataInputs.intentTimestamp}
                        onChange={(e) => handleCalldataInputChange('intentTimestamp', e.target.value)}
                        valueFontSize="14px"
                        placeholder="Unix timestamp"
                      />
                      <Input
                        label="Payee Details (bytes32)"
                        name="payeeDetails"
                        value={calldataInputs.payeeDetails}
                        onChange={(e) => handleCalldataInputChange('payeeDetails', e.target.value)}
                        valueFontSize="14px"
                        placeholder="0x... (32 bytes hash)"
                      />
                      <Input
                        label="Fiat Currency (bytes32)"
                        name="fiatCurrency"
                        value={calldataInputs.fiatCurrency}
                        onChange={(e) => handleCalldataInputChange('fiatCurrency', e.target.value)}
                        valueFontSize="14px"
                        placeholder="0x... (32 bytes hash)"
                      />
                      <Input
                        label="Conversion Rate"
                        name="conversionRate"
                        value={calldataInputs.conversionRate}
                        onChange={(e) => handleCalldataInputChange('conversionRate', e.target.value)}
                        valueFontSize="14px"
                        placeholder="Rate in wei"
                      />
                      <Input
                        label="Deposit Data (bytes)"
                        name="depositData"
                        value={calldataInputs.depositData}
                        onChange={(e) => handleCalldataInputChange('depositData', e.target.value)}
                        valueFontSize="14px"
                        placeholder="32 bytes (default: 0x000...000)"
                      />
                    </CalldataInputsGrid>
                  </CalldataInputsContainer>

                  <ButtonContainer>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Button
                        onClick={handleSendToAttestation}
                        disabled={attestationLoading}
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
                        Generate Calldata
                      </Button>
                    </div>
                  </ButtonContainer>
                </AttestationControls>
                {attestationResponse && (
                  <AttestationResultSection>
                    <ThemedText.BodySecondary>
                      ✅ Attestation Response:
                    </ThemedText.BodySecondary>
                    <AttestationResponseArea readOnly value={attestationResponse} />
                  </AttestationResultSection>
                )}
                {attestationError && (
                  <AttestationErrorMessage>
                    ❌ Attestation Error: {attestationError}
                  </AttestationErrorMessage>
                )}
              </AttestationContainer>
            ) : (
              <EmptyStateContainer>
                <EmptyStateMessage>
                  Generate a proof first to enable attestation service
                </EmptyStateMessage>
              </EmptyStateContainer>
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
                      ✅ Calldata generated successfully:
                    </ThemedText.BodySecondary>
                    <CalldataTextArea
                      readOnly
                      value={generatedCalldata}
                      placeholder="Generated calldata will appear here"
                    />
                  </>
                )}
              </CalldataOutputContainer>
            ) : (
              <EmptyStateContainer>
                <EmptyStateMessage>
                  Generate an attestation first to enable calldata generation
                </EmptyStateMessage>
              </EmptyStateContainer>
            )}
          </CalldataContent>
        </CalldataSection>
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
  max-width: min(2200px, 100vw - 2rem);
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
  border-radius: 8px;
  border: 1px solid ${colors.defaultBorderColor};
  overflow: visible;
  background: ${colors.container};
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
  padding: 15px;
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
  padding: 15px;
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
  padding: 15px;
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
  margin-top: 2px;
`;

const MetadataList = styled.div`
  max-height: none;
  overflow-y: visible;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
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
  min-height: 260px;
  max-height: 440px;
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
  
  @media (max-width: 768px) {
    min-height: 250px;
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
  border-radius: 16px;
  border: 1px solid ${colors.defaultBorderColor};
  background-color: ${colors.inputDefaultColor};
  width: 100%;
  box-sizing: border-box;

  &:focus-within {
    border-color: ${colors.inputPlaceholderColor};
  }
`;

const StyledInputLabel = styled.label`
  font-size: 14px;
  font-weight: 550;
  color: #CED4DA;
  margin-bottom: 10px;
`;

const StyledSelect = styled.select`
  width: 100%;
  border: 0;
  padding: 0;
  color: ${colors.darkText};
  background-color: ${colors.inputDefaultColor};
  font-size: 14px;
  cursor: pointer;

  &:focus {
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
  
  @media (max-width: 768px) {
    min-height: 250px;
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

const CalldataSection = styled.div`
  width: 100%;
  min-height: fit-content;
  border-radius: 8px;
  border: 1px solid ${colors.defaultBorderColor};
  background: ${colors.container};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    border-radius: 0;
    border-left: none;
    border-right: none;
    padding: 15px;
  }
`;

const CalldataContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CalldataWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  min-height: fit-content;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: 15px;
  }
`;

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

const CalldataTextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  height: auto;
  max-height: 300px;
  padding: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  box-sizing: border-box;
  background: rgba(0, 128, 0, 0.05);
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
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 4px;
  color: #FF3B30;
  font-size: 14px;
`;

export { Home };
