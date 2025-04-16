import React from 'react';
import styled from 'styled-components';
import { Check } from 'react-feather';
import { colors } from '@theme/colors';

interface ConsentInstructionRowProps {
  text: string;
  isFirstRow?: boolean;
  isLastRow?: boolean;
  icon?: React.ReactNode;
}

export const ConsentInstructionRow: React.FC<ConsentInstructionRowProps> = ({
  text,
  isFirstRow = false,
  isLastRow = false,
  icon = <StyledCheck />,
}) => {
  return (
    <RowContainer isFirstRow={isFirstRow} isLastRow={isLastRow}>
      <IconContainer>
        {icon}
      </IconContainer>
      <TextContainer>
        {text}
      </TextContainer>
    </RowContainer>
  );
};

const RowContainer = styled.div<{ isFirstRow: boolean; isLastRow: boolean }>`
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  
  border-top-left-radius: ${({ isFirstRow }) => isFirstRow ? '8px' : '0'};
  border-top-right-radius: ${({ isFirstRow }) => isFirstRow ? '8px' : '0'};
  border-bottom-left-radius: ${({ isLastRow }) => isLastRow ? '8px' : '0'};
  border-bottom-right-radius: ${({ isLastRow }) => isLastRow ? '8px' : '0'};
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledCheck = styled(Check)`
  width: 20px;
  height: 20px;
  color: ${colors.connectionStatusGreen};
`;

const TextContainer = styled.div`
  font-size: 14px;
  color: ${colors.darkText};
`;