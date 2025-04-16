import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { NavItem } from '../TopNav/NavItem';
import { Z_INDEX } from '@theme/zIndex';


export const BottomNav: React.FC<{ withoutLinks?: boolean }> = ({ withoutLinks }) => {
  /*
   * State
   */

  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string>('Landing');

  /*
   * Hooks
   */

  useEffect(() => {
    const routeName = location.pathname.split('/')[1];
    setSelectedItem(routeName || 'Landing');
  }, [location]);

  return (
    <Wrapper>
      <NavItemWrapper>
        <NavItem selectedItem={selectedItem} setSelectedItem={setSelectedItem} indicatorPosition="top" />
      </NavItemWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  z-index: ${Z_INDEX.bottom_nav};
  position: fixed;
  bottom: 0;
`;

const NavItemWrapper = styled.div`
  background: #0D111C;
  border-top: 1px solid #98a1c03d;
  padding: 16px 24px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;