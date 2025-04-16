import React, { useEffect, useMemo, useState, useRef } from "react";
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import { ThemedText } from '@theme/text';
import { useWindowSize } from '@uidotdev/usehooks';
import { colors } from '@theme/colors';
import { Z_INDEX } from '@theme/zIndex';
import reclaimSvg from '../../../../assets/images/reclaim.svg'


import { commonStrings } from "@helpers/strings";
import { ExtensionRequestMetadata } from "@helpers/types";
import { ProofGenerationStatus } from "@helpers/types";

import Spinner from '@components/common/Spinner';
import { Button } from "@components/common/Button";
import { Overlay } from '@components/modals/Overlay';
import { LabeledSwitch } from "@components/common/LabeledSwitch";
import { LabeledTextArea } from '@components/legacy/LabeledTextArea';
import { AccessoryButton } from "@components/common/AccessoryButton";

import { VerificationStepRow, VerificationState, VerificationStepType } from "./VerificationStepRow";

import useQuery from "@hooks/useQuery";
import useMediaQuery from "@hooks/useMediaQuery";
import useQuoteStorage from "@hooks/useQuoteStorage";


interface ProvePaymentProps {
  title: string;
  proof: string;
  onBackClick: () => void
  status: string;
  platform: string;
  buttonTitle: string;
  handleReturnToPaymentSelection?: () => void;
  setProofGenStatus?: (status: string) => void;
  onProofGenCompletion?: () => void;
  isAppclipFlow?: boolean;
  appclipRequestURL?: string;
  transactionAddress?: string | null;
  provingFailureErrorCode: number | null;
  displayType?: 'modal' | 'page';
  paymentSubject?: string;
  paymentDate?: string;
  selectedPayment?: ExtensionRequestMetadata;
  shouldShowProofAndSignals?: boolean;
  retryProofGen?: () => void;
  setShouldShowProofAndSignals?: (show: boolean) => void;
}

export const ProvePayment: React.FC<ProvePaymentProps> = ({
  title,
  proof,
  onBackClick,
  status,
  platform,
  buttonTitle,
  setProofGenStatus,
  handleReturnToPaymentSelection,
  onProofGenCompletion,
  provingFailureErrorCode,
  isAppclipFlow,
  appclipRequestURL,
  displayType = 'modal',
  paymentSubject,
  paymentDate,
  selectedPayment,
  shouldShowProofAndSignals = false,
  setShouldShowProofAndSignals,
  retryProofGen,
}) => {

  ProvePayment.displayName = "ProvePaymentModal";
  /*
   * Context
   */

  const size = useWindowSize();
  const isMobile = useMediaQuery() === 'mobile';
  const { queryParams } = useQuery();
  const { getQuoteData: getStoredQuoteData } = useQuoteStorage();

  /*
   * State
   */


  const [ctaButtonTitle, setCtaButtonTitle] = useState<string>("");

  const [showAccessoryCta, setShowAccessoryCta] = useState<boolean>(false);
  const [showPoweredByReclaim, setShowPoweredByReclaim] = useState<boolean>(isMobile);
  
  const [swapToken, setSwapToken] = useState<string | null>(null);
  const [fiatCurrency, setFiatCurrency] = useState<string | null>(null);

  // Add new state for modals
  const [showContactModal, setShowContactModal] = useState<boolean>(false);

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    onBackClick();
  }

  /*
   * Hooks
   */


  useEffect(() => {
    if (isMobile) {
      setShowPoweredByReclaim(true);
    }
  }, [isMobile]);

  useEffect(() => {
    switch (status) {

      case ProofGenerationStatus.NOT_STARTED:
      case ProofGenerationStatus.REQUESTING_PROOF:
        if (isAppclipFlow) {
          if (isMobile) {
            setCtaButtonTitle("Generating Link");
          } else {
            setCtaButtonTitle("Generating QR code");
          }
        } else {
          setCtaButtonTitle("Requesting Notarization");
        }
        break;

      case ProofGenerationStatus.REQUESTING_PROOF_FAILED:
        if (isAppclipFlow) {
          if (isMobile) {
            setCtaButtonTitle("Failed to Generate Link");
          } else {
            setCtaButtonTitle("Failed to Generate QR");
          }
        } else {
          setCtaButtonTitle("Failed to Request Notarization");
        }
        break;

      case ProofGenerationStatus.REQUESTING_PROOF_SUCCESS:
        if (isAppclipFlow) {
          if (isMobile) {
            setCtaButtonTitle("Generate Proof");
          } else {
            setCtaButtonTitle("Scan QR code to verify payment");
          }
        } else {
          setCtaButtonTitle("Complete Order");
        }
        break;

      case ProofGenerationStatus.GENERATING_PROOF:
        setCtaButtonTitle("Verifying Payment");
        break;

      case ProofGenerationStatus.TRANSACTION_SIMULATING:
        setCtaButtonTitle("Complete Order");
        break;

      case ProofGenerationStatus.TRANSACTION_SIMULATION_SUCCESSFUL:
        setCtaButtonTitle("Complete Order");
        break;

      case ProofGenerationStatus.TRANSACTION_CONFIGURED:
        setCtaButtonTitle("Complete Order");
        break;

      case ProofGenerationStatus.ERROR_FAILED_TO_PROVE:
        setCtaButtonTitle('Proof Gen Failed - Try again');
        break;

      case ProofGenerationStatus.DONE:
        if (queryParams.REFERRER_CALLBACK_URL && queryParams.REFERRER) {
          setCtaButtonTitle('Go to ' + queryParams.REFERRER);
        } else {
          setCtaButtonTitle('Go to Buy');
        }
        break;
        
      default:
        setCtaButtonTitle(buttonTitle);
        break;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, buttonTitle]);

  /*
   * Helpers
   */

  const ctaDisabled = useMemo(() => {
    switch (status) {
      case ProofGenerationStatus.REQUESTING_PROOF:
      case ProofGenerationStatus.REQUESTING_PROOF_FAILED:
      case ProofGenerationStatus.TRANSACTION_SIMULATION_FAILED:
      case ProofGenerationStatus.TRANSACTION_LOADING:
      case ProofGenerationStatus.TRANSACTION_MINING:
      case ProofGenerationStatus.TRANSACTION_FAILED:
      case ProofGenerationStatus.SWAP_QUOTE_REQUESTING:
      case ProofGenerationStatus.SWAP_QUOTE_FAILED:
      case ProofGenerationStatus.SWAP_TRANSACTION_SIGNING:
      case ProofGenerationStatus.SWAP_TRANSACTION_MINING:
      case ProofGenerationStatus.GENERATING_PROOF:
      case ProofGenerationStatus.SWAP_TRANSACTION_FAILED:
      case ProofGenerationStatus.TRANSACTION_CONFIGURED:
      case ProofGenerationStatus.TRANSACTION_SIMULATING:
        return true;
      
      case ProofGenerationStatus.ERROR_FAILED_TO_PROVE:
      case ProofGenerationStatus.TRANSACTION_SIMULATION_SUCCESSFUL:
      case ProofGenerationStatus.SWAP_QUOTE_SUCCESS:
      case ProofGenerationStatus.DONE:
        return false;

      case ProofGenerationStatus.REQUESTING_PROOF_SUCCESS:
        if (isAppclipFlow && isMobile) {
          return false;
        }
        return true;

      default:
        return true;
    }
  }, [status]);

  const ctaLoading = useMemo(() => {
    switch (status) {
      // all the "ing" states
      case ProofGenerationStatus.REQUESTING_PROOF:
      case ProofGenerationStatus.TRANSACTION_LOADING:
      case ProofGenerationStatus.TRANSACTION_MINING:
      case ProofGenerationStatus.GENERATING_PROOF:
      case ProofGenerationStatus.TRANSACTION_SIMULATING:
      case ProofGenerationStatus.SWAP_QUOTE_REQUESTING:
      case ProofGenerationStatus.SWAP_TRANSACTION_SIGNING:
      case ProofGenerationStatus.SWAP_TRANSACTION_MINING:
      case ProofGenerationStatus.TRANSACTION_SIMULATING:
        return true;

      default:
        return false;
    }
  }, [status]);

  const getButtonHandler = () => {
    if (status === ProofGenerationStatus.DONE) {
      onProofGenCompletion?.();
    } else if (status === ProofGenerationStatus.ERROR_FAILED_TO_PROVE) {
      retryProofGen?.();
    }
  };

  const handleSkipSwapClick = () => {
    onProofGenCompletion?.();
  }

  /*
   * Component
   */

  const renderVerificationSteps = () => {
    let selectedPaymentStepState = VerificationState.COMPLETE;
    let requestStepState = VerificationState.DEFAULT;
    let proveStepState = VerificationState.DEFAULT;
    let submitStepState = VerificationState.DEFAULT;
    let swapStepState = VerificationState.DEFAULT;

    switch (status) {
      case "not-started":
      case "requesting-proof":
        requestStepState = VerificationState.LOADING;
        break;

      case "requesting-proof-success":
        requestStepState = VerificationState.COMPLETE;
        break;

      case "generating-proof":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.LOADING;
        break;

      case "error-failed-to-prove":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.ERROR;
        break;

      case "transaction-simulating":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.LOADING;
        break;

      case "transaction-simulation-successful":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.LOADING;
        break;

      case "transaction-configured":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.LOADING;
        break;

      case "transaction-loading":
      case "transaction-mining":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.LOADING;
        break;

      case "swap-quote-requesting":
      case "swap-quote-loading":
      case "swap-quote-success":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.COMPLETE;
        swapStepState = VerificationState.LOADING;
        break;

      case "swap-transaction-signing":
      case "swap-transaction-mining":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.COMPLETE;
        swapStepState = VerificationState.LOADING;
        break;

      case "swap-quote-failed":
      case "swap-transaction-failed":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.COMPLETE;
        swapStepState = VerificationState.ERROR;
        break;

      case "error-failed-to-prove":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.ERROR;
        submitStepState = VerificationState.DEFAULT;
        break;

      case "transaction-simulation-failed":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.ERROR;
        break;

      case "done":
        requestStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.COMPLETE;
        swapStepState = VerificationState.COMPLETE;
        break;
    }

    const verificationStepRows = [];

    let showRequestStep = false;
    if (isAppclipFlow && isMobile) {
      showRequestStep = true;
    }

    // Hide request step for now
    if (showRequestStep) {
      verificationStepRows.push(
        <VerificationStepRow
          key={VerificationStepType.REQUEST}
          type={VerificationStepType.REQUEST}
          progress={requestStepState}
          isAppclipFlow={isAppclipFlow}
          isFirstStep={true}
        />
      );
    }

    if (!isMobile) {
      verificationStepRows.push(
        <VerificationStepRow
          key={VerificationStepType.SELECTED_PAYMENT}
          type={VerificationStepType.SELECTED_PAYMENT}
          progress={selectedPaymentStepState}
          paymentSubject={paymentSubject}
          paymentDate={paymentDate}
          paymentPlatform={platform}
          fiatCurrency={fiatCurrency as string}
          isFirstStep={!showRequestStep}
        />
      );
    }

    verificationStepRows.push(
      <VerificationStepRow
        key={VerificationStepType.PROVE}
        type={VerificationStepType.PROVE}
        progress={proveStepState}
        isAppclipFlow={isAppclipFlow}
        fiatCurrency={fiatCurrency as string}
      />
    );

    verificationStepRows.push(
      <VerificationStepRow
        key={VerificationStepType.SUBMIT}
        type={VerificationStepType.SUBMIT}
        progress={submitStepState}
        isLastStep={true}
      />
    );

    return verificationStepRows;
  };

  const content = (
    <>
      <VerificationStepsContainer>
        {renderVerificationSteps()}
      </VerificationStepsContainer>

      { shouldShowProofAndSignals && (
        <ProofAndSignalsContainer>
          <LabeledTextArea
            label="Proof Output"
            value={proof}
            disabled={true}
            height={"24vh"} 
          />
        </ProofAndSignalsContainer>
        )
      }

      <ButtonContainer>
        <Button
          disabled={ctaDisabled}
          onClick={getButtonHandler}
          fullWidth={true}
        >
          <ButtonContentWrapper>
            {ctaLoading && <StyledSpinner size={20} />}
            <span>{ctaButtonTitle}</span>
          </ButtonContentWrapper>
        </Button>

        {
          (
            status === ProofGenerationStatus.TRANSACTION_SIMULATION_FAILED || 
            status === ProofGenerationStatus.ERROR_FAILED_TO_PROVE
          ) && handleReturnToPaymentSelection && (
          <AccessoryButton
            onClick={handleReturnToPaymentSelection}
            title="Select Another Payment"
            fullWidth={true}
            textAlign="center"
            borderRadius={24}
          />
        )}

      </ButtonContainer>
    </>
  );

  if (displayType === 'page') {
    return (
      <PageContainer>
        {content}
      </PageContainer>
    );
  }

  return (
    <ModalAndOverlayContainer>
      <Overlay />
      <ModalContainer>
        <TitleRowContainer>
          <button
            onClick={handleOverlayClick}
            disabled={status === ProofGenerationStatus.GENERATING_PROOF}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: status === ProofGenerationStatus.GENERATING_PROOF ? 0.5 : 1,
            }}
            >

            <StyledArrowLeft/>
          </button>

          <Title>
            <ThemedText.HeadlineSmall style={{ flex: '0', textAlign: 'right' }}>
              {!isMobile ? title : 'Verify'}
            </ThemedText.HeadlineSmall>
          </Title>

          {!isMobile ? (
            <LabeledSwitch
              switchChecked={shouldShowProofAndSignals}
              checkedLabel={"Hide"}
              uncheckedLabel={"Show"}
              helperText={commonStrings.get('PROOF_TOOLTIP')}
              onSwitchChange={(checked: boolean) => {
                if (setShouldShowProofAndSignals) {
                  setShouldShowProofAndSignals(checked);
                }
              }}
            />
          ) : (
            <div></div> // Leave empty div in so title remains centered
          )}
        </TitleRowContainer>

        {content}
      </ModalContainer>
    </ModalAndOverlayContainer>
  );
};

const ModalAndOverlayContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  align-items: flex-start;
  top: 0;
  left: 0;
  z-index: ${Z_INDEX.overlay};
`;

const ModalContainer = styled.div`
  width: 80vw;
  max-width: 412px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background-color: ${colors.container};
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  gap: 1.3rem;
  
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const TitleRowContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 0.3fr 1.1fr 0.85fr;
  align-items: center;
  justify-content: space-between;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`;

const Title = styled.div`
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
`;

const VerificationStepsContainer = styled.div`
  width: 100%;
`;

const ProofAndSignalsContainer = styled.div`
  width: 100%;
  background: #eeeee;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Link = styled.a`
  white-space: pre;
  display: inline-block;
  color: #1F95E2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ConfettiContainer = styled.div`
  z-index: 20;
`;

const LinkContainers = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TransactionLinkContainer = styled.div`
  margin: auto;
  display: flex;
  flex-direction: row;
  &:hover {
    cursor: pointer;
  }
`;

const BridgeTransactionLinksContainer = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: space-between;
  align-items: center;
`;

const PageContainer = styled.div`
  width: 100%;
  max-width: 412px;
  display: flex;
  flex-direction: column;
  padding: 0rem 0rem 0rem 0rem;
  gap: 1.3rem;
  margin: 0 auto;
`;

const PoweredByContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
  gap: 5px;
`;

const PoweredByText = styled.div`
  font-size: 12px;
  text-align: top;
  padding-top: 2px;
  line-height: 1.5;
  color: #FFF;
`;

const ReclaimLogo = styled.img`
  height: 20px;
  vertical-align: middle;
`;

const ButtonContentWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledSpinner = styled(Spinner)`
  margin-left: 8px;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 16px;
  text-align: center;
  width: 100%;
`;

const SupportLink = styled.a`
  white-space: pre;
  display: inline-block;
  color: #1F95E2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export default ProvePayment;