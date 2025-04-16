import { ReactNode, useCallback, useState } from 'react';
import { HelpCircle, Lock } from 'react-feather';
import styled from 'styled-components/macro';

import Tooltip from '@components/common/Tooltip';


export default function QuestionHelper({ 
  text, 
  size = 'sm', 
  color,
  isLock = false
}: { 
  text: ReactNode; 
  size?: 'xsm' | 'sm' | 'medium';
  color?: string;
  isLock?: boolean;
}) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip text={text} show={show} open={open} close={close}>
      <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close} size={size}>
        <QuestionMark size={size} color={color}>
          {isLock ? (
            <Lock size={size === 'xsm' ? 12 : size === 'sm' ? 14 : 22} />
          ) : (
            <HelpCircle size={size === 'xsm' ? 12 : size === 'sm' ? 16 : 22} />
          )}
        </QuestionMark>
      </QuestionWrapper>
    </Tooltip>
  )
}

const QuestionWrapper = styled.div<{ size: 'xsm' | 'sm' | 'medium' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
  width: ${({ size }) => (size === 'xsm' ? '14px' : size === 'sm' ? '18px' : '24px')};
  height: ${({ size }) => (size === 'xsm' ? '14px' : size === 'sm' ? '18px' : '24px')};
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: ${({ size }) => (size === 'xsm' ? '28px' : size === 'sm' ? '36px' : '42px')};
  font-size: ${({ size }) => (size === 'xsm' ? '10px' : size === 'sm' ? '12px' : '16px')};

  :hover,
  :focus {
    opacity: 0.7;
  }
`;

const QuestionMark = styled.span<{ size: 'xsm' | 'sm' | 'medium'; color?: string }>`
  display: flex;
  font-size: ${({ size }) => (size === 'xsm' ? '12px' : size === 'sm' ? '14px' : '16px')};
  align-items: center;
  justify-content: center;
  color: ${({ color, theme }) => color || theme.textSecondary};
`;
