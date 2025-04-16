import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { colors } from '@theme/colors';

interface HorizontalInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  selectorElement?: React.ReactNode;
  valueFontSize?: string;
  inputLabel?: string;
  width?: string;
}

export const HorizontalInput: React.FC<HorizontalInputProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly = false,
  selectorElement,
  valueFontSize = "16px",
  inputLabel,
  width
}) => {
  return (
    <Container width={width}>
      <Label>{label}</Label>
      <InputContainer>
        <StyledInput
          type={type}
          name={name}
          id={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          valueFontSize={valueFontSize}
        />
        {inputLabel && (
          <InputLabel>
            <span>{inputLabel}</span>
          </InputLabel>
        )}
        {selectorElement && (
          <SelectorContainer>
            {selectorElement}
          </SelectorContainer>
        )}
      </InputContainer>
    </Container>
  );
};

interface ContainerProps {
  width?: string;
}

const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${colors.defaultBorderColor};
  background-color: ${colors.inputDefaultColor};
  width: ${({ width }) => width || 'auto'};

  &:focus-within {
    border-color: ${colors.inputPlaceholderColor};
  }
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.grayText};
  white-space: nowrap;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
  flex: 1;
`;

interface StyledInputProps {
  readOnly?: boolean;
  valueFontSize?: string;
}

const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  border: 0;
  padding: 0;
  color: ${colors.darkText};
  background-color: ${colors.inputDefaultColor};
  font-size: ${({ valueFontSize }) => valueFontSize};

  &:focus {
    outline: none;
  }

  &::placeholder {
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
`;

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
`;

const InputLabel = styled.div`
  pointer-events: none;
  color: ${colors.darkText};
  font-size: 16px;
  text-align: right;
  white-space: nowrap;
  margin-left: 4px;
`; 