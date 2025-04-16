import React, { useEffect, useState } from "react";
import styled from 'styled-components/macro';
import { Download, Cpu, Check, Circle, Play, Upload, RefreshCw, Code, ChevronDown, AlertTriangle } from 'react-feather';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import Spinner from "@components/common/Spinner";
import { commonStrings } from "@helpers/strings";
import useMediaQuery from "@hooks/useMediaQuery";
import { colors } from '@theme/colors';
import zkp2pLogo from '../../assets/images/logo192.png';

export const VerificationStepType = {
  DOWNLOAD: "download",
  UPLOAD: "upload",
  PROVE: "prove",
  SUBMIT: "submit",
  REQUEST: "request",
  SWAP: "swap",
  SELECTED_PAYMENT: "selected_payment",
};

export const VerificationState = {
  DEFAULT: 'default',
  LOADING: 'loading',
  COMPLETE: 'complete',
  ERROR: 'error',
};

interface VerificationStepRowProps {
  type: string; 
  progress: string;
  isAppclipFlow?: boolean;
  swapToken?: string;
  fiatCurrency?: string;
  paymentSubject?: string;
  paymentDate?: string;
  paymentPlatform?: string;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export type VerificationStepRowData = VerificationStepRowProps;

export const VerificationStepRow: React.FC<VerificationStepRowProps> = ({
  type,
  progress,
  isAppclipFlow,
  swapToken,
  fiatCurrency,
  paymentSubject,
  paymentDate,
  paymentPlatform,
  isFirstStep,
  isLastStep
}: VerificationStepRowProps) => {
  VerificationStepRow.displayName = "VerificationStepRow";

  /*
   * Context
   */

  const isMobile = useMediaQuery() === 'mobile';

  /*
   * State
   */

  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progressTimer, setProgressTimer] = useState(0);
  

  /*
   * Hooks
   */

  useEffect(() => {
    if (progress === VerificationState.LOADING) {
      const interval = getUpdateIntervalMs();
      const totalTime = getEstimatedTimesMs();
      const steps = totalTime / interval;
      const increment = 100 / steps;

      let timeout: NodeJS.Timeout;
      let currentPercentage = 0;

      const updateProgressCircle = () => {
        if (currentPercentage < 100) {
          setProgressPercentage(currentPercentage);

          const tick = Math.round(increment);
          currentPercentage += tick;

          setProgressTimer(currentPercentage / tick);

          timeout = setTimeout(updateProgressCircle, interval);
        } else {
          setProgressPercentage(100);
        }
      };

      updateProgressCircle();

      return () => clearTimeout(timeout);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  /*
   * Helpers
   */

  const shouldShowProgressCircle = (percentage: number) => {
    return percentage < 100 && type !== VerificationStepType.SUBMIT;
  }

  const getEstimatedTimesMs = () => {
    switch (type) {
      case VerificationStepType.DOWNLOAD:
        return 240000;
      case VerificationStepType.REQUEST:
        return isAppclipFlow ? 2000 : 500;
      case VerificationStepType.UPLOAD:
        return 500;
      case VerificationStepType.PROVE:
        return isAppclipFlow ? 180000 : 30000;
      case VerificationStepType.SWAP:
        return 30000;
      default:
        return 0;
    }
  };

  const getUpdateIntervalMs = () => {
    switch (type) {
      case VerificationStepType.DOWNLOAD:
        return 1000;
      case VerificationStepType.REQUEST:
        return isAppclipFlow ? 500 : 10;
      case VerificationStepType.UPLOAD:
        return 10;
      case VerificationStepType.PROVE:
        return isAppclipFlow ? 1000 : 1000;
      case VerificationStepType.SWAP:
        return 1000;
      default:
        return 0;
    }
  };

  const getLeftIcon = () => {
    switch (type) {
      case VerificationStepType.SELECTED_PAYMENT:
        return <StyledCpu progress={progress} />
      case VerificationStepType.DOWNLOAD:
        return <StyledDownload progress={progress} />;
      case VerificationStepType.REQUEST:
        return <StyledUpload progress={progress} />;
      case VerificationStepType.UPLOAD:
        return <StyledUpload progress={progress} />;
      case VerificationStepType.PROVE:
        return <StyledCpu progress={progress} />;

      default:
        return null;
    }
  };

  const getRightIcon = () => {
    switch (progress) {
      case VerificationState.DEFAULT:
        return <StyledCircle progress={progress} />;

      case VerificationState.LOADING:
        return shouldShowProgressCircle(progressPercentage) ? (
          <CircularProgressbarWithChildren
            maxValue={99}
            styles={{
              root: {
                height: 24,
                width: 24,
              },
              text: {
                fontSize: 28,
                fill: '#4BB543',
              },
              path: {
                stroke: '#4BB543',
                transition: 'none',
              }
            }}
            value={progressPercentage}
          >
            <Percentage>{`${progressTimer}`}</Percentage>
          </CircularProgressbarWithChildren>
        ) : (
          <Spinner size={24} />
        );

      case VerificationState.COMPLETE:
        return <StyledCheck progress={progress} />;
        
      case VerificationState.ERROR:
        return <StyledError progress={progress} />;

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case VerificationStepType.SELECTED_PAYMENT:
        return paymentSubject || "Selected Payment";
      case VerificationStepType.DOWNLOAD:
        return commonStrings.get('PROOF_MODAL_DOWNLOAD_TITLE');

      case VerificationStepType.UPLOAD:
        return commonStrings.get('PROOF_MODAL_UPLOAD_TITLE');

      case VerificationStepType.REQUEST:
        if (isAppclipFlow) {
          if (isMobile) {
            return commonStrings.get('PROOF_MODAL_MOBILE_APPCLIP_REQUEST_TITLE');
          } else {
            return commonStrings.get('PROOF_MODAL_DESKTOP_APPCLIP_REQUEST_TITLE');
          }
        } else {
          return commonStrings.get('PROOF_MODAL_EXTENSION_REQUEST_TITLE');
        }

      case VerificationStepType.PROVE:
        if (isAppclipFlow) {
          if (isMobile) {
            return commonStrings.get('PROOF_MODAL_MOBILE_APPCLIP_PROVE_TITLE');
          } else {
            return commonStrings.get('PROOF_MODAL_DESKTOP_APPCLIP_PROVE_TITLE');
          }
        } else {
          return commonStrings.get('PROOF_MODAL_EXTENSION_PROVE_TITLE');
        }

      case VerificationStepType.SUBMIT:
        return commonStrings.get('PROOF_MODAL_SUBMIT_TITLE');

      case VerificationStepType.SWAP:
        return commonStrings.get('PROOF_MODAL_SWAP_TITLE');

      default:
        return null;
    }
  };

  const getSubTitle = () => {
    switch (type) {
      case VerificationStepType.SELECTED_PAYMENT:
        if (paymentDate && paymentPlatform) {
          return `${paymentDate} on ${paymentPlatform}`;
        }
        return "Payment details";

      case VerificationStepType.DOWNLOAD:
        return commonStrings.get('PROOF_MODAL_DOWNLOAD_SUBTITLE');

      case VerificationStepType.UPLOAD:
        return commonStrings.get('PROOF_MODAL_UPLOAD_SUBTITLE');

      case VerificationStepType.REQUEST:
        if (isAppclipFlow) {
          if (isMobile) {
            return commonStrings.get('PROOF_MODAL_MOBILE_APPCLIP_REQUEST_SUBTITLE');
          } else {
            return commonStrings.get('PROOF_MODAL_DESKTOP_APPCLIP_REQUEST_SUBTITLE');
          }
        } else {
          return commonStrings.get('PROOF_MODAL_EXTENSION_REQUEST_SUBTITLE');
        }

      case VerificationStepType.PROVE:
        if (isAppclipFlow) {
          if (isMobile) {
            return commonStrings.get('PROOF_MODAL_MOBILE_APPCLIP_PROVE_SUBTITLE');
          } else {
            return commonStrings.get('PROOF_MODAL_DESKTOP_APPCLIP_PROVE_SUBTITLE');
          }
        } else {
          return commonStrings.get('PROOF_MODAL_EXTENSION_PROVE_SUBTITLE');
        }

      case VerificationStepType.SUBMIT:
        return commonStrings.get('PROOF_MODAL_SUBMIT_SUBTITLE');

      case VerificationStepType.SWAP:
        return commonStrings.get('PROOF_MODAL_SWAP_SUBTITLE');

      default:
        return null;
    }
  };

  /*
   * Component
   */

  return (
    <Container isMobile={isMobile}>
      <LeftIconContainer>
        {getLeftIcon()}
      </LeftIconContainer>

      <TitleAndSubtitleContainer>
        <Label progress={progress}>
          {getTitle()}
        </Label>

        <Subtitle progress={progress}>
          {getSubTitle()}
        </Subtitle>
      </TitleAndSubtitleContainer>

      <ActionsContainer>
        {getRightIcon()}
        {
          !isLastStep && <VerticalLine progress={progress} />
        }
      </ActionsContainer>
    </Container>
  );
};

const Container = styled.div<{ isMobile?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: ${({ isMobile }) => isMobile ? '0.5rem' : '1rem 1rem 1rem 0.7rem'};
  padding-bottom: 0;
  position: relative;
`;

const VerticalLine = styled.div<{ progress: string }>`
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 24px;
  background-color: ${props => {
    if (props.progress === VerificationState.COMPLETE) 
      return colors.connectionStatusGreen;
    else if (props.progress === VerificationState.ERROR)
      return '#ff6b6b';
    else 
      return colors.defaultBorderColor;
  }};
  z-index: 1;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  position: relative;
  min-width: 40px;
  width: 40px;
  padding-top: 0px;
`;

const LeftIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 0;
  position: relative;
  min-width: 40px;
  width: 40px;
`;

const TitleAndSubtitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.5rem 0;
  flex: 1;
  min-width: 0; /* Allows text to truncate if needed */
`;

const Label = styled.span<{ progress: string }>`
  color: ${props => (props.progress === VerificationState.DEFAULT ? '#6C757D' : '#FFFFFF')};
  font-size: 16px;
`;

const Subtitle = styled.span<{ progress: string }>`
  color: ${props => (props.progress === VerificationState.DEFAULT ? '#6C757D' : '#ADB5BD')};
  font-size: 12px;
`;

const IconBase = styled.div<{ progress: string }>`
  width: 24px;
  height: 24px;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => (props.progress === VerificationState.DEFAULT ? '#6C757D' : '#FFFFFF')};
`;

const Percentage = styled.div`
  font-size: 12px;
  color: #4BB543;
  margin-top: 1px;
`;

const StyledDownload = styled(IconBase).attrs({ as: Download })``;
const StyledCpu = styled(IconBase).attrs({ as: Cpu })``;
const StyledUpload = styled(IconBase).attrs({ as: Upload })``;
const StyledPlay = styled(IconBase).attrs({ as: Play })``;
const StyledCheck = styled(IconBase).attrs({ as: Check })`
  color: ${props => (props.progress === VerificationState.DEFAULT ? '#6C757D' : '#4BB543')};
`;
const StyledCircle = styled(IconBase).attrs({ as: Circle })``;
const StyledSwap = styled(IconBase).attrs({ as: RefreshCw })``;
const StyledError = styled(IconBase).attrs({ as: AlertTriangle })`
  color: #ff6b6b;
`;

const StyledTokenIcon = styled.img`
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  border: 1px solid ${colors.defaultBorderColor};
  object-fit: cover;
`;

const FlagIcon = styled.span`
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  background-size: 150%;
  background-position: center;
  border: 1px solid ${colors.defaultBorderColor};
  display: block;
`;

export const StepsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  & > div:not(:last-child) {
    margin-bottom: -16px;
  }
`;

const IconStack = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChainIconWrapper = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1E2230;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #1E2230;
  z-index: 3;
`;

const ChainIcon = styled.img`
  width: 10px;
  height: 10px;
  border-radius: 10%;
`;
