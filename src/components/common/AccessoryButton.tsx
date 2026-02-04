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
  Minus,
} from 'react-feather';

import {
  peer,
  gradients,
  fontFamilies,
  fontWeights,
  fontSizes,
  radii,
  letterSpacing,
  lineHeights,
  opacify,
} from '@theme/colors';
import Spinner from '@components/common/Spinner';
import { getSpinnerSizeForButton } from '@components/common/spinnerUtils';

type iconType =
  | 'send'
  | 'chevronRight'
  | 'trash'
  | 'userX'
  | 'logout'
  | 'refresh'
  | 'unlock'
  | 'plus'
  | 'minus';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AccessoryButtonProps {
  fullWidth?: boolean;
  width?: number;
  title?: string;
  height?: number;
  fontSize?: number;
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
  loadingText?: string;
  variant?: ButtonVariant;
}

const primaryColors = {
  backgroundColor: gradients.ignite,
  borderColor: 'transparent',
  borderHoverColor: 'transparent',
  backgroundHoverColor: gradients.igniteHover,
  activeBackgroundColor: gradients.ignite,
  hoverColor: peer.black,
  textColor: peer.black,
  spinnerColor: peer.black,
};

const secondaryColors = {
  backgroundColor: peer.white,
  borderColor: 'transparent',
  borderHoverColor: 'transparent',
  backgroundHoverColor: peer.lightGrey,
  activeBackgroundColor: peer.white,
  hoverColor: peer.black,
  textColor: peer.black,
  spinnerColor: peer.black,
};

const ghostColors = {
  backgroundColor: 'transparent',
  borderColor: peer.borderDark,
  borderHoverColor: peer.textSecondary,
  backgroundHoverColor: 'transparent',
  activeBackgroundColor: 'transparent',
  hoverColor: peer.white,
  textColor: peer.white,
  spinnerColor: peer.white,
};

export const AccessoryButton: React.FC<AccessoryButtonProps> = ({
  fullWidth = false,
  width,
  title = '',
  height = 48,
  fontSize,
  disabled = false,
  loading = false,
  onClick,
  children,
  icon,
  textAlign = 'left',
  iconPosition = 'right',
  borderRadius = radii.md,
  useSecondaryColors = false,
  loadingText,
  variant,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);

  useEffect(() => {
    if (buttonRef.current && !loading) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [loading, children, title]);

  const containerStyle: React.CSSProperties = {};
  if (loading && buttonWidth) {
    containerStyle.width = `${buttonWidth}px`;
  }

  const getIcon = (iconName: iconType) => {
    switch (iconName) {
      case 'send':
        return <StyledSend />;
      case 'chevronRight':
        return <StyledChevronRight />;
      case 'logout':
        return <StyledLogOut />;
      case 'refresh':
        return <StyledRefresh />;
      case 'trash':
        return <StyledTrash />;
      case 'userX':
        return <StyledUserX />;
      case 'unlock':
        return <StyledUnlock />;
      case 'plus':
        return <StyledPlus />;
      case 'minus':
        return <StyledMinus />;
      default:
        return null;
    }
  };

  const colorScheme = (() => {
    if (variant === 'ghost') return ghostColors;
    if (variant === 'primary') return primaryColors;
    if (variant === 'secondary') return secondaryColors;
    if (icon === 'send' || useSecondaryColors) return primaryColors;
    return secondaryColors;
  })();

  return (
    <Container
      ref={buttonRef}
      style={containerStyle}
      fullWidth={fullWidth}
      width={width}
      height={height}
      disabled={disabled || loading}
      $loading={loading}
      backgroundColor={colorScheme.backgroundColor}
      borderColor={colorScheme.borderColor}
      hoverColor={colorScheme.hoverColor}
      borderHoverColor={colorScheme.borderHoverColor}
      backgroundHoverColor={colorScheme.backgroundHoverColor}
      activeBackgroundColor={colorScheme.activeBackgroundColor}
      spinnerColor={colorScheme.spinnerColor}
      borderRadius={borderRadius}
      onClick={onClick}
    >
      <ButtonAndLabelContainer
        color={colorScheme.textColor}
        $loading={loading}
        $textAlign={textAlign}
        $fontSize={fontSize}
      >
        {loading ? (
          <LoadingContent>
            <Spinner
              color={colorScheme.spinnerColor}
              size={getSpinnerSizeForButton(height)}
            />
            {(loadingText || title) && (
              <LoadingLabel>{loadingText || title}</LoadingLabel>
            )}
          </LoadingContent>
        ) : (
          <>
            {title && iconPosition === 'right' && <span>{title}</span>}
            {icon && iconPosition === 'left' && getIcon(icon)}
            {children}
            {icon && iconPosition === 'right' && getIcon(icon)}
            {title && iconPosition === 'left' && <span>{title}</span>}
          </>
        )}
      </ButtonAndLabelContainer>
    </Container>
  );
};

const Container = styled.button<AccessoryButtonProps & { $loading: boolean }>`
  width: ${({ fullWidth, width }) =>
    fullWidth ? '100%' : width ? `${width}px` : 'fit-content'};
  height: ${({ height }) => height}px;
  border-radius: ${({ borderRadius }) => borderRadius}px;
  background: ${({ backgroundColor }) => backgroundColor || 'transparent'};
  background-size: 110% 100%;
  background-position: center;
  border: 1px solid ${({ borderColor }) => borderColor || 'transparent'};
  padding: 0px 16px;
  color: ${peer.white};
  cursor: pointer;
  transition:
    background 0.2s ease-out,
    border-color 0.2s ease-out,
    transform 0.15s ease-out;

  &:hover:not([disabled]) {
    border: 1px solid
      ${({ borderHoverColor }) => borderHoverColor || 'transparent'};
    color: ${({ hoverColor }) => hoverColor};
    background: ${({ backgroundHoverColor }) => backgroundHoverColor};

    * {
      color: ${({ hoverColor }) => hoverColor};
    }
  }

  &:active:not([disabled]) {
    background: ${({ activeBackgroundColor }) => activeBackgroundColor};
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 1px solid ${opacify(30, peer.white)};
    outline-offset: 2px;
  }

  ${({ $loading }) =>
    $loading &&
    css`
      cursor: wait;
    `}
`;

const ButtonAndLabelContainer = styled.div<{
  color: string;
  $loading: boolean;
  $textAlign: 'left' | 'center' | 'right';
  $fontSize?: number;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: ${({ $loading, $textAlign }) =>
    $loading
      ? 'center'
      : $textAlign === 'left'
        ? 'flex-start'
        : $textAlign === 'right'
          ? 'flex-end'
          : 'center'};
  font-size: ${({ $fontSize }) =>
    $fontSize ? `${$fontSize}px` : `${fontSizes.button}px`};
  font-family: ${fontFamilies.body};
  font-weight: ${fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.wide};
  line-height: ${lineHeights.single};
  text-align: center;
  color: ${({ color }) => color};
  gap: 8px;
`;

const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const LoadingLabel = styled.span`
  font-size: ${fontSizes.caption}px;
  font-weight: ${fontWeights.semibold};
`;

const StyledSend = styled(Send)`
  width: 12px;
  height: 12px;
  color: ${peer.white};
`;

const StyledChevronRight = styled(ChevronRight)`
  width: 18px;
  height: 18px;
  color: ${peer.textSecondary};
  margin-right: -4px;
`;

const StyledLogOut = styled(LogOut)`
  width: 15px;
  height: 15px;
  color: ${peer.textSecondary};
`;

const StyledRefresh = styled(RefreshCw)`
  width: 15px;
  height: 15px;
  color: ${peer.textSecondary};
`;

const StyledTrash = styled(Trash2)`
  width: 13px;
  height: 13px;
  color: ${peer.textSecondary};
`;

const StyledUnlock = styled(Unlock)`
  width: 14px;
  height: 14px;
  color: ${peer.textSecondary};
`;

const StyledUserX = styled(UserX)`
  width: 15px;
  height: 15px;
  color: ${peer.textSecondary};
`;

const StyledPlus = styled(Plus)`
  width: 15px;
  height: 15px;
  color: ${peer.textSecondary};
`;

const StyledMinus = styled(Minus)`
  width: 15px;
  height: 15px;
  color: ${peer.textSecondary};
`;
