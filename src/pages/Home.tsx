import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { browserName } from 'react-device-detect';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Button } from '@components/common/Button';
import useExtensionProxyProofs from '@hooks/contexts/useExtensionProxyProofs';
import { ExtensionRequestMetadata, ProofGenerationStatus } from '@helpers/types';
import chromeSvg from '../assets/images/browsers/chrome.svg';
import braveSvg from '../assets/images/browsers/brave.svg';

const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/zkp2p-extension/ijpgccednehjpeclfcllnjjcmiohdjih';


const Home: React.FC = () => {
  // Form inputs
  const [intentHash, setIntentHash] = useState<string>('0x0000000000000000000000000000000000000000000000000000000000000000');
  const [actionType, setActionType] = useState<string>('transfer_venmo');
  const [paymentPlatform, setPaymentPlatform] = useState<string>('venmo');
  const [isInstallExtensionClicked, setIsInstallExtensionClicked] = useState<boolean>(false);
  
  // Extension state
  const [selectedMetadata, setSelectedMetadata] = useState<ExtensionRequestMetadata | null>(null);
  const [proofStatus, setProofStatus] = useState<string>('idle');
  const [resultProof, setResultProof] = useState<string>('');

  // Get extension context
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
    resetProofState
  } = useExtensionProxyProofs();

  // Track when we receive metadata from the extension
  useEffect(() => {
    if (platformMetadata[paymentPlatform]?.metadata) {
      console.log('Received metadata:', platformMetadata[paymentPlatform]?.metadata);
    }
  }, [platformMetadata, paymentPlatform]);

  // Handle proof updates
  useEffect(() => {
    if (paymentProof) {
      console.log('Received proof:', paymentProof);
      
      if (paymentProof.status === 'success') {
        setProofStatus('success');
        setResultProof(JSON.stringify(paymentProof.proof, null, 2));
      } else if (paymentProof.status === 'error') {
        setProofStatus('error');
        setResultProof(JSON.stringify(paymentProof, null, 2));
      } else {
        setProofStatus('pending');
      }
    }
  }, [paymentProof]);

  // Open new tab to get metadata
  const handleOpenNewTab = () => {
    if (!intentHash || !actionType || !paymentPlatform) {
      alert('Please fill out all fields');
      return;
    }
    
    console.log(`Opening new tab for ${actionType} on ${paymentPlatform} with intent hash ${intentHash}`);
    openNewTab(actionType, paymentPlatform);
    setSelectedMetadata(null);
    setProofStatus('idle');
    setResultProof('');
  };

  const handleOpenSettings = () => {
    console.log('Opening settings');
    openSidebar('/settings');
  };

  // Generate proof for selected metadata
  const handleGenerateProof = (metadata: ExtensionRequestMetadata) => {
    setSelectedMetadata(metadata);
    setProofStatus('generating');
    
    // Reset any existing proof state
    resetProofState();
    
    // Start the proof generation process
    generatePaymentProof(paymentPlatform, intentHash, metadata.originalIndex);
    
    // Set up polling for proof status
    const intervalId = setInterval(() => {
      fetchPaymentProof(paymentPlatform);
    }, 3000);
    
    // Clean up interval after 60 seconds (timeout)
    setTimeout(() => {
      clearInterval(intervalId);
      if (proofStatus !== 'success') {
        setProofStatus('timeout');
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  };

  const handleInstallExtensionClicked = () => {
    window.open(CHROME_EXTENSION_URL, '_blank');
    setIsInstallExtensionClicked(true);
  };

  const browserSvg = () => {
    switch (browserName) {
      case 'Brave':
        return braveSvg;
      case 'Chrome':
      default:
        return chromeSvg;
    }
  };

  const addToBrowserCopy = () => {
    switch (browserName) {
      case 'Brave':
        return 'Add to Brave';
      case 'Chrome':
        return 'Add to Chrome';
      default:
        return 'Add to browser';
    }
  };

  return (
    <Container>
      <ThemedText.HeadlineSmall>ZKP2P Providers Dev Tool</ThemedText.HeadlineSmall>
      
      <StatusContainer>
        <StatusItem>
          <StatusLabel>Extension Installed:</StatusLabel>
          <StatusValue>{isSidebarInstalled ? 'Yes' : 'No'}</StatusValue>
        </StatusItem>
        {isSidebarInstalled && (
          <StatusItem>
            <StatusLabel>Extension Version:</StatusLabel>
            <StatusValue>{sideBarVersion || 'Unknown'}</StatusValue>
          </StatusItem>
        )}
      </StatusContainer>

      
      <FormContainer>
        <FormGroup>
          <Label>Intent Hash:</Label>
          <Input
            value={intentHash}
            onChange={(e) => setIntentHash(e.target.value)}
            placeholder="Enter intent hash"
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Action Type:</Label>
          <Input
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            placeholder="Enter action type (e.g., payments)"
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Payment Platform:</Label>
          <Input
            value={paymentPlatform}
            onChange={(e) => setPaymentPlatform(e.target.value)}
            placeholder="Enter payment platform (e.g., venmo)"
          />
        </FormGroup>

        {!isSidebarInstalled && (
          <ButtonContainer>
            <Button
              onClick={handleInstallExtensionClicked}
              height={48}
              width={216}
              leftAccessorySvg={browserSvg()}
              loading={isInstallExtensionClicked}
              disabled={isInstallExtensionClicked}
            >
              { addToBrowserCopy() }
            </Button>
          </ButtonContainer>
        )}

        { isInstallExtensionClicked && (
          <ThemedText.LabelSmall textAlign="left">
            Waiting for installation. Try refreshing page.
          </ThemedText.LabelSmall>
        )}
        <ButtonContainer>
          <Button
            onClick={handleOpenSettings}
            height={48}
            width={216}
          >
            Open Settings
          </Button>
        </ButtonContainer>

        <ButtonContainer>
          <Button
            onClick={handleOpenNewTab}
            height={48}
            width={216}
          >
            Authenticate
          </Button>
        </ButtonContainer>
      </FormContainer>
      
      {platformMetadata[paymentPlatform]?.metadata && (
        <MetadataContainer>
          <ThemedText.SubHeaderSmall>Available Metadata</ThemedText.SubHeaderSmall>
          {platformMetadata[paymentPlatform].metadata.map((metadata, index) => (
            <MetadataItem 
              key={index}
              onClick={() => handleGenerateProof(metadata)}
              selected={selectedMetadata?.originalIndex === metadata.originalIndex}
            >
              <MetadataInfo>
                <MetadataField>Amount: {metadata.amount || 'N/A'}</MetadataField>
                <MetadataField>Date: {metadata.date || 'N/A'}</MetadataField>
                <MetadataField>Recipient: {metadata.recipient || 'N/A'}</MetadataField>
                <MetadataField>Index: {metadata.originalIndex}</MetadataField>
              </MetadataInfo>
              <Button 
                onClick={() => {
                  handleGenerateProof(metadata);
                }}
                disabled={selectedMetadata?.originalIndex === metadata.originalIndex && proofStatus === 'generating'}
              >
                Generate Proof
              </Button>
            </MetadataItem>
          ))}
        </MetadataContainer>
      )}
      
      {proofStatus !== 'idle' && (
        <ProofContainer>
          <ThemedText.SubHeaderSmall>
            Proof Status: {proofStatus}
          </ThemedText.SubHeaderSmall>
          
          {proofStatus === 'generating' && (
            <div>Generating proof, please wait...</div>
          )}
          
          {proofStatus === 'success' && (
            <>
              <div>Proof generated successfully!</div>
              <ProofTextArea readOnly value={resultProof} />
            </>
          )}
          
          {proofStatus === 'error' && (
            <>
              <div>Error generating proof</div>
              <ProofTextArea readOnly value={resultProof} />
            </>
          )}
          
          {proofStatus === 'timeout' && (
            <div>Proof generation timed out</div>
          )}
        </ProofContainer>
      )}
    </Container>
  );
};

// Styled components
const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;


const StatusContainer = styled.div`
  margin: 20px 0;
  padding: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
`;

const StatusItem = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

const StatusLabel = styled.div`
  font-weight: bold;
  margin-right: 10px;
`;

const StatusValue = styled.div`
  color: ${colors.connectionStatusGreen};
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: bold;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 4px;
`;

const MetadataContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
`;

const MetadataItem = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid ${props => props.selected ? colors.selectorHoverBorder : colors.defaultBorderColor};
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.selected ? colors.selectorHoverBorder : 'transparent'};
  
  &:hover {
    background-color: ${props => props.selected ? colors.selectorHoverBorder : colors.selectorHover};
  }
`;

const MetadataInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const MetadataField = styled.div`
  font-size: 14px;
`;

const ProofContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
`;

const ProofTextArea = styled.textarea`
  width: 100%;
  height: 300px;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
`;

export { Home };