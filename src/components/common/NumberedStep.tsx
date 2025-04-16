import styled from "styled-components";

export const NumberedStep: React.FC<{
  step?: number;
  children: React.ReactNode;
}> = ({ step, children }) => {
  return (
    <Container>
      {step !== undefined && (
        <Label>
          <span>{step}</span>
        </Label>
      )}
      <NumberedStepText>{children}</NumberedStepText>
    </Container>
  );
};

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const CenterAllDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Header = styled.h2`
  font-weight: 600;
  color: #fff;
  font-size: 2.25rem;
  line-height: 2.5rem;
  letter-spacing: -0.02em;
  margin-top: 0;
`;

const SubHeader = styled(Header)`
  font-size: 1.7em;
  color: rgba(255, 255, 255, 0.9);
`;

const Container = styled(Row)`
  background: rgba(255, 255, 255, 0.05);
  gap: 1rem;
  border-radius: 12px;
  padding: 12px 16px;
  color: #fff;
  line-height: 1.4;
  font-size: 15px;
`;

const Label = styled(CenterAllDiv)`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  width: 24px;
  height: 24px;
  min-width: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const NumberedStepText = styled.span`
  margin: 4px;
`;
