import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import useExtensionProxyProofs from '@hooks/contexts/useExtensionProxyProofs';

const BuildProvider: React.FC = () => {
  const {
    isSidebarInstalled,
    sideBarVersion,
    startDiscoverySession,
    stopDiscoverySession,
    fetchDiscoveryDraft,
    discoveryStatus,
    discoverySessionId,
    discoveryDraft,
    discoveryError,
  } = useExtensionProxyProofs();

  const [platform, setPlatform] = useState('');
  const [actionType, setActionType] = useState('');

  const draftJson = useMemo(() => {
    if (!discoveryDraft) return '';
    return JSON.stringify(discoveryDraft.providerSettings, null, 2);
  }, [discoveryDraft]);

  const handleStart = () => {
    if (!platform || !actionType) {
      alert('Please provide platform and action type');
      return;
    }
    startDiscoverySession({ platform, actionType });
  };

  return (
    <PageWrapper>
      <MainContent>
        <Header>
          <ThemedText.H2>Build Provider</ThemedText.H2>
          <ThemedText.BodySecondary>
            Generate a deterministic provider template using the discovery agent.
          </ThemedText.BodySecondary>
        </Header>

        <Panel>
          <Step>
            <StepHeader>
              <StepNumber>1</StepNumber>
              <StepLabel>Connect Extension</StepLabel>
            </StepHeader>
            <StatusRow>
              <StatusLabel>Extension:</StatusLabel>
              <StatusValue>
                {isSidebarInstalled ? sideBarVersion : 'Not Installed'}
              </StatusValue>
            </StatusRow>
          </Step>

          <Step>
            <StepHeader>
              <StepNumber>2</StepNumber>
              <StepLabel>Provider Details</StepLabel>
            </StepHeader>
            <Input
              label="Platform (e.g. venmo, chase)"
              name="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              valueFontSize="16px"
            />
            <Input
              label="Action Type (e.g. transfer_venmo)"
              name="actionType"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              valueFontSize="16px"
            />
          </Step>

          <Step>
            <StepHeader>
              <StepNumber>3</StepNumber>
              <StepLabel>Discovery Session</StepLabel>
            </StepHeader>
            <ThemedText.BodySecondary>
              Open your bank/payment site in a new tab, navigate to transaction history, and select a
              few transactions. Then start discovery.
            </ThemedText.BodySecondary>
            <ButtonRow>
              <Button onClick={handleStart} disabled={!isSidebarInstalled} height={44} width={180}>
                Start Discovery
              </Button>
              <Button
                onClick={stopDiscoverySession}
                disabled={!isSidebarInstalled || discoveryStatus !== 'started'}
                height={44}
                width={180}
              >
                Stop Discovery
              </Button>
            </ButtonRow>
            <StatusRow>
              <StatusLabel>Status:</StatusLabel>
              <StatusValue>{discoveryStatus}</StatusValue>
            </StatusRow>
            {discoverySessionId && (
              <StatusRow>
                <StatusLabel>Session:</StatusLabel>
                <StatusValue>{discoverySessionId}</StatusValue>
              </StatusRow>
            )}
            {discoveryError && <ErrorText>{discoveryError}</ErrorText>}
          </Step>

          <Step>
            <StepHeader>
              <StepNumber>4</StepNumber>
              <StepLabel>Generate Draft</StepLabel>
            </StepHeader>
            <Button onClick={fetchDiscoveryDraft} height={44} width={200}>
              Fetch Draft
            </Button>
            {draftJson && (
              <DraftContainer>
                <ThemedText.BodySecondary>ProviderSettings Preview</ThemedText.BodySecondary>
                <DraftTextarea readOnly value={draftJson} />
              </DraftContainer>
            )}
          </Step>

          <Step>
            <StepHeader>
              <StepNumber>5</StepNumber>
              <StepLabel>Submit Draft</StepLabel>
            </StepHeader>
            <ThemedText.BodySecondary>
              Upload is configured in Phase 3. For now, copy the draft JSON and share with the team.
            </ThemedText.BodySecondary>
            <Button disabled height={44} width={200}>
              Upload to S3 (coming soon)
            </Button>
          </Step>
        </Panel>
      </MainContent>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Panel = styled.div`
  background: ${colors.container};
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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
`;

const StepLabel = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${colors.white};
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusLabel = styled.div`
  font-weight: 600;
  color: ${colors.lightGrayText};
`;

const StatusValue = styled.div`
  color: ${colors.white};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const DraftContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DraftTextarea = styled.textarea`
  width: 100%;
  min-height: 200px;
  background: ${colors.background};
  color: ${colors.white};
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
  padding: 12px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
`;

const ErrorText = styled.div`
  color: ${colors.warningRed};
  font-size: 14px;
`;

export default BuildProvider;
