import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, X, XOctagon } from 'react-feather';
import { colors } from '@theme/colors';
import { ThemedText } from '@theme/text';

interface WarningTextBoxProps {
  text: string;
  type?: 'warning' | 'error' | 'info';
  showCloseClick?: boolean;
  onCloseClick?: () => void;
  size?: 's' | 'm' | 'l';
  fontSize?: string;
}

export const WarningTextBox: React.FC<WarningTextBoxProps> = ({ 
  text, 
  type = 'warning',
  showCloseClick = false,
  onCloseClick,
  size = 'm',
  fontSize = '14px',
}) => {
  const isError = type === 'error';
  const isInfo = type === 'info';
  const color = isError ? colors.warningRed : isInfo ? colors.warningYellow : colors.darkText;
  const Icon = isError ? XOctagon : AlertTriangle;

  // Define icon sizes
  const iconSize = size === 's' ? 20 : size === 'l' ? 40 : 30;
  const closeIconSize = size === 's' ? 16 : size === 'l' ? 24 : 20;
  
  // Define icon container sizes (ensuring minimum sizes)
  const iconContainerSize = size === 's' ? 24 : size === 'l' ? 48 : 36;
  const closeIconContainerSize = size === 's' ? 20 : size === 'l' ? 28 : 24;

  return (
    <Container $type={type} $size={size}>
      <IconAndTextContainer>
        <IconContainer $size={iconContainerSize}>
          <Icon size={iconSize} color={color} />
        </IconContainer>
        <ThemedText.BodySmall style={{ color, fontSize, lineHeight: '1.5' }}>
          {text}
        </ThemedText.BodySmall>
      </IconAndTextContainer>

      {showCloseClick && (
        <CloseButton onClick={onCloseClick} $size={closeIconContainerSize}>
          <X size={closeIconSize} color={color} />
        </CloseButton>
      )}
    </Container>
  );
};

const Container = styled.div<{ $type?: 'warning' | 'error' | 'info', $size: 's' | 'm' | 'l' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ $size }) => ($size === 's' ? '6px' : $size === 'l' ? '12px' : '8px')};
  padding: ${({ $size }) => ($size === 's' ? '8px' : $size === 'l' ? '16px' : '12px')};
  background-color: ${({ $type }) => 
    $type === 'error' ? 'rgba(255, 67, 67, 0.1)' : 
    $type === 'info' ? 'rgba(255, 193, 7, 0.1)' :
    $type === 'warning' ? 'rgba(255, 67, 67, 0.1)' : colors.container};
  border: 1px solid ${({ $type }) => 
    $type === 'error' ? colors.warningRed : 
    $type === 'info' ? colors.warningYellow :
    $type === 'warning' ? colors.warningRed : colors.defaultBorderColor};
  border-radius: 16px;
  white-space: normal;
`;

const IconAndTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconContainer = styled.div<{ $size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ $size }) => `${$size}px`};
  min-height: ${({ $size }) => `${$size}px`};
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
`;

const CloseButton = styled.button<{ $size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ $size }) => `${$size}px`};
  min-height: ${({ $size }) => `${$size}px`};
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;