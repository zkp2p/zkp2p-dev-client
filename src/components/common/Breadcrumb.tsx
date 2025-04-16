import React from 'react';
import styled from 'styled-components';
import { colors } from '@theme/colors';
import { Send, Chrome, Key, CheckCircle } from 'react-feather';

import useMediaQuery from '@hooks/useMediaQuery';

export enum BreadcrumbStep {
  PAYMENT = 1,
  EXTENSION = 2,
  AUTHENTICATE = 3,
  VERIFY = 4
}

interface BreadcrumbProps {
  currentStep: BreadcrumbStep;
  showExtensionStep?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentStep,
  showExtensionStep = false
}) => {
  const deviceSize = useMediaQuery();
  const isMobile = deviceSize === 'mobile';

  const steps = [
    { step: BreadcrumbStep.PAYMENT, label: 'Payment', icon: Send },
    ...(showExtensionStep ? [{ step: BreadcrumbStep.EXTENSION, label: 'Extension', icon: Chrome }] : []),
    ...(!isMobile ? [{ step: BreadcrumbStep.AUTHENTICATE, label: 'Authenticate', icon: Key }] : []),
    { step: BreadcrumbStep.VERIFY, label: 'Verify', icon: CheckCircle }
  ];

  return (
    <Container>
      {steps.map((stepItem, index) => {
        const isActive = currentStep === stepItem.step;
        const isPast = currentStep > stepItem.step;
        const Icon = stepItem.icon;

        return (
          <React.Fragment key={stepItem.step}>
            <StepContainer
              $isActive={isActive}
              $isPast={isPast}
            >
              <StepIcon $isActive={isActive} $isPast={isPast}>
                <Icon />
              </StepIcon>
              <StepLabel $isActive={isActive} $isPast={isPast}>
                {stepItem.label}
              </StepLabel>
            </StepContainer>
            {index < steps.length - 1 && (
              <StepConnector $isActive={currentStep > stepItem.step} $isPast={currentStep > stepItem.step} />
            )}
          </React.Fragment>
        );
      })}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px 0;
  gap: 8px;
`;

const StepContainer = styled.div<{
  $isActive: boolean;
  $isPast: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  opacity: ${props => props.$isActive || props.$isPast ? 1 : 0.5};
  min-width: 70px;
`;

const StepIcon = styled.div<{
  $isActive: boolean;
  $isPast: boolean;
}>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background-color: ${props => 
    props.$isActive ? colors.buttonDisabled :
    props.$isPast ? colors.iconButtonActive :
    colors.defaultBorderColor
  };
  color: ${colors.white};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StepLabel = styled.span<{
  $isActive: boolean;
  $isPast: boolean;
}>`
  font-size: 12px;
  text-align: center;
  font-weight: ${props => props.$isActive ? 600 : 400};
  color: ${props => 
    props.$isActive || props.$isPast ? colors.white :
    colors.grayText
  };
`;

const StepConnector = styled.div<{
  $isActive: boolean;
  $isPast: boolean;
}>`
  width: 42px;
  height: 1px;
  background-color: ${props => 
    props.$isActive || props.$isPast ? colors.white : 
    colors.defaultBorderColor
  };
  margin-top: 11px;
`;
