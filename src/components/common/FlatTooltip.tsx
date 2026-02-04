import { ReactNode} from 'react';
import styled from 'styled-components/macro';

import noop from '@helpers/noop';
import Popover, { PopoverProps } from '@components/common/Popover';
import { peer, radii, fontSizes, fontWeights, lineHeights } from '@theme/colors';


const TooltipContainer = styled.div`
  max-width: 100px;
  width: calc(100vw - 16px);
  cursor: default;
  padding: 4px 0px 2px 0px;

  color: ${peer.textPrimary};
  font-weight: ${fontWeights.medium};
  font-size: ${fontSizes.caption}px;
  line-height: ${lineHeights.body};
  text-align: center;

  background-color: ${peer.richBlack};
  border: 1px solid ${peer.borderDark};
  border-radius: ${radii.md}px;
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
