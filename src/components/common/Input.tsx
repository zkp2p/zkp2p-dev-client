import React, { ChangeEvent, ReactNode } from 'react';
import styled from 'styled-components';
// import { Lock as LockIcon } from 'react-feather';

import QuestionHelper from '@components/common/QuestionHelper';
import {
  peer,
  radii,
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  opacify,
} from '@theme/colors';


interface InputProps {
  label: string;
  name: string;
  value?: string;
  type?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  pattern?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputLabel?: string;
  iconElement?: React.ReactNode;
  readOnly?: boolean;
  accessoryLabel?: string;
  helperText?: ReactNode;
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
  inputMode,
  pattern,
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

  const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
    if (type === 'number') {
      event.currentTarget.blur();
    }
  };

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
            value={
              (value === undefined || value === '') && placeholder
                ? placeholder
                : (value ?? '')
            }
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            onWheel={handleWheel}
            readOnly={readOnly}
            valueFontSize={valueFontSize}
            spellCheck="false"
            autoComplete="off"
            inputMode={inputMode}
            pattern={pattern}
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
            <MaxButton type="button" onClick={maxButtonOnClick}>
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
  border-radius: ${radii.md}px;
  border: 1px solid transparent;
  background-color: ${peer.black};
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-within {
    border-color: ${peer.white};
    box-shadow: 0 0 0 2px ${opacify(20, peer.white)};
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
  color: ${peer.textSecondary};
`;

const Label = styled.label`
  display: flex;
  font-size: ${fontSizes.button}px;
  font-weight: ${fontWeights.semibold};
  white-space: nowrap;
`;

const InputWrapper = styled.div`
  width: 100%;  
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  margin-top: 8px;
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
  outline: none;
  color: ${peer.textPrimary};
  background-color: transparent;
  font-size: ${({ valueFontSize }) => valueFontSize ?? `${fontSizes.bodyLarge}px`};
  font-family: ${fontFamilies.body};
  font-weight: ${fontWeights.medium};
  line-height: ${lineHeights.body};
  font-variant-numeric: tabular-nums;

  &:focus {
    box-shadow: none;
    outline: none;
  }

  &:focus-visible {
    box-shadow: none;
    outline: none;
  }

  &::placeholder {
    color: ${peer.textPlaceholder};
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
    -webkit-box-shadow: 0 0 0 30px ${peer.black} inset !important;
    -webkit-text-fill-color: ${peer.textPrimary} !important;
  }
`;

const AccessoryAndInputLabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: ${peer.textSecondary};
  margin: 4px 0 0;
`;

const AccessoryLabelAndMax = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
`;

const MaxButton = styled.button.attrs({ type: 'button' })`
  border: none;
  background: transparent;
  color: ${peer.white};
  font-size: ${fontSizes.button}px;
  font-weight: ${fontWeights.semibold};
  padding-bottom: 1px;
  cursor: pointer;
  transition: color 0.15s ease-out;
  touch-action: manipulation;

  &:hover {
    color: ${peer.igniteRed};
  }

  &:focus-visible {
    outline: 2px solid ${peer.igniteYellow};
    outline-offset: 2px;
    border-radius: ${radii.xs}px;
  }
`;

const AccessoryLabel = styled.div`
  font-size: ${fontSizes.button}px;
  text-align: right;
  font-weight: ${fontWeights.semibold};
`;

const InputLabel = styled.div`
  pointer-events: none;
  color: ${peer.textPrimary};
  font-size: ${fontSizes.body}px;
  text-align: right;
  font-family: ${fontFamilies.body};
`;

const InputLabelWithIcon = styled.div`
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${fontSizes.body}px;
  font-weight: ${fontWeights.semibold};
  color: ${peer.textPrimary};
  pointer-events: none;
  text-align: right;
  font-family: ${fontFamilies.body};
`;
