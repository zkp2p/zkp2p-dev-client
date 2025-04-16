import React from "react";
import styled, { css } from 'styled-components/macro';

import { colors } from '@theme/colors';
import useMediaQuery from "@hooks/useMediaQuery";


interface PaymentRowProps {
  subjectText: string;
  dateText: string;
  isSelected: boolean;
  onRowClick: () => void;
  isLastRow: boolean;
  isScrolling: boolean;
  isFirstRow: boolean;
}

export const PaymentRow: React.FC<PaymentRowProps> = ({
  subjectText,
  dateText,
  isSelected,
  isLastRow,
  onRowClick,
  isScrolling,
  isFirstRow,
}: PaymentRowProps) => {
  const isMobile = useMediaQuery() === 'mobile';

  PaymentRow.displayName = "PaymentRow";

  const subjectLabel = `${subjectText}`;
  const dateLabel = `${dateText}`;

  return (
    <Container
      onClick={onRowClick}
      selected={isSelected}
      isMobile={isMobile}
      $scrolling={isScrolling}
      isLastRow={isLastRow}
      isFirstRow={isFirstRow}
    >

      <SubjectLabel> {subjectLabel} </SubjectLabel>

      <DateLabel> {dateLabel} </DateLabel>
    </Container>
  );
};

const Container = styled.div<{ selected: boolean; isMobile: boolean, $scrolling: boolean, isLastRow: boolean, isFirstRow: boolean }>`
  display: grid;
  grid-template-columns: ${({ isMobile }) => isMobile ? '7fr 1.25fr' : '4fr 1fr'};
  grid-gap: 1px;
  padding: 0.99rem 1.49rem;
  font-size: 14px;
  color: ${colors.darkText};
  border-radius: ${({ isFirstRow, isLastRow }) => {
    if (isFirstRow && isLastRow) return "8px";
    if (isFirstRow) return "8px 8px 0 0";
    if (isLastRow) return "0 0 8px 8px";
    return "0";
  }};
  border-bottom: ${({ isLastRow }) => !isLastRow && `1px solid ${colors.defaultBorderColor}`};

  ${({ selected }) => selected && `
    background-color: ${colors.rowSelectorColor};
    box-shadow: none;
  `}

  ${({ selected }) => !selected && `
    &:hover {
      background-color: ${colors.rowSelectorHover};
      box-shadow: none;
    }
  `}

  ${({ $scrolling }) => $scrolling && css`
    padding-right: 2.29rem;
    transition: padding-right 0.3s ease;
  `}

  ${({ $scrolling }) => !$scrolling && css`
    padding-right: 1.49rem;
    transition: padding-right 0.3s ease;
  `}

  cursor: pointer;    // For container
  * {
    cursor: pointer;  // For children
  }
`;


const SubjectLabel = styled.label`
  text-align: left;
`;

const DateLabel = styled.label`
  text-align: right;
`;