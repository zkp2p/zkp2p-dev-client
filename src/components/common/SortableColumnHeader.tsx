import styled from 'styled-components';
import QuestionHelper from '@components/common/QuestionHelper';
import { ArrowUp, ArrowDown } from 'react-feather';

const SortableColumnHeader: React.FC<{
  column: string;
  currentSortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  tooltip?: React.ReactNode;
  children: React.ReactNode;
}> = ({ 
  column, 
  currentSortColumn, 
  sortDirection, 
  onSort, 
  tooltip, 
  children 
}) => {
  return (
    <ColumnHeaderSortable 
      onClick={() => onSort(column)}
      active={currentSortColumn === column}
      direction={sortDirection}
    >
      <span>{children}</span>
      {tooltip && (
        <QuestionHelper 
          text={tooltip} 
          size="sm" 
        />
      )}
      {currentSortColumn === column && (
        sortDirection === 'asc' 
          ? <ArrowUp size={16} /> 
          : <ArrowDown size={16} />
      )}
    </ColumnHeaderSortable>
  );
};

const ColumnHeaderSortable = styled.div<{ active: boolean; direction: 'asc' | 'desc' }>`
  text-align: left;
  font-size: 14px;
  opacity: 0.7;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  
  &:hover {
    opacity: 1;
  }
  
  @media (max-width: 600px) {
    font-size: 13px;
  };
`;

export default SortableColumnHeader;