import React from 'react';
import styled from 'styled-components/macro';
import { colors, opacify } from '@theme/colors';

interface SkeletonProps {
  width: string;
  height?: string;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height = '16px', borderRadius = '4px' }) => {
  return <SkeletonElement width={width} height={height} borderRadius={borderRadius} />;
};

const SkeletonElement = styled.div<SkeletonProps>`
  width: ${props => props.width};
  height: ${props => props.height};
  background: linear-gradient(90deg, ${colors.defaultBorderColor} 25%, ${opacify(0.5, colors.defaultInputColor)} 50%, ${colors.defaultBorderColor} 75%);
  background-size: 200% 100%;
  border-radius: ${props => props.borderRadius};
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`; 