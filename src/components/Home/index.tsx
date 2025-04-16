import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components/macro'
import { ArrowLeft } from 'react-feather';
import { useWindowSize } from '@uidotdev/usehooks';
import Link from '@mui/material/Link';
import Confetti from 'react-confetti';

import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { RowBetween } from '@components/layouts/Row';
import { commonStrings } from '@helpers/strings';
import {
  ProofGenerationStatus,
  ProofGenerationStatusType,
} from '@helpers/types';

import { Proof } from '@helpers/types';
import { ExtensionProofForm } from './ExtensionProofForm';
import { encodeProofAsBytes } from '@helpers/types';


import { Z_INDEX } from '@theme/zIndex';

import useMediaQuery from '@hooks/useMediaQuery';
import { rollbar } from '@helpers/rollbar';
import { Breadcrumb, BreadcrumbStep } from '@components/common/Breadcrumb';
import useExtensionProxyProofs from '@hooks/contexts/useExtensionProxyProofs';

interface CompleteOrderFormProps {
  handleBackClick: () => void;
  handleGoBackToSwap: () => void;
};

export const CompleteOrderForm: React.FC<CompleteOrderFormProps> = ({
  handleBackClick,
  handleGoBackToSwap: originalHandleGoBackToSwap
}) => {
  const size = useWindowSize();

  /*
   * Context
   */

  const currentDeviceSize = useMediaQuery();
  const isMobile = currentDeviceSize === 'mobile';

  const { isSidebarInstalled, sideBarVersion } = useExtensionProxyProofs();

  /*
   * State
   */

  const [actionType, setActionType] = useState<string | null>(null);
  const [paymentPlatform, setPaymentPlatform] = useState<string | null>(null);
  const [intentHash, setIntentHash] = useState<string | null>(null);

  const [proofGenerationStatus, setProofGenerationStatus] = useState<ProofGenerationStatusType>(ProofGenerationStatus.NOT_STARTED);

  const [paymentProof, setPaymentProof] = useState<Proof | null>(null);  
  const [showConfetti, setShowConfetti] = useState<boolean>(false);


  const [title, setTitle] = useState<string>('Payment');
  const [breadcrumbStep, setBreadcrumbStep] = useState<BreadcrumbStep>(BreadcrumbStep.AUTHENTICATE);

  const [isSidebarNeedsUpdate, setIsSidebarNeedsUpdate] = useState<boolean>(false);
  
  const [shouldShowProofDetails, setShouldShowProofDetails] = useState<boolean>(false);


  /*
  * Effects
  */

  useEffect(() => {
    if (paymentProof) {

      try {
        const encodedProof = encodeProofAsBytes(paymentProof);

        // TODO console log
        console.log('encodedProof', encodedProof);
      } catch (error) {
        console.error('Error encoding proof: ', error);
        
        setProofGenerationStatus(ProofGenerationStatus.ERROR_FAILED_TO_PROVE);
      }
    }
  }, [paymentProof]);


  useEffect(() => {
    if (proofGenerationStatus === ProofGenerationStatus.DONE) {
      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [proofGenerationStatus])

  /*
   * Handlers
   */

  const handleGoBackToSwap = useCallback(() => {
    originalHandleGoBackToSwap();
  }, [originalHandleGoBackToSwap]);

  
  /*
   * Component
   */

  return (
    <Container>
      {showConfetti ? (
        <ConfettiContainer>
          <Confetti
            recycle={false}
            numberOfPieces={500}
            width={size.width ?? undefined}
            height={document.documentElement.scrollHeight}
          />
        </ConfettiContainer>
      ) : null}

      <TitleContainer>
        <StyledRowBetween>
          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            {title}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.2 }}/>

          {/* <div style={{ flex: 0.2, display: 'flex', justifyContent: 'flex-end' }}>
            {proofGenerationStatus !== ProofGenerationStatus.NOT_STARTED && 
             proofGenerationStatus !== ProofGenerationStatus.DONE && (
               <LabeledSwitch
                 switchChecked={shouldShowProofDetails}
                 checkedLabel={"Hide"}
                 uncheckedLabel={"Show"}
                 helperText={commonStrings.get('PROOF_TOOLTIP')}
                 onSwitchChange={(checked: boolean) => setShouldShowProofDetails(checked)}
               />
             )}
          </div> */}
        </StyledRowBetween>

        <Breadcrumb
          currentStep={breadcrumbStep}
          showExtensionStep={!isSidebarInstalled || isSidebarNeedsUpdate}
        />
      </TitleContainer>

      {paymentPlatform && actionType && intentHash && (
        <ExtensionProofForm
          actionType={actionType}
          paymentPlatform={paymentPlatform}
          intentHash={intentHash}
          paymentProof={paymentProof}
          setPaymentProof={setPaymentProof}
          proofGenerationStatus={proofGenerationStatus}
          setProofGenerationStatus={setProofGenerationStatus}
          onProofGenCompletion={handleGoBackToSwap}
          setTitle={setTitle}
          setBreadcrumbStep={setBreadcrumbStep}
          shouldShowProofDetails={shouldShowProofDetails}
          setShouldShowProofDetails={setShouldShowProofDetails}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  margin: auto;
  padding: 1.5rem;
  background-color: ${colors.container};
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;

  @media (min-width: 600px) {
    border-radius: 16px;
    width: 400px;
  }

  @media (max-width: 600px) {
    width: 98%;
    margin: 0 auto;
    box-sizing: border-box;
  }
`;

const ConfettiContainer = styled.div`
  z-index: ${Z_INDEX.confetti};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  overflow: visible;
`;


const TitleContainer = styled.div`
  padding: 0;
  width: 100%;
`;


const StyledArrowLeft = styled(ArrowLeft)`
  color: ${colors.white};
`;

const StyledRowBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  
  > div:first-child {
    padding-left: 0.5rem;
  }
  
  > div:last-child {
    padding-right: 0.5rem;
  }
`;