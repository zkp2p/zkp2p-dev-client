import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import {
  ChevronRight,
  LogOut,
  RefreshCw,
  Send,
  Trash2,
  UserX,
  Unlock,
  Plus,
  Minus
} from 'react-feather';

import Spinner from "@components/common/Spinner";
import { colors } from '@theme/colors';


type iconType = 
  "send" |
  "chevronRight" |
  "trash" |
  "userX" |
  "logout" |
  "refresh" |
  "unlock" |
  "plus" |
  "minus";

interface AccessoryButtonProps {
  fullWidth?: boolean;
  width?: number;
  title?: string;
  height?: number;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: iconType;
  borderColor?: string;
  backgroundColor?: string;
  backgroundHoverColor?: string;
  activeBackgroundColor?: string;
  hoverColor?: string;
  borderHoverColor?: string;
  spinnerColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  iconPosition?: 'left' | 'right';
  borderRadius?: number;
  useSecondaryColors?: boolean;
}

const primaryColors = {
  backgroundColor: '#DF2E2D',
  borderColor: '#DF2E2D',
  borderHoverColor: '#DF2E2D',
  backgroundHoverColor: '#ca2221',
  activeBackgroundColor: '#bc3035',
  hoverColor: 'white',
  textColor: 'white',
  spinnerColor: '#DF2E2D'

}

const secondaryColors = {
  backgroundColor: 'transparent',
  borderColor: '#adb5bd',
  borderHoverColor: '#adb5bd',
  backgroundHoverColor: 'rgba(255, 255, 255, 0.05)',
  activeBackgroundColor: 'rgba(255, 255, 255, 0.2)',
  hoverColor: '#ffffff',
  textColor: '#adb5bd',
  spinnerColor: '#adb5bd'
}

export const AccessoryButton: React.FC<AccessoryButtonProps> = ({
  fullWidth = false,
  width,
  title = '',
  height = 48,
  disabled = false,
  loading = false,
  onClick,
  children,
  icon,
  textAlign = 'left',
  iconPosition = 'right',
  borderRadius = 18,
  useSecondaryColors = false
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  /*
   * State
   */

  const [buttonWidth, setButtonWidth] = useState<number | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    if (buttonRef.current && !loading) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [loading, children, title]);

  const containerStyle: React.CSSProperties = {};
  if (loading && buttonWidth) {
    containerStyle.width = `${buttonWidth}px`;
  }

  /*
   * Helpers
   */

  const getIcon = (iconName: iconType) => {
    switch (iconName) {
      case "send":
        return <StyledSend />;

      case "chevronRight":
        return <StyledChevronRight />;

      case "logout":
        return <StyledLogOut />;

      case "refresh":
        return <StyledRefresh />;

      case "trash":
        return <StyledTrash />;

      case "userX":
        return <StyledUserX />;

      case "unlock":
        return <StyledUnlock />;

      case "plus":
        return <StyledPlus />;

      case "minus":
        return <StyledMinus />;

      default:
        return null;
    }
  };

  const shouldUsePrimaryColors = icon === 'send' || useSecondaryColors;

  /*
   * Component
   */

  return (
    <Container
      ref={buttonRef}
      style={containerStyle}
      fullWidth={fullWidth}
      width={width}
      height={height}
      disabled={disabled || loading}
      $loading={loading}
      backgroundColor={shouldUsePrimaryColors ? primaryColors.backgroundColor : secondaryColors.backgroundColor}
      borderColor={shouldUsePrimaryColors ? primaryColors.borderColor : secondaryColors.borderColor}
      hoverColor={shouldUsePrimaryColors ? primaryColors.hoverColor : secondaryColors.hoverColor}
      borderHoverColor={shouldUsePrimaryColors ? primaryColors.borderHoverColor : secondaryColors.borderHoverColor}
      backgroundHoverColor={shouldUsePrimaryColors ? primaryColors.backgroundHoverColor : secondaryColors.backgroundHoverColor}
      activeBackgroundColor={shouldUsePrimaryColors ? primaryColors.activeBackgroundColor : secondaryColors.activeBackgroundColor}
      spinnerColor={shouldUsePrimaryColors ? primaryColors.spinnerColor : secondaryColors.spinnerColor}
      borderRadius={borderRadius}
      onClick={onClick}
    >
      <ButtonAndLabelContainer
        color={shouldUsePrimaryColors ? primaryColors.textColor : secondaryColors.textColor}
        $loading={loading}
        $textAlign={textAlign}
      >
        {
          loading ? (
            <Spinner color={shouldUsePrimaryColors ? primaryColors.spinnerColor : secondaryColors.spinnerColor}/>
          ) : (
            <>
              {title && iconPosition === 'right' && <span>{title}</span>}
              {icon && iconPosition === 'left' && getIcon(icon)}
              {children}
              {icon && iconPosition === 'right' && getIcon(icon)}
              {title && iconPosition === 'left' && <span>{title}</span>}
            </>
          )
        }
      </ButtonAndLabelContainer>
    </Container>
  );
};

const Container = styled.button<AccessoryButtonProps & { $loading: boolean }>`
  width: ${({ fullWidth, width }) => (fullWidth ? '100%' : width ? `${width}px` : 'fit-content')};
  height: ${({ height }) => height}px;
  border-radius: ${({ borderRadius }) => borderRadius}px;
  background: ${({ backgroundColor }) => backgroundColor || 'transparent'};
  box-shadow: inset -3px -6px 4px rgba(0, 0, 0, 0.16);
  border: 1px solid ${({ borderColor }) => borderColor};
  padding: 1px 14px 0px 14px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover:not([disabled]) {
    border: 1px solid ${({ borderHoverColor }) => borderHoverColor};
    color: ${({ hoverColor }) => hoverColor};
    background: ${({ backgroundHoverColor }) => backgroundHoverColor};

    * {
      color: ${({ hoverColor }) => hoverColor};
    }
  }

  &:active:not([disabled]) {
    background: ${({ activeBackgroundColor }) => activeBackgroundColor};
    box-shadow: inset 0px -8px 0px rgba(0, 0, 0, 0.16);
  }

  ${({ $loading }) =>
    $loading && css`
      cursor: wait;
    `
  }
`;

const ButtonAndLabelContainer = styled.div<{ 
  color: string, 
  $loading: boolean,
  $textAlign: 'left' | 'center' | 'right' 
}>`
  width: 100%;  
  display: flex;
  align-items: center;
  justify-content: ${({ $loading, $textAlign }) => 
    $loading ? 'center' : 
    $textAlign === 'left' ? 'flex-start' : 
    $textAlign === 'right' ? 'flex-end' : 
    'center'
  };
  font-size: 13px;
  font-family: 'Graphik';
  font-weight: 600;
  text-align: center;
  color: ${({ color }) => color}};
  gap: 8px;
`;

const StyledSend = styled(Send)`
  width: 12px;
  height: 12px;
  color: white;
`;

const StyledChevronRight = styled(ChevronRight)`
  width: 18px;
  height: 18px;
  color: #adb5bd;
  margin-right: -4px;
`;

const StyledLogOut = styled(LogOut)`
  width: 15px;
  height: 15px;
  color: #adb5bd;
`;

const StyledRefresh = styled(RefreshCw)`
  width: 15px;
  height: 15px;
  color: #adb5bd;
`;

const StyledTrash = styled(Trash2)`
  width: 13px;
  height: 13px;
  color: #adb5bd;
`;

const StyledUnlock = styled(Unlock)`
  width: 14px;
  height: 14px;
  color: #adb5bd;
`;

const StyledUserX = styled(UserX)`
  width: 15px;
  height: 15px;
  color: #adb5bd;
`;

const StyledPlus = styled(Plus)`
  width: 15px;
  height: 15px;
  color: #adb5bd;
`;

const StyledMinus = styled(Minus)`
  width: 15px;
  height: 15px;
  color: #adb5bd;
`;