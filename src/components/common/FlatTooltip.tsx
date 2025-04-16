import { ReactNode} from 'react';
import styled from 'styled-components/macro';

import noop from '@helpers/noop';
import Popover, { PopoverProps } from '@components/common/Popover';
import { colors } from '@theme/colors';


const TooltipContainer = styled.div`
  max-width: 100px;
  width: calc(100vw - 16px);
  cursor: default;
  padding: 4px 0px 2px 0px;

  color: ${({ theme }) => theme.textPrimary};
  font-weight: 400;
  font-size: 12px;
  text-align: center;

  background-color: ${colors.container};
  border: 1px solid ${colors.defaultBorderColor};
`

type TooltipProps = Omit<PopoverProps, 'content'> & {
  text: ReactNode
  open?: () => void
  close?: () => void
  disabled?: boolean
  timeout?: number
}

// TODO(WEB-2024)
// Migrate to MouseoverTooltip and move this component inline to MouseoverTooltip
export default function FlatTooltip({ text, open, close, disabled, ...rest }: TooltipProps) {
  return (
    <Popover
      hideArrow={true}
      placement={'top'}
      content={
        text && (
          <TooltipContainer onMouseEnter={disabled ? noop : open} onMouseLeave={disabled ? noop : close}>
            {text}
          </TooltipContainer>
        )
      }
      {...rest}
    />
  )
}
