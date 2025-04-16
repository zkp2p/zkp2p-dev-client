import React, { useState } from 'react';
import styled, { css } from 'styled-components/macro';
import { Check, Copy } from 'react-feather';
import { colors } from '@theme/colors';


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
    <IconBorder onClick={handleCopyClick} size={size}>
      {copied ? <StyledCheck size={iconSize}/> : <StyledCopy size={iconSize}/>}
    </IconBorder>
  );
};

const StyledCopy = styled(Copy)<{ size: number }>`
  color: ${colors.lightGrayText};
  cursor: pointer;
  ${({ size }) => `
    height: ${size}px;
    width: ${size}px;
  `}
`;

const StyledCheck = styled(Check)<{ size: number }>`
  color: ${colors.lightGrayText};
  cursor: pointer;
  ${({ size }) => `
    height: ${size}px;
    width: ${size}px;
  `}
`;

const IconBorder = styled.div<{ size: 'sm' | 'default' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  ${({ size }) => css`
    padding: ${size === 'sm' ? '0px' : '10px'};
  `}
`;
