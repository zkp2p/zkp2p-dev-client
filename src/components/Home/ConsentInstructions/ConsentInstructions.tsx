import React from 'react';
import styled from 'styled-components';
import { Check, X, Lock, Shield } from 'react-feather';
import { colors } from '@theme/colors';
import { ThemedText } from '@theme/text';
import Link from '@mui/material/Link';
import { ConsentInstructionRow } from './ConsentInstructionRow';
import { commonStrings } from '@helpers/strings';


interface ConsentInstructionsProps {
  instructionsTitle: string;
  instructions: string[];
  restrictionsTitle: string;
  restrictions: string[];
  showExtensionTos?: boolean;
}

export const ConsentInstructions: React.FC<ConsentInstructionsProps> = ({
  instructionsTitle,
  instructions,
  restrictionsTitle,
  restrictions,
  showExtensionTos = false
}) => {
  return (
    <Container>
      <FirstInstructionsContainer>
        <InstructionsTitle>{instructionsTitle}</InstructionsTitle>
        {instructions.map((instruction, index) => (
          <ConsentInstructionRow
            key={index}
            text={instruction}
            icon={<StyledCheck />}
          />
        ))}
      </FirstInstructionsContainer>
      
      <Divider />
      
      <SecondInstructionsContainer>
        <InstructionsTitle>{restrictionsTitle}</InstructionsTitle>
        {restrictions.map((restriction, index) => (
          <ConsentInstructionRow
            key={index}
            text={restriction}
            icon={<StyledX />}
          />
        ))}
      </SecondInstructionsContainer>
      
      <Divider />
      
      <PrivacyContainer>
        <ThemedText.BodySmall textAlign="justify" color="textSecondary">
          {
            showExtensionTos ? 
              commonStrings.get('EXTENSION_DOWNLOAD_INSTRUCTIONS') :
              commonStrings.get('CONSENT_INSTRUCTIONS_SHARE_DATA_EXPLANATION')
          }
          Read more about our{' '}
          <Link href="/pp" target="_blank">
            Privacy Policy
          </Link>
          {'. '}By continuing, you agree to our{' '}
          <Link href="/tos" target="_blank">
            Terms of Service
          </Link>
          {'. '}
        </ThemedText.BodySmall>
      </PrivacyContainer>
    </Container>
  );
};


const Container = styled.div`
  border-radius: 8px;
  overflow: hidden;
  max-width: 480px;
  margin: 0 auto;
`;

const FirstInstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  padding-top: 0;
  gap: 0.5rem;
`;

const SecondInstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 0.5rem;
`;

const InstructionsTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.darkText};
  margin-bottom: 4px;
`;

const StyledCheck = styled(Check)`
  width: 16px;
  height: 16px;
  color: ${colors.connectionStatusGreen};
`;

const StyledX = styled(X)`
  width: 16px;
  height: 16px;
  color: ${colors.invalidRed};
`;

const LockIcon = styled(Lock)`
  width: 16px;
  height: 16px;
  color: ${colors.lightGrayText};
  margin-right: 8px;
`;

const PrivacyContainer = styled.div`
  padding: 16px;
  font-size: 12px;
  color: ${colors.lightGrayText};
  display: flex;
`;

const Divider = styled.div`
  height: 1px;
  width: 30%;
  background-color: ${colors.defaultBorderColor};
  opacity: 0.6;
  margin: 1px auto;
`;


export default ConsentInstructions;