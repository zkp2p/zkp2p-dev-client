import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { browserName } from 'react-device-detect';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import useProviderBuilder from '@hooks/contexts/useProviderBuilder';
import { PlatformDetails, ProviderTemplate, RequestLog } from '@helpers/types/providerBuilder';
import chromeSvg from '../assets/images/browsers/chrome.svg';
import braveSvg from '../assets/images/browsers/brave.svg';
import { ChevronRight } from 'react-feather';

const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/zkp2p-extension/ijpgccednehjpeclfcllnjjcmiohdjih';

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

const StepNumber = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $active, $completed }) =>
    $completed ? colors.connectionStatusGreen :
    $active ? colors.selectorHoverBorder :
    colors.defaultBorderColor};
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

const BuildProvider: React.FC = () => {
  const [isInstallClicked, setIsInstallClicked] = useState(false);
  const [platformDetails, setPlatformDetails] = useState<PlatformDetails>({
    platformName: '',
    authUrl: '',
    countryCode: '',
  });
  const [providerTemplate, setProviderTemplate] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(1);

  const {
    isExtensionConnected,
    extensionVersion,
    refreshExtensionStatus,
    captureStatus,
    capturedRequests,
    isCapturing,
    startCapture,
    stopCapture,
    clearCapture,
  } = useProviderBuilder();

  useEffect(() => {
    refreshExtensionStatus();
  }, [refreshExtensionStatus]);

  // Update active step based on completion status
  useEffect(() => {
    if (isExtensionConnected && activeStep < 2) {
      setActiveStep(2);
    }
  }, [isExtensionConnected, activeStep]);

  useEffect(() => {
    if (platformDetails.platformName && platformDetails.authUrl && activeStep < 3) {
      setActiveStep(3);
    }
  }, [platformDetails, activeStep]);

  useEffect(() => {
    if (capturedRequests.length > 0 && !isCapturing && activeStep < 4) {
      setActiveStep(4);
    }
  }, [capturedRequests, isCapturing, activeStep]);

  const handleInstall = () => {
    window.open(CHROME_EXTENSION_URL, '_blank');
    setIsInstallClicked(true);
  };

  const handleStartCapture = async () => {
    await startCapture();
  };

  const handleStopCapture = async () => {
    const requests = await stopCapture();
    console.log('Captured requests:', requests);
  };

  const handleClearCapture = () => {
    clearCapture();
  };

  const handleRunDiscovery = () => {
    // Phase 2: Will run the discovery agent
    console.log('Discovery agent will be implemented in Phase 2');

    // For now, create a placeholder template
    const placeholderTemplate: ProviderTemplate = {
      name: platformDetails.platformName,
      authUrl: platformDetails.authUrl,
      countryCode: platformDetails.countryCode || undefined,
      endpoints: [],
      extractionRules: [],
    };
    setProviderTemplate(JSON.stringify(placeholderTemplate, null, 2));
    setActiveStep(5);
  };

  const handleSubmitForReview = () => {
    // Phase 3: Will submit the provider for review
    console.log('Submit for review will be implemented in Phase 3');
    alert('Provider submission will be available in Phase 3');
  };

  const handlePlatformDetailChange = (field: keyof PlatformDetails, value: string) => {
    setPlatformDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const browserSvgIcon = () =>
    browserName === 'Brave' ? braveSvg : chromeSvg;
  const addToBrowserText = () =>
    browserName === 'Brave' ? 'Add to Brave' : 'Add to Chrome';

  const isStep1Complete = isExtensionConnected;
  const isStep2Complete = platformDetails.platformName.trim() !== '' && platformDetails.authUrl.trim() !== '';
  const isStep3Complete = capturedRequests.length > 0 && !isCapturing;

  return (
    <PageWrapper>
      <MainContent>
        <PageTitle>Build Provider</PageTitle>
        <PageDescription>
          Create a new payment provider by capturing network traffic and defining extraction rules.
        </PageDescription>

        <AppContainer>
          {/* Step 1: Connect Extension */}
          <Panel>
            <Section>
              <StepIndicator>
                <StepNumber $active={activeStep === 1} $completed={isStep1Complete}>1</StepNumber>
                <StepLabel>Connect Extension</StepLabel>
              </StepIndicator>
              <StatusItem>
                <StatusLabel>Status:</StatusLabel>
                <StatusValue $connected={isExtensionConnected}>
                  {isExtensionConnected ? 'Connected' : 'Not Connected'}
                </StatusValue>
              </StatusItem>
              {isExtensionConnected && (
                <StatusItem>
                  <StatusLabel>Version:</StatusLabel>
                  <StatusValue $connected={true}>{extensionVersion || 'Unknown'}</StatusValue>
                </StatusItem>
              )}
              <ButtonContainer>
                {isExtensionConnected ? (
                  <Button
                    onClick={refreshExtensionStatus}
                    height={48}
                    width={216}
                  >
                    Refresh Status
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
          </Panel>

          {/* Step 2: Enter Platform Details */}
          <Panel>
            <Section>
              <StepIndicator>
                <StepNumber $active={activeStep === 2} $completed={isStep2Complete}>2</StepNumber>
                <StepLabel>Enter Platform Details</StepLabel>
              </StepIndicator>
              <Input
                label="Platform Name"
                name="platformName"
                value={platformDetails.platformName}
                onChange={(e) => handlePlatformDetailChange('platformName', e.target.value)}
                placeholder="e.g., Venmo, PayPal"
                valueFontSize="16px"
              />
              <Input
                label="Auth URL"
                name="authUrl"
                value={platformDetails.authUrl}
                onChange={(e) => handlePlatformDetailChange('authUrl', e.target.value)}
                placeholder="https://example.com/login"
                valueFontSize="16px"
              />
              <Input
                label="Country Code (Optional)"
                name="countryCode"
                value={platformDetails.countryCode}
                onChange={(e) => handlePlatformDetailChange('countryCode', e.target.value)}
                placeholder="e.g., US, UK, IN"
                valueFontSize="16px"
              />
            </Section>
          </Panel>

          {/* Step 3: Capture Network Traffic */}
          <Panel>
            <Section>
              <StepIndicator>
                <StepNumber $active={activeStep === 3} $completed={isStep3Complete}>3</StepNumber>
                <StepLabel>Capture Network Traffic</StepLabel>
              </StepIndicator>
              <StatusItem>
                <StatusLabel>Capture Status:</StatusLabel>
                <StatusValue $connected={isCapturing}>
                  {isCapturing ? 'Capturing...' : 'Idle'}
                </StatusValue>
              </StatusItem>
              <StatusItem>
                <StatusLabel>Requests Captured:</StatusLabel>
                <StatusValue $connected={capturedRequests.length > 0}>
                  {capturedRequests.length}
                </StatusValue>
              </StatusItem>
              {captureStatus.error && (
                <ErrorMessage>{captureStatus.error}</ErrorMessage>
              )}
              <ButtonRow>
                <Button
                  onClick={handleStartCapture}
                  disabled={isCapturing || !isExtensionConnected}
                  height={40}
                  width={140}
                >
                  Start Capture
                </Button>
                <Button
                  onClick={handleStopCapture}
                  disabled={!isCapturing}
                  height={40}
                  width={140}
                >
                  Stop Capture
                </Button>
                <Button
                  onClick={handleClearCapture}
                  disabled={capturedRequests.length === 0}
                  height={40}
                  width={100}
                  bgColor={colors.defaultBorderColor}
                >
                  Clear
                </Button>
              </ButtonRow>
              {capturedRequests.length > 0 && (
                <RequestList>
                  <RequestListHeader>
                    <ThemedText.BodySmall>Captured Requests</ThemedText.BodySmall>
                  </RequestListHeader>
                  <RequestListContent>
                    {capturedRequests.map((request: RequestLog, idx: number) => (
                      <RequestItem key={request.id || idx}>
                        <RequestMethod $method={request.method}>{request.method}</RequestMethod>
                        <RequestUrl>{request.url}</RequestUrl>
                        <RequestStatus>{request.statusCode || '-'}</RequestStatus>
                      </RequestItem>
                    ))}
                  </RequestListContent>
                </RequestList>
              )}
            </Section>
          </Panel>

          {/* Step 4: Discover Provider */}
          <Panel>
            <Section>
              <StepIndicator>
                <StepNumber $active={activeStep === 4} $completed={providerTemplate !== ''}>4</StepNumber>
                <StepLabel>Discover Provider</StepLabel>
              </StepIndicator>
              <ThemedText.BodySecondary>
                Run the discovery agent to automatically analyze captured traffic and generate a provider template.
              </ThemedText.BodySecondary>
              <PhaseNote>
                <ChevronRight size={14} />
                <span>This feature will be implemented in Phase 2</span>
              </PhaseNote>
              <ButtonContainer>
                <Button
                  onClick={handleRunDiscovery}
                  disabled={!isStep3Complete}
                  height={48}
                  width={216}
                >
                  Run Discovery Agent
                </Button>
              </ButtonContainer>
            </Section>
          </Panel>

          {/* Step 5: Review & Edit Provider */}
          <Panel $fullWidth>
            <Section>
              <StepIndicator>
                <StepNumber $active={activeStep === 5} $completed={false}>5</StepNumber>
                <StepLabel>Review & Edit Provider</StepLabel>
              </StepIndicator>
              <ThemedText.BodySecondary>
                Review and edit the generated provider template before submission.
              </ThemedText.BodySecondary>
              <TemplateEditor
                value={providerTemplate}
                onChange={(e) => setProviderTemplate(e.target.value)}
                placeholder={`{
  "name": "Provider Name",
  "authUrl": "https://...",
  "endpoints": [],
  "extractionRules": []
}`}
                disabled={providerTemplate === ''}
              />
            </Section>
          </Panel>

          {/* Step 6: Submit */}
          <Panel $fullWidth>
            <Section>
              <StepIndicator>
                <StepNumber $active={activeStep === 6} $completed={false}>6</StepNumber>
                <StepLabel>Submit</StepLabel>
              </StepIndicator>
              <ThemedText.BodySecondary>
                Submit your provider configuration for review by the ZKP2P team.
              </ThemedText.BodySecondary>
              <PhaseNote>
                <ChevronRight size={14} />
                <span>This feature will be implemented in Phase 3</span>
              </PhaseNote>
              <ButtonContainer>
                <Button
                  onClick={handleSubmitForReview}
                  disabled={providerTemplate === ''}
                  height={48}
                  width={216}
                >
                  Submit for Review
                </Button>
              </ButtonContainer>
            </Section>
          </Panel>
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
  max-width: 1200px;
  height: auto;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.white};
  margin: 0;
`;

const PageDescription = styled.p`
  font-size: 16px;
  color: ${colors.grayText};
  margin: 0 0 10px 0;
`;

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  height: auto;
  box-sizing: border-box;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div<{ $fullWidth?: boolean }>`
  padding: 20px;
  border-radius: 12px;
  border: 1px solid ${colors.defaultBorderColor};
  background: ${colors.container};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  ${({ $fullWidth }) => $fullWidth && `
    grid-column: 1 / -1;
  `}
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusLabel = styled.div`
  font-weight: bold;
  color: ${colors.white};
`;

const StatusValue = styled.div<{ $connected?: boolean }>`
  color: ${({ $connected }) => $connected ? colors.connectionStatusGreen : colors.grayText};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  padding: 10px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 4px;
  color: #FF3B30;
  font-size: 14px;
`;

const RequestList = styled.div`
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
  overflow: hidden;
  margin-top: 10px;
`;

const RequestListHeader = styled.div`
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid ${colors.defaultBorderColor};
`;

const RequestListContent = styled.div`
  max-height: 200px;
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

const RequestItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  border-bottom: 1px solid ${colors.defaultBorderColor};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const RequestMethod = styled.span<{ $method: string }>`
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 50px;
  text-align: center;
  background: ${({ $method }) => {
    switch ($method) {
      case 'GET': return 'rgba(76, 175, 80, 0.2)';
      case 'POST': return 'rgba(33, 150, 243, 0.2)';
      case 'PUT': return 'rgba(255, 152, 0, 0.2)';
      case 'DELETE': return 'rgba(244, 67, 54, 0.2)';
      default: return 'rgba(158, 158, 158, 0.2)';
    }
  }};
  color: ${({ $method }) => {
    switch ($method) {
      case 'GET': return '#4CAF50';
      case 'POST': return '#2196F3';
      case 'PUT': return '#FF9800';
      case 'DELETE': return '#F44336';
      default: return '#9E9E9E';
    }
  }};
`;

const RequestUrl = styled.span`
  flex: 1;
  font-size: 12px;
  color: ${colors.grayText};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RequestStatus = styled.span`
  font-size: 12px;
  color: ${colors.grayText};
  min-width: 30px;
  text-align: right;
`;

const PhaseNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  color: ${colors.warningYellow};
  font-size: 13px;
`;

const TemplateEditor = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 15px;
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  resize: vertical;
  background: ${colors.inputDefaultColor};
  color: ${colors.white};

  &:focus {
    outline: none;
    border-color: ${colors.inputPlaceholderColor};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${colors.inputPlaceholderColor};
  }

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

export { BuildProvider };
