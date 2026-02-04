import styled from "styled-components";
import { colors, radii, fontWeights } from "@theme/colors";

export const SingleLineInput: React.FC<{
  label: string;
  value: any;
  placeholder: string;
  onChange: (e: any) => void;
  readOnly?: boolean;
  error?: string | null;
}> = ({
  label,
  value,
  placeholder,
  onChange,
  readOnly = false,
  error = null,
}) => {
  return (
    <InputContainer>
      <label
        style={{
          color: colors.textSecondary,
          fontWeight: fontWeights.medium,
        }}
      >
        {label}
      </label>
      <Input
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        hasError={!!error}
      />
      { error &&
        <ErrorMessage>
          {error}
        </ErrorMessage>
      }
    </InputContainer>
  );
};

const Col = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled(Col)`
  gap: 8px;
`;

const Input = styled.input<{ hasError: boolean }>`
  border: 1px solid ${props =>
    props.hasError ? colors.invalidRed : colors.defaultBorderColor};
  background: ${colors.inputDefaultColor};
  border-radius: ${radii.md}px;
  padding: 8px 12px;
  height: 32px;
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 16px;
  transition: border-color 0.2s ease-in-out;

  &:hover {
    border: 1px solid ${colors.textSecondary};
  }

  &:focus-visible {
    outline: none;
    border: 1px solid ${colors.textSecondary};
  }
`;

const ErrorMessage = styled.div`
  color: ${colors.invalidRed};
  font-size: 12px;
  margin-top: 4px;
`;
