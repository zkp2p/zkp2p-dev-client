import { Link, useLocation } from "react-router-dom";
import React from 'react';
import styled, { css } from 'styled-components';
import { Repeat, DollarSign, Download } from 'react-feather';

import { MenuDropdown } from "@components/layouts/MenuDropdown";
import useMediaQuery from "@hooks/useMediaQuery";
import {
  peer,
  gradients,
  fontFamilies,
  fontWeights,
  fontSizes,
  letterSpacing,
  lineHeights,
  radii,
} from "@theme/colors";


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
          aria-label={isMobile ? item.name : undefined}
        >
          {isMobile ? (
            <item.icon size={20} aria-hidden="true" focusable="false" />
          ) : (
            item.name
          )}
        </StyledLink>
      ))}

      <MenuDropdown />
    </HeaderLinksBox>
  );
};

const HeaderLinksBox = styled.div.withConfig({
  shouldForwardProp: (prop) => !["vertical", "isMobile"].includes(prop),
})<{ vertical?: boolean; isMobile?: boolean }>`
  display: flex;
  font-weight: ${fontWeights.semibold};
  font-size: ${fontSizes.button}px;
  line-height: ${lineHeights.single};
  font-family: ${fontFamilies.body};
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.wide};
  color: ${peer.textPrimary};
  gap: 5px;
  flex-direction: ${props => props.vertical ? 'column' : 'row'};

  ${props => props.isMobile ? `
    width: 100%;
    justify-content: space-around;
    gap: 8px;` : ''
  }
`;

const StyledLink = styled(Link).withConfig({
  shouldForwardProp: (prop) =>
    !['selected', 'isMobile', 'indicatorPosition'].includes(prop),
})<{ selected: boolean; isMobile?: boolean; indicatorPosition?: 'top' | 'bottom' }>`
  position: relative;
  display: inline-flex;
  margin-right: 24px;
  margin-bottom: 4px;
  text-decoration: none;
  color: ${peer.textPrimary};
  cursor: pointer;
  transition: opacity 0.2s ease;
  touch-action: manipulation;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    opacity: 0.7;
  }

  &:focus-visible {
    outline: 2px solid ${peer.igniteYellow};
    outline-offset: 2px;
    border-radius: ${radii.sm}px;
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
      height: 3px;
      background: ${gradients.ignite};
      ${props.indicatorPosition === 'top' 
        ? 'top: -14px;'
        : 'bottom: -8px;'
      }
      left: calc(50% - 16px);
      border-radius: ${radii.xs}px;
    }
  `}

  @media (max-width: 425px) {
    &.nav-item-sub {
      position: relative;
      display: inline-flex;
      line-height: ${lineHeights.single};
      margin-bottom: 12px;
      padding-bottom: 16px;

      ${props => props.selected && css`
        &::after {
          content: '';
          position: absolute;
          width: 40px;
          height: 4px;
          background: ${gradients.ignite};
          ${props.indicatorPosition === 'top'
            ? 'bottom: 0px;'
            : 'top: 0px;'
          }
          left: calc(50% - 20px);
          border-radius: ${radii.xs}px;
        }
      `}
    }
  }
`;
