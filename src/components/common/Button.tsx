import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import {
  peer,
  gradients,
  opacify,
  radii,
  fontFamilies,
  fontWeights,
  letterSpacing,
} from '@theme/colors';
import Spinner from '@components/common/Spinner';
import { getSpinnerSizeForButton } from '@components/common/spinnerUtils';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'legacy';

interface ButtonProps {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  width?: number;
  height?: number;
  fontSize?: number;
  bgColor?: string;
  reverseGradient?: boolean;
  disabled?: boolean;
  loading?: boolean;
  borderRadius?: number;
  leftAccessorySvg?: string;
  svg?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  padding?: string;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  width,
  height = 48,
  fontSize = 14,
  bgColor,
  reverseGradient = false,
  disabled = false,
  loading = false,
  leftAccessorySvg,
  svg,
  borderRadius = radii.md,
  onClick,
  children,
  padding,
  loadingText,
}) => {
  const [svgLoaded, setSvgLoaded] = useState(!svg);
  const spinnerSize = getSpinnerSizeForButton(height);

  const resolvedBgColor =
    bgColor || (variant === 'legacy' ? peer.igniteRed : undefined);

  return (
    <BaseButton
      fullWidth={fullWidth}
      width={width}
      height={height}
      fontSize={fontSize}
      bgColor={resolvedBgColor}
      disabled={disabled}
      $disabled={disabled}
      $loading={loading}
      $svgLoaded={!svg && svgLoaded}
      $variant={variant}
      $reverseGradient={reverseGradient}
      borderRadius={borderRadius}
      onClick={onClick}
      padding={padding}
    >
      {loading ? (
        <ContentContainer>
          <Spinner
            size={spinnerSize}
            color={variant === 'secondary' ? peer.black : peer.white}
          />
          {loadingText ? <span>{loadingText}</span> : null}
        </ContentContainer>
      ) : (
        <ContentContainer>
          {leftAccessorySvg && <LeftAccessory src={leftAccessorySvg} alt="" />}
          {children}
        </ContentContainer>
      )}

      {svg && (
        <SVGOverlay
          src={svg}
          onLoad={() => setSvgLoaded(true)}
          onError={() => setSvgLoaded(true)}
        />
      )}
    </BaseButton>
  );
};

const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  z-index: 1;
`;

const LeftAccessory = styled.img.attrs({ width: 28, height: 28 })`
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
  $variant?: ButtonVariant;
  $reverseGradient?: boolean;
  onClick?: () => void;
  borderRadius?: number;
  children?: React.ReactNode;
  padding?: string;
}

const primaryStyles = css<{ $reverseGradient?: boolean }>`
  background: ${({ $reverseGradient }) =>
    $reverseGradient ? gradients.igniteHover : gradients.ignite};
  color: ${peer.black};
  font-weight: ${fontWeights.semibold};
  letter-spacing: ${letterSpacing.wide};
  text-transform: uppercase;
  border: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $reverseGradient }) =>
      $reverseGradient ? gradients.ignite : gradients.igniteHover};
    opacity: 0;
    transition: opacity 0.25s ease-out;
    pointer-events: none;
    border-radius: inherit;
  }

  &:hover:not([disabled])::before {
    opacity: 1;
  }

  &:active:not([disabled]) {
    transform: scale(0.98);
  }

  &:active:not([disabled])::before {
    opacity: 0;
  }
`;

const secondaryStyles = css`
  background: ${peer.white};
  color: ${peer.black};
  font-weight: ${fontWeights.semibold};
  letter-spacing: ${letterSpacing.wide};
  text-transform: uppercase;
  border: 1px solid transparent;

  &:hover:not([disabled]) {
    background: ${peer.lightGrey};
  }

  &:active:not([disabled]) {
    background: ${peer.white};
    transform: scale(0.98);
  }
`;

const tertiaryStyles = css`
  background: ${peer.richBlack};
  color: ${peer.textPrimary};
  font-weight: ${fontWeights.semibold};
  letter-spacing: ${letterSpacing.wide};
  text-transform: uppercase;
  border: none;

  &:hover:not([disabled]) {
    background: ${peer.borderDark};
  }

  &:active:not([disabled]) {
    background: ${peer.richBlack};
    transform: scale(0.98);
  }
`;

const legacyStyles = css`
  background: ${peer.igniteRed};
  color: ${peer.white};
  font-weight: ${fontWeights.semibold};
  box-shadow: inset -3px -6px 4px ${opacify(16, peer.black)};
  border: none;

  &:hover:not([disabled]) {
    background: ${peer.igniteRed};
  }

  &:active:not([disabled]) {
    background: ${peer.igniteRed};
    box-shadow: inset 0px -8px 0px ${opacify(16, peer.black)};
  }
`;

const BaseButton = styled.button<BaseButtonProps & { $svgLoaded: boolean }>`
  width: ${({ fullWidth, width }) =>
    fullWidth ? '100%' : width ? `${width}px` : 'auto'};
  height: ${({ height }) => height}px;
  border-radius: ${({ borderRadius }) =>
    borderRadius ? `${borderRadius}px` : `${radii.md}px`};
  padding: ${({ padding, fullWidth }) =>
    padding || (fullWidth ? '16px 0' : '16px 24px')};
  text-align: center;
  font-size: ${({ fontSize }) => fontSize}px;
  font-family: ${fontFamilies.body};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.25s ease-out,
    opacity 0.2s ease-out,
    transform 0.15s ease-out;
  position: relative;
  overflow: hidden;
  background-clip: padding-box;

  &:focus-visible {
    outline: 1px solid ${opacify(30, peer.white)};
    outline-offset: 2px;
  }

  ${({ $variant, bgColor }) => {
    if (bgColor) {
      return css`
        background: ${bgColor};
        color: ${peer.white};
        font-weight: ${fontWeights.semibold};
        border: none;
        box-shadow: inset -3px -6px 4px ${opacify(16, peer.black)};

        &:hover:not([disabled]) {
          filter: brightness(0.9);
        }
      `;
    }
    switch ($variant) {
      case 'primary':
        return primaryStyles;
      case 'secondary':
        return secondaryStyles;
      case 'tertiary':
        return tertiaryStyles;
      default:
        return legacyStyles;
    }
  }}

  ${({ $disabled, $variant }) =>
    $disabled &&
    css`
      opacity: ${$variant === 'primary' ? '0.4' : '0.5'};
      cursor: not-allowed;
    `}

  ${({ $loading }) =>
    $loading &&
    css`
      cursor: wait;
      opacity: 0.7;
    `}

  ${({ $svgLoaded }) =>
    !$svgLoaded &&
    css`
      background: transparent;
    `}
`;

const SVGOverlay = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
  pointer-events: none;
`;
