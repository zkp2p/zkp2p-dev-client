import { ReactNode } from "react";
import styled from "styled-components/macro";

import noop from "@helpers/noop";
import Popover, { PopoverProps } from "@components/common/Popover";
import {
  peer,
  radii,
  fontSizes,
  fontWeights,
  lineHeights,
} from "@theme/colors";

enum TooltipSize {
  Small = "256px",
  Large = "400px",
}

const getPaddingForSize = (size: TooltipSize) => {
  switch (size) {
    case TooltipSize.Small:
      return "12px";
    case TooltipSize.Large:
      return "16px 20px";
  }
};

const TooltipContainer = styled.div<{ size: TooltipSize }>`
  max-width: ${({ size }) => size};
  width: calc(100vw - 16px);
  cursor: default;
  padding: ${({ size }) => getPaddingForSize(size)};
  pointer-events: auto;

  color: ${peer.textPrimary};
  font-weight: ${fontWeights.medium};
  font-size: ${fontSizes.caption}px;
  line-height: ${lineHeights.body};
  word-break: break-word;

  background-color: ${peer.richBlack};
  border-radius: ${radii.md}px;
  border: 1px solid ${peer.borderDark};
`;

type TooltipProps = Omit<PopoverProps, "content"> & {
  text: ReactNode;
  open?: () => void;
  close?: () => void;
  size?: TooltipSize;
  disabled?: boolean;
  timeout?: number;
};

// TODO(WEB-2024)
// Migrate to MouseoverTooltip and move this component inline to MouseoverTooltip
export default function Tooltip({
  text,
  open,
  close,
  disabled,
  size = TooltipSize.Small,
  ...rest
}: TooltipProps) {
  return (
    <Popover
      content={
        text && (
          <TooltipContainer
            size={size}
            onMouseEnter={disabled ? noop : open}
            onMouseLeave={disabled ? noop : close}
          >
            {text}
          </TooltipContainer>
        )
      }
      {...rest}
    />
  );
}
