import React, { useEffect } from 'react';
import styled from 'styled-components';

import { colors } from '@theme/colors';
import { Z_INDEX } from '@theme/zIndex';


interface OverlayProps {
  onClick?: () => void
}

export const Overlay: React.FC<OverlayProps> = ({
  onClick 
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  /*
   * Hooks
   */

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  /*
   * Component
   */

  return (
    <OverlayContainer
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : 'presentation'}
      tabIndex={onClick ? 0 : -1}
      aria-label={onClick ? 'Close' : undefined}
    />
  );
};

const OverlayContainer = styled.div`
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  position: fixed;
  display: block;
  background-color: ${colors.container};
  opacity: 0.75;
  overflow: hidden;
  z-index: ${Z_INDEX.overlay};
`;
