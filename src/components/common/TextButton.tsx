import React from 'react';
import styled, { css } from 'styled-components';

import Spinner from '@components/common/Spinner';
import {
  peer,
  fontFamilies,
  fontWeights,
  fontSizes,
  letterSpacing,
  lineHeights,
} from '@theme/colors';

type iconType =
  | 'send'
  | 'chevronRight'
  | 'trash'
  | 'userX'
  | 'logout'
  | 'refresh';

interface TextButtonProps {
  fullWidth?: boolean;
  title?: string;
  height?: number;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: iconType;
}

export const TextButton: React.FC<TextButtonProps> = ({
  fullWidth = false,
  title = '',
  height = 48,
  disabled = false,
  loading = false,
  onClick,
  children,
}) => {
  return (
    <Container
      fullWidth={fullWidth}
      height={height}
      disabled={disabled || loading}
      onClick={onClick}
    >
      <ButtonAndLabelContainer>
        {loading ? (
          <Spinner />
        ) : (
          <>
            {title && <span>{title}</span>}
            {children}
          </>
        )}
      </ButtonAndLabelContainer>
    </Container>
  );
};

const Container = styled.button<TextButtonProps>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  height: ${({ height }) => height}px;
  background: transparent;
  border: none;
  padding: 0px 16px;
  color: ${peer.white};
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  text-decoration: underline;

  &:hover:not([disabled]) {
    color: ${peer.textSecondary};
  }

  &:active:not([disabled]) {
    color: ${peer.textPrimary};
  }

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      &:hover,
      &:active {
        color: ${peer.white};
        text-decoration: none;
      }
    `}

  ${({ loading }) =>
    loading &&
    css`
      cursor: wait;
    `}
`;

const ButtonAndLabelContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: ${fontSizes.button}px;
  font-family: ${fontFamilies.body};
  font-weight: ${fontWeights.semibold};
  letter-spacing: ${letterSpacing.wide};
  text-transform: uppercase;
  line-height: ${lineHeights.single};
  text-align: center;
  color: inherit;
  gap: 8px;
`;
