import _ from "lodash";
import React, { CSSProperties } from "react";
import styled from "styled-components";

import { Col } from "@components/common/Layout";
import { CopyButton } from "@components/common/CopyButton";
import { colors } from "@theme/colors";


export const LabeledTextArea: React.FC<{
  style?: CSSProperties;
  className?: string;
  label: string;
  value: string;
  warning?: string;
  warningColor?: string;
  disabled?: boolean;
  disabledReason?: string;
  secret?: boolean;
  placeholder?: string;
  height?: string;
  showCopyButton?: boolean;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}> = ({
  style,
  warning,
  warningColor,
  disabled,
  disabledReason,
  label,
  value,
  onChange,
  className,
  secret,
  placeholder,
  height = '16vh',
  showCopyButton = false
}) => {
  return (
    <LabeledTextAreaContainer
      className={_.compact(["labeledTextAreaContainer", className]).join(" ")}
      height={height}
    >
      <Label isEmpty={!label}>{label}</Label>
      {warning && (
        <span className="warning" style={{ color: warningColor }}>
          {warning}
        </span>
      )}
      <TextAreaWrapper>
        <TextArea
          style={style}
          aria-label={label} 
          title={disabled ? disabledReason : ""}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          height={height}
        />
        {showCopyButton && value && (
          <CopyButtonWrapper>
            <CopyButton textToCopy={value} />
          </CopyButtonWrapper>
        )}
      </TextAreaWrapper>

      {secret && (
        <div className="secret">Hover to reveal public info sent to chain</div>
      )}
    </LabeledTextAreaContainer>
  );
};

const Label = styled.label<{ isEmpty: boolean }>`
  color: #FFF;
  padding-bottom: ${(props) => (props.isEmpty ? '0' : '10px')};
  padding-left: 8px;
`;

const LabeledTextAreaContainer = styled(Col)<{ height: string }>`
  height: ${(props) => props.height};
  border-radius: 4px;
  position: relative;
  width: 100%;

  & .warning {
    color: #bd3333;
    font-size: 80%;
  }

  .secret {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #171717;
    border: 1px dashed rgba(255, 255, 255, 0.5);
    color: rgba(0, 0, 0, 0.8);
    user-select: none;
    pointer-events: none;
    opacity: 0.95;
    justify-content: center;
    display: flex;
    align-items: center;
    transition: opacity 0.3s ease-in-out;
  }

  &:hover .secret,
  & :focus + .secret {
    opacity: 0;
  }
`;

const TextAreaWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const TextArea = styled.textarea<{ height: string }>`
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  height: ${props => props.height};
  padding: 16px;
  transition: all 0.2s ease-in-out;
  resize: none;
  color: #FFF;
  width: 100%;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.5;
  box-sizing: border-box;
  display: block;

  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.4);
  }
`;

const CopyButtonWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
