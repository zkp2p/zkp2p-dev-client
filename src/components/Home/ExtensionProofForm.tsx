import React, { useEffect, useState, useCallback } from 'react';
import styled, { css } from 'styled-components/macro';
import { BigNumber } from 'ethers';

import { ProofGenerationStatus, ProofGenerationStatusType } from '@helpers/types';
import { parseExtensionProof } from '@helpers/types';
import { ExtensionRequestMetadata } from '@helpers/types';
import { Proof } from '@helpers/types';
import { BreadcrumbStep } from '@components/common/Breadcrumb';
import { ProvePayment } from '@components/Home/ProvePayment';
import { PaymentTable } from '@components/Home/PaymentTable';

import { rollbar } from '@helpers/rollbar';
import useExtensionProxyProofs from '@hooks/contexts/useExtensionProxyProofs';


const PROOF_FETCH_INTERVAL = 3000;
const PROOF_GENERATION_TIMEOUT = 60000; // 60 seconds timeout

export type ParsedPayment = {
  amount: string;
  timestamp: string;
  recipientId: string;
  index: number;
};


interface ExtensionProofFormProps {
  actionType: string;
  paymentPlatform: string;
  intentHash: string;
  paymentProof: Proof | null;
  setPaymentProof: (proof: Proof | null) => void;
  proofGenerationStatus: ProofGenerationStatusType;
  setProofGenerationStatus: (status: ProofGenerationStatusType) => void;
  onProofGenCompletion: () => void;
  setTitle: (title: string) => void;
  setBreadcrumbStep: (step: BreadcrumbStep) => void;
  shouldShowProofDetails?: boolean;
  setShouldShowProofDetails?: (show: boolean) => void;
}

export const ExtensionProofForm: React.FC<ExtensionProofFormProps> = ({
  actionType,
  paymentPlatform,
  intentHash,
  paymentProof,
  setPaymentProof,
  proofGenerationStatus,
  setProofGenerationStatus,
  onProofGenCompletion,
  setTitle,
  setBreadcrumbStep,
  shouldShowProofDetails = false,
  setShouldShowProofDetails,
}) => {

  ExtensionProofForm.displayName = "ExtensionProofForm";

  /*
   * Context
   */

  const {
    paymentProof: extensionPaymentProof,
    fetchPaymentProof,
    generatePaymentProof,
    resetProofState
  } = useExtensionProxyProofs();
  
  /*
   * State
   */


  const [selectedPayment, setSelectedPayment] = useState<ExtensionRequestMetadata | null>(null);

  const [shouldShowVerificationModal, setShouldShowVerificationModal] = useState<boolean>(false);
  
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const [triggerProofFetchPolling, setTriggerProofFetchPolling] = useState<boolean>(false);

  /*
   * Hooks
   */


  useEffect(() => {
    if (extensionPaymentProof) {
      let transferProof = extensionPaymentProof;
      console.log('---------transferProof---------', transferProof);

      switch (transferProof.status) {
        case 'pending':
          break;
        case 'success':
          console.log('---------setting payment proof---------');
          const parsedProof = parseExtensionProof(transferProof.proof);
          setPaymentProof(parsedProof);

          resetProofState();
          break;
        case 'error':
          setProofGenerationStatus(ProofGenerationStatus.ERROR_FAILED_TO_PROVE);

          // Log proof gen failures in Rollbar
          rollbar.error('Error generating proof', {
            proof: transferProof,
            paymentPlatform,
            intentHash,
            selectedPayment,
          });
          break;
      }
    }
  }, [
    extensionPaymentProof,
  ]);

  // Setup interval for proof fetching
  useEffect(() => {
    if (triggerProofFetchPolling && paymentPlatform) {
      console.log('---------setting interval for proof fetching---------');
      if (intervalId) clearInterval(intervalId);
      
      const id = setInterval(
        () => {
          console.log('fetching proof');
          fetchPaymentProof(paymentPlatform);
        }, 
        PROOF_FETCH_INTERVAL
      );
      setIntervalId(id);

      // Add timeout
      const timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        setTriggerProofFetchPolling(false);
        setProofGenerationStatus(ProofGenerationStatus.ERROR_FAILED_TO_PROVE);
        
        rollbar.error('Proof generation timed out', {
          paymentPlatform,
          intentHash,
          selectedPayment,
        });
      }, PROOF_GENERATION_TIMEOUT);

      return () => {
        if (intervalId) clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    } 
  }, [paymentPlatform, fetchPaymentProof, triggerProofFetchPolling]);

  // Clear interval when payment proof is generated
  useEffect(() => {
    if (paymentProof !== null && intervalId !== null) {
      console.log('---------clearing interval---------');
      clearInterval(intervalId);
      setTriggerProofFetchPolling(false);
    }
  }, [paymentProof, intervalId]);

  /*
   * Handlers
   */


  const handleVerifyPaymentWithMetadata = useCallback(async (payment: ExtensionRequestMetadata) => {
    setSelectedPayment(payment);
    setShouldShowVerificationModal(true);

    if (payment && intentHash && paymentPlatform) {
      // simulate proof request success
      setProofGenerationStatus(ProofGenerationStatus.REQUESTING_PROOF);

      await new Promise(resolve => setTimeout(resolve, 500))

      setProofGenerationStatus(ProofGenerationStatus.REQUESTING_PROOF_SUCCESS);

      await new Promise(resolve => setTimeout(resolve, 100))

      // start proof generation
      setProofGenerationStatus(ProofGenerationStatus.GENERATING_PROOF);

      const intentHashDecimals = BigNumber.from(intentHash).toString();

      setTriggerProofFetchPolling(false);

      if (intervalId) clearInterval(intervalId);    // clear interval before generating proof

      setPaymentProof(null);    // clear payment proof before generating proof

      generatePaymentProof(paymentPlatform, intentHashDecimals, payment.originalIndex);

      setTriggerProofFetchPolling(true);    // start polling for proof
    }
  }, [generatePaymentProof, intentHash, intervalId, paymentPlatform, setPaymentProof, setProofGenerationStatus]);

  const handleRetryProofGen = useCallback(() => {
    if (selectedPayment) {
      handleVerifyPaymentWithMetadata(selectedPayment);
    }
  }, [handleVerifyPaymentWithMetadata, selectedPayment]);

  const handleModalBackClicked = () => {
    // Clear proof generation if back button is clicked
    if (intervalId) clearInterval(intervalId);
    setShouldShowVerificationModal(false);
  }

  const handleReturnToPaymentSelection = useCallback(() => {
    // Clear any proof generation state
    if (intervalId) clearInterval(intervalId);
    setShouldShowVerificationModal(false);
    setSelectedPayment(null);
    setProofGenerationStatus(ProofGenerationStatus.NOT_STARTED); // reset proof generation status
  }, [intervalId, setProofGenerationStatus]);

  // Add helper functions to extract payment details
  const getPaymentSubject = useCallback((payment: ExtensionRequestMetadata | null) => {
    if (!payment || !paymentPlatform) return "";
    return "Sent payment";
  }, [paymentPlatform]);
  
  const getPaymentDate = useCallback((payment: ExtensionRequestMetadata | null) => {
    if (!payment || !paymentPlatform) return "";
    return "Date";
  }, [paymentPlatform]);

  /*
   * Component
   */

  return (
    <>
      {paymentPlatform && (
        <Container>
          {shouldShowVerificationModal ? (
            <ProvePayment
              title={"Verify Payment"}
              proof={JSON.stringify(paymentProof) || ''}
              onBackClick={handleModalBackClicked}
              onProofGenCompletion={onProofGenCompletion}
              status={proofGenerationStatus}
              platform={paymentPlatform}
              buttonTitle={'Complete Order'}
              setProofGenStatus={setProofGenerationStatus}
              handleReturnToPaymentSelection={handleReturnToPaymentSelection}
              provingFailureErrorCode={1}
              isAppclipFlow={false}
              displayType="page"
              paymentSubject={getPaymentSubject(selectedPayment)}
              paymentDate={getPaymentDate(selectedPayment)}
              selectedPayment={selectedPayment || undefined}
              shouldShowProofAndSignals={shouldShowProofDetails}
              setShouldShowProofAndSignals={setShouldShowProofDetails}
              retryProofGen={handleRetryProofGen}
            />
          ) : (
            <PaymentTable
              actionType={actionType}
              paymentPlatform={paymentPlatform}
              setSelectedPayment={setSelectedPayment}
              handleVerifyPaymentWithMetadata={handleVerifyPaymentWithMetadata}
              isProofModalOpen={shouldShowVerificationModal}
              setTitle={setTitle}
              setBreadcrumbStep={setBreadcrumbStep}
            />
          )}
        </Container>
      )}
    </>
  )
};

const Container = styled.div`
  width: 100%;
`;
