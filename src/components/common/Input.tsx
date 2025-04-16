import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { Lock as LockIcon } from 'react-feather';

import QuestionHelper from '@components/common/QuestionHelper';
import { colors } from '@theme/colors';


interface InputProps {
  label: string;
  name: string;
  value?: string;
  type?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputLabel?: string;
  iconElement?: React.ReactNode;
  readOnly?: boolean;
  accessoryLabel?: string;
  helperText?: string;
  enableMax?: boolean
  valueFontSize?: string;
  maxButtonOnClick?: () => void;
  locked?: boolean;
  lockLabel?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder,
  inputLabel,
  iconElement,
  type = "text",
  readOnly = false,
  accessoryLabel="",
  helperText="",
  valueFontSize="24px",
  enableMax=false,
  maxButtonOnClick=() => {},
  locked = false,
  lockLabel = "",
}: InputProps) => {
  Input.displayName = "Input";

  return (
    <Container>
      <LabelAndInputContainer>
        <LabelAndTooltipContainer>
          <Label htmlFor={name}>
            {label}
          </Label>

          {helperText && (
            <QuestionHelper
              text={helperText}
            />
          )}

          {locked && lockLabel && (
            <QuestionHelper
              text={lockLabel}
              size="sm"
              isLock={true}
            />
          )}
        </LabelAndTooltipContainer>

        <InputWrapper>
          <StyledInput
            type={type}
            name={name}
            id={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            readOnly={readOnly}
            valueFontSize={valueFontSize}
            spellCheck="false"
            autoComplete="off"
            data-1p-ignore
          />
        </InputWrapper>
      </LabelAndInputContainer>
      
      <AccessoryAndInputLabelWrapper>
        <AccessoryLabelAndMax>
          <AccessoryLabel>
            {accessoryLabel}
          </AccessoryLabel>

          {enableMax && (
            <MaxButton onClick={maxButtonOnClick}>
              Max
            </MaxButton>
          )}
        </AccessoryLabelAndMax>

        {iconElement ? (
          <InputLabelWithIcon>
            {iconElement}
          </InputLabelWithIcon>
        ) : inputLabel ? (
          <InputLabel>
            <span>{inputLabel}</span>
          </InputLabel>
        ) : null}
      </AccessoryAndInputLabelWrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${colors.defaultBorderColor};
  background-color: ${colors.inputDefaultColor};

  &:focus-within {
    border-color: ${colors.inputPlaceholderColor};
    border-width: 1px;
  }
`;

const LabelAndInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

const LabelAndTooltipContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 0.25rem;
  align-items: flex-end;
  color: #CED4DA;
`;

const Label = styled.label`
  display: flex;
  font-size: 14px;
  font-weight: 550;
`;

const InputWrapper = styled.div`
  width: 100%;  
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  margin-top: 10px;
`;

interface StyledInputProps {
  readOnly?: boolean;
  valueFontSize?: string;
}

const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  flex-grow: 1;
  border: 0;
  padding: 0;
  color: ${colors.darkText};
  background-color: ${colors.inputDefaultColor};
  font-size: ${({ valueFontSize }) => valueFontSize ? valueFontSize : '24px'};

  &:focus {
    box-shadow: none;
    outline: none;
  }

  &:placeholder {
    color: ${colors.inputPlaceholderColor};
  }

  &[type='number'] {
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  ${({ readOnly }) => 
    readOnly && `
      pointer-events: none;
    `
  }

  /* Disable spellcheck visual indicators */
  &:not([type="number"]) {
    spellcheck: false;
    -webkit-spellcheck: false;
  }

  /* Disable password manager suggestions */
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px ${colors.container} inset !important;
  }
`;

const AccessoryAndInputLabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: ${colors.grayText};
  margin: 6px 0px 2px 0px;
`;

const AccessoryLabelAndMax = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
`;

const MaxButton = styled.div`
  color: ${colors.darkText};
  font-size: 14px;
  font-weight: 600;
  padding-bottom: 1px;
  cursor: pointer;
`;

const AccessoryLabel = styled.div`
  font-size: 14px;
  text-align: right;
  font-weight: 550;
`;

const InputLabel = styled.div`
  pointer-events: none;
  color: ${colors.darkText};
  font-size: 20px;
  text-align: right;
`;

const InputLabelWithIcon = styled.div`
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 20px;
  font-weight: 600;
  color: ${colors.darkText};
  pointer-events: none;
  text-align: right;
`;
