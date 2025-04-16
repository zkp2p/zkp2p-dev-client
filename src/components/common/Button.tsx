import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { colors } from '@theme/colors';
import Spinner from '@components/common/Spinner';


interface ButtonProps {
  fullWidth?: boolean;
  width?: number;
  height?: number;
  fontSize?: number;
  bgColor?: string;
  disabled?: boolean;
  loading?: boolean;
  borderRadius?: number;
  leftAccessorySvg?: string;
  svg?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  padding?: string;
}

export const Button: React.FC<ButtonProps> = ({
  fullWidth = false,
  width,
  height = 48,
  fontSize = 16,
  bgColor = colors.buttonDefault,
  disabled = false,
  loading = false,
  leftAccessorySvg,
  svg,
  borderRadius = 24,
  onClick,
  children,
  padding
}) => {
  const [svgLoaded, setSvgLoaded] = useState(!svg);
  
  return (
    <BaseButton
      fullWidth={fullWidth}
      width={width}
      height={height}
      fontSize={fontSize}
      bgColor={bgColor}
      disabled={disabled}
      $disabled={disabled}
      $loading={loading}
      $svgLoaded={!svg && svgLoaded}
      borderRadius={borderRadius}
      onClick={onClick}
      padding={padding}
    >
      {loading ? (
        <Spinner />
      ) : (
        <ContentContainer>
          {leftAccessorySvg && <LeftAccessory src={leftAccessorySvg} alt="" />}
          {children}
        </ContentContainer>
      )}

      {svg &&
        <SVGOverlay 
          src={svg} 
          onLoad={() => setSvgLoaded(true)} 
          onError={() => setSvgLoaded(true)}
        />
      }
    </BaseButton>
  );
};

const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const LeftAccessory = styled.img`
  margin-top: -2px;
  height: 28px;
  width: 28px;
`;

interface BaseButtonProps {
  fullWidth?: boolean;
  width?: number;
  height?: number;
  fontSize?: number;
  bgColor?: string;
  $disabled?: boolean;
  $loading?: boolean;
  onClick?: () => void;
  borderRadius?: number;
  children?: React.ReactNode;
  padding?: string;
}

const BaseButton = styled.button<BaseButtonProps & { $svgLoaded: boolean }>`
  width: ${({ fullWidth, width }) => fullWidth ? '100%' : width ? `${width}px` : 'auto'};
  height: ${({ height }) => height}px;
  background: ${({ bgColor }) => bgColor || colors.buttonDefault};
  box-shadow: inset -3px -6px 4px rgba(0, 0, 0, 0.16);
  border-radius: ${({ borderRadius }) => borderRadius ? `${borderRadius}px` : '24px'};
  padding: ${({ padding, fullWidth }) => padding || (fullWidth ? '8px 0' : '8px 24px')};
  text-align: center;
  color: white;
  font-weight: 700;
  font-size: ${({ fontSize }) => fontSize}px;
  font-family: 'Graphik';
  cursor: pointer;
  display: inline-block;
  transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: none;
  position: relative;

  &:hover:not([disabled]) {
    background: ${colors.buttonHover};
  }

  &:active:not([disabled]) {
    background: ${colors.buttonDefault};
    box-shadow: inset 0px -8px 0px rgba(0, 0, 0, 0.16);
  }

  ${({ $disabled }) => 
    $disabled && css`
      opacity: 0.5;
      cursor: not-allowed;
      color: ${colors.darkText};
      background: ${colors.buttonDefault};
    `
  }

  ${({ $loading }) => 
    $loading && css`
      cursor: wait;
      background: ${colors.buttonDisabled};
    `
  }

  ${({ $svgLoaded }) => 
    !$svgLoaded && css`
      background: transparent;
    `
  }
`;

const SVGOverlay = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
  pointer-events: none;
`;
