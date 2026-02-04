import styled from "styled-components";
import { colors, radii, fontWeights } from "@theme/colors";

export const ReadOnlyInput: React.FC<{
  label: string;
  value: any;
}> = ({ label, value }) => {
  return (
    <InputContainer>
      <Label>
        {label}
      </Label>
      <Input value={value} placeholder={label} readOnly={true} />
    </InputContainer>
  );
};

const Col = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled(Col)`
  gap: 12px;
  margin: 4px;
`;

const Label = styled.label`
  color: ${colors.textSecondary};
  font-weight: ${fontWeights.medium};
`;

const Input = styled.input`
  border: 1px solid ${colors.defaultBorderColor};
  background: ${colors.inputDefaultColor};
  border-radius: ${radii.md}px;
  padding: 8px 12px;
  height: 32px;
  display: flex;
  align-items: center;
  color: ${colors.darkText};
  font-size: 16px;
  user-select: none;
  -webkit-user-select: none;
  pointer-events: none;
  opacity: 0.6;
`;
