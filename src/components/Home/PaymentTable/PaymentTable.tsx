import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styled, { css } from 'styled-components/macro';
import { Inbox, Lock } from 'react-feather';
import Link from '@mui/material/Link';
import { colors } from '@theme/colors';
import { ThemedText } from '@theme/text';

import { ExtensionRequestMetadata } from '@helpers/types';
import { tokenUnits } from '@helpers/units';

import { Button } from '@components/common/Button'
import { InstallExtension } from '../Extension/InstallExtension';
import { PaymentRow } from '@components/Home/PaymentTable/PaymentRow';
import { getRandomFunnyRestrictionsMessage } from '@helpers/funnyMessages';
import useTableScroll from '@hooks/useTableScroll';
import useExtensionProxyProofs from '@hooks/contexts/useExtensionProxyProofs';
import { AccessoryButton } from '@components/common/AccessoryButton';
import { ConsentInstructions } from '@components/Home/ConsentInstructions';
import { BreadcrumbStep } from '@components/common/Breadcrumb';
import { ValidatePaymentStatus } from '@helpers/types/proofGenerationStatus';


const EXPIRY_AND_PROOF_GEN_BUFFER = 1000 * 30; // 30 seconds

interface PaymentTableProps {
  actionType: string;
  paymentPlatform: string;
  setSelectedPayment: (payment: ExtensionRequestMetadata) => void;
  handleVerifyPaymentWithMetadata: (payment: ExtensionRequestMetadata) => void;
  isProofModalOpen: boolean;
  setTitle: (title: string) => void;
  setBreadcrumbStep: (step: BreadcrumbStep) => void;
};
  
export const PaymentTable: React.FC<PaymentTableProps> = ({
  actionType,
  paymentPlatform,
  setSelectedPayment,
  handleVerifyPaymentWithMetadata,
  isProofModalOpen,
  setTitle,
  setBreadcrumbStep
}) => {

  PaymentTable.displayName = "PaymentTable";

  /*
   * Context
   */
  const {
    openNewTab,
    isSidebarInstalled,
    sideBarVersion,
    platformMetadata,
  } = useExtensionProxyProofs();
  const { tableRef, isScrolling } = useTableScroll();
  
  /*
   * State
   */

  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPlatformAuthenticated, setIsPlatformAuthenticated] = useState<boolean>(false);

  const [paymentsMetadata, setPaymentsMetadata] = useState<ExtensionRequestMetadata[] | null>(null);
  const [paymentsMetadataExpiresAt, setPaymentsMetadataExpiresAt] = useState<number | null>(null);
  const [arePaymentsExpired, setArePaymentsExpired] = useState<boolean>(false);
  const [filteredPayments, setFilteredPayments] = useState<ExtensionRequestMetadata[]>([]);

  const [isScrollEnabled, setIsScrollEnabled] = useState(false);
  
  const [ctaButtonTitle, setCtaButtonTitle] = useState<string>('');
  const [ctaButtonDisabled, setCtaButtonDisabled] = useState<boolean>(false);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const [validatePaymentStatus, setValidatePaymentStatus] = useState<string>(ValidatePaymentStatus.DEFAULT);

  const [triggerPaymentValidation, setTriggerPaymentValidation] = useState<number>(0);

  const [isSidebarNeedsUpdate, setIsSidebarNeedsUpdate] = useState<boolean>(false);

  const [autoVerificationAttempted, setAutoVerificationAttempted] = useState<boolean>(false);

  /*
   * Hooks
   */

  useEffect(() => {
    if (!isSidebarInstalled || !sideBarVersion) {
      setTitle('Install PeerAuth Extension');
      setBreadcrumbStep(BreadcrumbStep.EXTENSION);
      return;
    }

    if (!isPlatformAuthenticated) {
      setTitle(`Sign in with ${paymentPlatform}`);
      setBreadcrumbStep(BreadcrumbStep.AUTHENTICATE);
    } else {
      setTitle(`Verify Payment`);
      setBreadcrumbStep(BreadcrumbStep.VERIFY);
    }
  }, [isSidebarInstalled, sideBarVersion, paymentPlatform]);

  useEffect(() => {
    const platformData = platformMetadata[paymentPlatform];
    
    if (platformData) {
      setPaymentsMetadata(platformData.metadata);
      setPaymentsMetadataExpiresAt(platformData.expiresAt);
    } else {
      setPaymentsMetadata(null);
      setPaymentsMetadataExpiresAt(null);
    }

    setIsRefreshing(false);
    setArePaymentsExpired(false);
    setValidatePaymentStatus(ValidatePaymentStatus.DEFAULT);
    setAutoVerificationAttempted(false);
  }, [
    paymentPlatform, 
    platformMetadata,
  ]);

  useEffect(() => {
    if (paymentsMetadata !== null && !isPlatformAuthenticated) {
      setIsAuthenticating(false);
      setIsPlatformAuthenticated(true);

      setTitle(`Verify Payment`);
      setBreadcrumbStep(BreadcrumbStep.VERIFY);
    }
  }, [paymentsMetadata, isPlatformAuthenticated]);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      setIsScrollEnabled(tableElement.scrollHeight > tableElement.clientHeight);
    }
  }, [paymentsMetadata, tableRef]);

  useEffect(() => {
    if (
      paymentsMetadata && 
      paymentsMetadata.length > 0 && 
      !isProofModalOpen // Don't auto-select if modal is already open
    ) {
      // Find payments that pass all validation checks
      setAutoVerificationAttempted(true);
      setFilteredPayments(paymentsMetadata);
    }
  }, [
    paymentsMetadata, 
    paymentPlatform, 
    handleVerifyPaymentWithMetadata, 
    autoVerificationAttempted,
    isProofModalOpen,
    isRefreshing
  ]);

  useEffect(() => {
    switch (validatePaymentStatus) {
      case ValidatePaymentStatus.DEFAULT:
        setCtaButtonTitle('Select Payment');
        break;
      
      case ValidatePaymentStatus.PAYMENTS_EXPIRED:
        setCtaButtonTitle('Please refresh to see payments');
        break;

      case ValidatePaymentStatus.VALID:
        if (isProofModalOpen) {
          setCtaButtonTitle('Verifying Payment');
        } else {
          setCtaButtonTitle('Verify Payment');
        }
        break;
    }
  }, [isProofModalOpen, validatePaymentStatus]);

  useEffect(() => {
    const checkExpiration = () => {
      // Expire payments before such that if they are chosen for proof generation, they don't expire while proof is being generated
      if (
        !isRefreshing 
        && paymentsMetadataExpiresAt 
        && new Date(paymentsMetadataExpiresAt).getTime() < Date.now() + EXPIRY_AND_PROOF_GEN_BUFFER
      ) {
        setValidatePaymentStatus(ValidatePaymentStatus.PAYMENTS_EXPIRED);
      }
    };

    const interval = setInterval(checkExpiration, 1000); // Check every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [paymentsMetadataExpiresAt, isRefreshing]);

  /*
   * Handlers
   */

  const handleAuthClicked = () => {
    setIsAuthenticating(true);
    openNewTab(actionType, paymentPlatform);  
  }

  const handleRefreshClicked = () => {
    setIsRefreshing(true);
    setAutoVerificationAttempted(false);
    openNewTab(actionType, paymentPlatform);  
  }

  const handlePaymentRowClicked = (metadata: ExtensionRequestMetadata, index: number) => {
    if (validatePaymentStatus === ValidatePaymentStatus.PAYMENTS_EXPIRED) {
      return;
    }

    setSelectedPayment(metadata);
    setSelectedIndex(index);
    setValidatePaymentStatus(ValidatePaymentStatus.VALID);
  };

  /*
   * Helpers
   */

  const getConsentInstructions = () => {
    return [
      `Instantly verify payment to complete your order`,
      'Redact any sensitive information using zero-knowledge proofs',
      'Data never leaves your device'
    ];
  }
  
  const funnyRestrictionMessage = useMemo(() => getRandomFunnyRestrictionsMessage(), []);
  const getRestrictions = () => {
    return [
      'Make payments on your behalf',
      funnyRestrictionMessage
    ];
  }

  /*
   * Component
   */

  return (
    <Container>
      {
        !isSidebarInstalled || isSidebarNeedsUpdate ? (
          <InstallExtension
            paymentPlatform={paymentPlatform}
          />
        ) : (
          !isPlatformAuthenticated ? (
            <LoginContainer>
              <ConsentInstructions 
                instructionsTitle="This will allow ZKP2P to:"
                instructions={getConsentInstructions()}
                restrictionsTitle="This will NOT allow ZKP2P to:"
                restrictions={getRestrictions()}
              />

              <LoginButtonContainer>
                <Button
                  onClick={handleAuthClicked}
                  height={48}
                  width={260}
                >
                  Sign in with {paymentPlatform}
                </Button>
              </LoginButtonContainer>
            </LoginContainer>
          ) : (
            <LoggedInContainer>
              <TitleContainer>
                <TitleAndSubHeaderContainer>
                  <ThemedText.SubHeader textAlign="left">
                    Your {paymentPlatform} Payments
                  </ThemedText.SubHeader>
                  <SubHeaderContainer>
                    <ThemedText.BodySmall textAlign="left">
                      {`Select a payment to verify`}
                    </ThemedText.BodySmall>
                  </SubHeaderContainer>
                </TitleAndSubHeaderContainer>

                <AccessoryButton
                  onClick={handleRefreshClicked}
                  height={36}
                  title={'Refresh'}
                  icon={'refresh'}
                />
              </TitleContainer>

              <TableContainer>
                {paymentsMetadata && (
                  paymentsMetadata.length === 0 ? (
                    <EmptyPaymentsContainer>
                      <StyledInbox />
                      <ThemedText.SubHeaderSmall textAlign="center" lineHeight={1.3}>
                        { 'No send payments found' }
                      </ThemedText.SubHeaderSmall>
                    </EmptyPaymentsContainer>
                  ) : (
                    <Table ref={tableRef}>
                      {filteredPayments.map((metadata, index) => (
                        <PaymentRow
                          key={index}
                          isFirstRow={index === 0}
                          isLastRow={index === filteredPayments.length - 1}
                          subjectText={
                            validatePaymentStatus === ValidatePaymentStatus.PAYMENTS_EXPIRED 
                            ? 'Please refresh to see payments' 
                            : `Recipient: ${metadata.recipient}, Amount: ${metadata.amount}, Date: ${metadata.date}, Currency: ${metadata.currency}, Payment ID: ${metadata.paymentId}`
                          }
                          dateText={
                            validatePaymentStatus === ValidatePaymentStatus.PAYMENTS_EXPIRED 
                            ? '' 
                            : `${metadata.date}`
                          }
                          isSelected={selectedIndex === index}
                          onRowClick={() => handlePaymentRowClicked(metadata, index)}
                          isScrolling={isScrolling}
                        />
                      ))}
                    </Table>
                  )
                )}
              </TableContainer>

              <ButtonContainer>
                <Button
                  disabled={validatePaymentStatus !== ValidatePaymentStatus.VALID || selectedIndex === null || isProofModalOpen}
                  onClick={() => {
                    if (selectedIndex !== null && filteredPayments.length > 0) {
                      handleVerifyPaymentWithMetadata(filteredPayments[selectedIndex]);
                    }
                  }}
                >
                  {ctaButtonTitle}
                </Button>
              </ButtonContainer>
            </LoggedInContainer>
          )
      )
    }
    </Container>
  )
};

const Container = styled.div`
  background-color: ${colors.container};
  border-radius: 16px;
  align-items: center;
  width: 100%;
`;

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`;

const ButtonContainer = styled.div`
  display: grid;
`;

const EmptyPaymentsContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.9rem 0rem;
  max-width: 75%;
  margin: auto;
  gap: 1rem;
`;

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 25vh;
  line-height: 1.3;
  gap: 1rem;
`;


const LockIcon = styled(Lock)`
  ${IconStyle}
`;

const LoggedInContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0px 1rem;
`;

const TitleAndSubHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const SubHeaderContainer = styled.div`
  color: ${colors.lightGrayText};
`;

const LoginButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
  min-width: 50%;
`;

const StyledInbox = styled(Inbox)`
  color: #FFF;
  width: 28px;
  height: 28px;
`;

const TableContainer = styled.div`
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
  background-color: ${colors.container};
`;


const Table = styled.div`
  max-height: 40vh;
  border-radius: 8px;

  @media (max-width: 600px) {
    max-height: 30vh;
  }

  font-size: 16px;
  color: #616161;
  overflow-y: auto;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${colors.defaultBorderColor};
    border-radius: 4px;
  }

  & > *:last-child::after {
    display: none;
  }
`;

export default PaymentTable;