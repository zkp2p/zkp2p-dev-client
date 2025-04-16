import styled from "styled-components";

import { CenterAllDiv, Row } from "@components/common/Layout";
import { colors } from "@theme/colors";

export const InstructionStep: React.FC<{
  step?: number;
  children: React.ReactNode;
}> = ({ step, children }) => {
  return (
    <Container>
      {step !== undefined && (
        <Label>
          <span>{step}.</span>
        </Label>
      )}
      <InstructionStepText>{children}</InstructionStepText>
    </Container>
  );
};

const Container = styled(Row)`
  gap: 0.75rem;
  border-radius: 12px;
  color: ${colors.darkText};
  line-height: 1.35;
  padding: 0rem 0.5rem;
`;

const Label = styled(CenterAllDiv)`
  border-radius: 4px;
  width: 12px;
  height: 12px;
  font-size: 15px;
`;

const InstructionStepText = styled.span`
  font-size: 15px;
`;