import React, { useState } from 'react';
import styled, { css } from 'styled-components/macro';
import { Check, Copy } from 'react-feather';
import { colors, opacify } from '@theme/colors';


interface CopyButtonProps {
  textToCopy: string;
  size?: 'sm' | 'default';
};

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  size = 'default'
}) => {
  /*
   * State
   */

  const [copied, setCopied] = useState<boolean>(false);

  /*
   * Handlers
   */

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyClick = () => {
    if (!copied) {
      copyToClipboard(textToCopy);
    }
  };

  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <IconBorder
      type="button"
      onClick={handleCopyClick}
      size={size}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
    >
      {copied ? <StyledCheck size={iconSize}/> : <StyledCopy size={iconSize}/>}
    </IconBorder>
  );
};

const StyledCopy = styled(Copy).attrs({ 'aria-hidden': true })<{ size: number }>`
  color: ${colors.lightGrayText};
  cursor: pointer;
  ${({ size }) => `
    height: ${size}px;
    width: ${size}px;
  `}
`;

const StyledCheck = styled(Check).attrs({ 'aria-hidden': true })<{ size: number }>`
  color: ${colors.lightGrayText};
  cursor: pointer;
  ${({ size }) => `
    height: ${size}px;
    width: ${size}px;
  `}
`;

const IconBorder = styled.button<{ size: 'sm' | 'default' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  ${({ size }) => css`
    padding: ${size === 'sm' ? '0px' : '10px'};
  `}
  border: none;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 1px solid ${opacify(30, colors.white)};
    outline-offset: 2px;
  }
`;
