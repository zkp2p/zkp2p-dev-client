import { Link, useLocation } from "react-router-dom";
import React from 'react';
import styled, { css } from 'styled-components';
import { Repeat, Send, DollarSign, Download } from 'react-feather';

import { MenuDropdown } from "@components/layouts/MenuDropdown";
import useMediaQuery from "@hooks/useMediaQuery";


interface NavItemProps {
  vertical?: boolean;
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  indicatorPosition?: 'top' | 'bottom';
}

export const NavItem: React.FC<NavItemProps> = ({ 
  vertical = false,
  selectedItem,
  setSelectedItem,
  indicatorPosition = 'bottom'
}) => {
  const currentDeviceSize = useMediaQuery();
  const location = useLocation();
  const searchParams = location.search;

  const isMobile = currentDeviceSize === 'mobile';

  const navigationItems = [
    {
      name: 'Buy',
      routeName: 'swap',
      href: '/swap',
      icon: Repeat,
    },
    // {
    //   name: 'Send',
    //   routeName: 'send',
    //   href: '/send',
    //   icon: Send,
    // },
    {
      name: 'Sell',
      routeName: 'pool',
      href: '/pool',
      icon: Download,
    },
    {
      name: 'Liquidity',
      routeName: 'liquidity',
      href: '/liquidity',
      icon: DollarSign,
    },
  ];

  return (
    <HeaderLinksBox vertical={vertical} isMobile={isMobile}>
      {navigationItems.map((item) => (
        <StyledLink
          isMobile={isMobile}
          key={item.name}
          to={item.href + searchParams}
          onClick={() => setSelectedItem(item.name)}
          selected={selectedItem === item.routeName}
          indicatorPosition={indicatorPosition}
        >
          {isMobile ? (
            <item.icon size={20} />
          ) : (
            item.name
          )}
        </StyledLink>
      ))}

      <MenuDropdown />
    </HeaderLinksBox>
  );
};

const HeaderLinksBox = styled.div<{ vertical?: boolean, isMobile?: boolean }>`
  display: flex;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  gap: 5px;
  flex-direction: ${props => props.vertical ? 'column' : 'row'};

  ${props => props.isMobile ? `
    width: 100%;
    justify-content: space-around;
    gap: 8px;` : ''
  }
`;

const StyledLink = styled(Link)<{ selected: boolean, isMobile?: boolean, indicatorPosition?: 'top' | 'bottom' }>`
  position: relative;
  display: inline-flex;
  margin-right: 24px;
  margin-bottom: 4px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;

  &:last-child {
    margin-right: 0;
  }

  ${props => props.isMobile ? `
    margin-right: 0;
    flex: 1;
    justify-content: center;
    min-width: 48px;` : ''
  }

  ${props => props.selected && css`
    &::after {
      content: '';
      position: absolute;
      width: 32px;
      height: 4px;
      background: white;
      ${props.indicatorPosition === 'top' 
        ? 'top: -14px;'
        : 'bottom: -8px;'
      }
      left: calc(50% - 16px);
      border-radius: 8px;
    }
  `}

  @media (max-width: 425px) {
    &.nav-item-sub {
      position: relative;
      display: inline-flex;
      line-height: 24px;
      margin-bottom: 12px;
      padding-bottom: 16px;

      ${props => props.selected && css`
        &::after {
          content: '';
          position: absolute;
          width: 40px;
          height: 6px;
          background: white;
          ${props.indicatorPosition === 'top'
            ? 'bottom: 0px;'
            : 'top: 0px;'
          }
          left: calc(50% - 20px);
          border-radius: 11px;
        }
      `}
    }
  }
`;
