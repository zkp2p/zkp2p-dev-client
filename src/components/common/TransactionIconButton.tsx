import React, { useCallback, useState } from 'react';
import styled, { css } from 'styled-components';
import { Trash2, Edit, DollarSign, CheckCircle, RotateCcw } from 'react-feather';

import Spinner from '@components/common/Spinner';
import FlatTooltip from '@components/common/FlatTooltip';
import { colors } from '@theme/colors';


type iconType = 
  "ccw" |
  "trash" |
  "edit" |
  "dollarSign" |
  "checkCircle";

interface TransactionIconButtonProps {
  icon: iconType;
  text: string;
  disabled?: boolean;
  loading?: boolean;
  size?: number;
  onClick?: () => void;
  hasBackground?: boolean;
}

export const TransactionIconButton: React.FC<TransactionIconButtonProps> = ({
  icon,
  text,
  disabled = false,
  loading = false,
  size = 24,
  onClick,
  hasBackground = true,
}) => {
  /*
   * State
   */

  const [show, setShow] = useState<boolean>(false)

  /*
   * Hooks
   */

  const open = useCallback(() => 
    setShow(true)
  , [setShow]);
  const close = useCallback(() =>
    setShow(false)
  , [setShow]);

  /*
   * Helpers
   */

  const getIcon = (iconName: iconType) => {
    switch (iconName) {
      case "ccw":
        return <StyledCcw $size={size} />;

      case "trash":
        return <StyledTrash />;

      case "edit":
        return <StyledEditIcon $size={size} />;

      case "dollarSign":
        return <StyledDollarSign />;

      case "checkCircle":
        return <StyledCheckCircle />;

      default:
        return null;
    }
  };

  /*
   * Component
   */

  return (
    <Container
      disabled={disabled || loading}
      $loading={loading}
      $size={size}
      onClick={onClick}
      $hasBackground={hasBackground}
    >
      {loading ? (
        <Spinner
          color={colors.selectorHover}
          size={size * 0.75}
        />
      ) : (
        <FlatTooltip text={text} show={show}>
          <IconBorder 
            onMouseEnter={open} 
            onMouseLeave={close}
            disabled={disabled}
            $size={size}
            $hasBackground={hasBackground}
          >
            { getIcon(icon) }
          </IconBorder>
        </FlatTooltip>
      )}
    </Container>
  );
};

const Container = styled.button<{ $loading: boolean; $size: number; $hasBackground: boolean }>`
  height: ${props => props.$size}px;
  width: ${props => props.$size}px;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background: ${props => props.$hasBackground ? colors.iconButtonDefault : 'transparent'};

  &:hover:not([disabled]) {
    color: ${colors.darkText};
    background: ${props => props.$hasBackground ? colors.iconButtonDefault : 'transparent'};

    * {
      color: ${colors.darkText};
    }
  }

  &:active:not([disabled]) {
    background: ${props => props.$hasBackground ? colors.iconButtonActive : 'transparent'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;

    * {
      cursor: not-allowed;
    }
  }

  ${({ $loading }) =>
    $loading && css`
      cursor: wait;
      background: ${colors.iconButtonActive};
      margin-top: 4px;
    `
  }
`;

const IconBorder = styled.div<{ disabled: boolean; $size: number; $hasBackground: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  padding: ${props => props.$hasBackground ? `${props.$size / 3}px` : '0'};
  background-color: ${props => props.$hasBackground ? colors.iconButtonDefault : 'transparent'};

  &:hover:not(:disabled) {
    background-color: ${props => props.$hasBackground ? colors.iconButtonHover : 'transparent'};
  }
`;

const StyledCcw = styled(RotateCcw)<{ $size: number }>`
  width: ${props => props.$size * 0.75}px;
  height: ${props => props.$size * 0.75}px;
  color: ${colors.darkText};

  cursor: pointer;
`;

const StyledTrash = styled(Trash2)`
  width: 90%;
  height: 90%;
  color: ${colors.darkText};

  cursor: pointer;
`;

const StyledEditIcon = styled(Edit)<{ $size: number }>`
  width: ${props => props.$size * 0.75}px;
  height: ${props => props.$size * 0.75}px;
  color: ${colors.darkText};

  cursor: pointer;
`;

const StyledDollarSign = styled(DollarSign)`
  width: 90%;
  height: 90%;
  color: ${colors.darkText};

  cursor: pointer;
`;

const StyledCheckCircle = styled(CheckCircle)`
  width: 90%;
  height: 90%;
  color: ${colors.darkText};

  cursor: pointer;
`;