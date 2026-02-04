import React from 'react';
import { Link } from "react-router-dom";
import styled from "styled-components";

import useMediaQuery from "@hooks/useMediaQuery";
import useQuery from '@hooks/useQuery';
import {
  peer,
  fontFamilies,
  fontWeights,
  fontSizes,
  letterSpacing,
  lineHeights,
  radii,
  opacify,
} from '@theme/colors';


export const TopNav: React.FC<{ withoutLinks?: boolean }> = ({ withoutLinks }) => {
  /*
   * Context
   */

  const currentDeviceSize = useMediaQuery();
  const { navigateWithQuery } = useQuery();
  const logoSrc = `${process.env.PUBLIC_URL || ''}/peer-logo.svg`;

  /*
   * Component
   */

  if (currentDeviceSize === 'mobile') {
    return (
      <NavBar>
        {withoutLinks ? (
          <NavBarCentered>
            <LogoContainer>
              <Logo 
                size={48} 
                to="/" 
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithQuery('/');
                }}
              >
                <img
                  src={logoSrc}
                  alt="Peer logo"
                />
              </Logo>
              <DevBadge>Developer</DevBadge>
            </LogoContainer>
          </NavBarCentered>
        ) : (
          <LogoAndNavItems>
            <LogoContainer>
              <Logo 
                to="/" 
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithQuery('/');
                }}
              >
                <img
                  src={logoSrc}
                  alt="Peer logo"
                />
              </Logo>
              <DevBadge>Developer</DevBadge>
            </LogoContainer>
          </LogoAndNavItems>
        )}
      </NavBar>
    );
  } else {
    return (
      <NavBar>
        {withoutLinks ? (
          <NavBarCentered>
            <LogoContainer>
              <Logo 
                size={48} 
                to="/" 
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithQuery('/');
                }}
              >
                <img
                  src={logoSrc}
                  alt="Peer logo"
                />
              </Logo>
              <DevBadge>Developer</DevBadge>
            </LogoContainer>
          </NavBarCentered>
        ) : (
          <LogoAndNavItems>
            <LogoContainer>
              <Logo 
                to="/" 
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithQuery('/');
                }}
              >
                <img
                  src={logoSrc}
                  alt="Peer logo"
                />
              </Logo>
              <DevBadge>Developer</DevBadge>
            </LogoContainer>
          </LogoAndNavItems>
        )}
      </NavBar>
    );
  }
};

const NavBarCentered = styled.div`
  display: flex;
  width: 100vw;
  align-items: center;
  justify-content: center;
`;

const NavBar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.75rem 1.75rem 1.5rem; 

  @media (min-width: 600px) {
    padding: 28px;
  }

  @media (max-width: 1024px) {
    padding: 1.5rem 1rem 1.75rem 1rem;
  }
`;

const Logo = styled(Link)<{ size?: number }>`
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.wide};
  color: ${peer.textPrimary};
  text-decoration: none;
  font-size: 1.2rem;
  font-family: ${fontFamilies.body};

  img {
    height: ${({ size }) => size || 32}px;
    width: auto;
    max-width: none;
    object-fit: contain;
    display: block;
  }
`;

const LogoAndNavItems = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const LogoContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const DevBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  padding: 3px 8px;
  min-height: 22px;
  border-radius: ${radii.xs}px;
  background: ${opacify(5, peer.white)};
  border: 1px solid ${opacify(12, peer.white)};
  color: ${peer.textSecondary};
  font-size: ${fontSizes.caption}px;
  font-family: ${fontFamilies.body};
  font-weight: ${fontWeights.semibold};
  letter-spacing: ${letterSpacing.wide};
  line-height: ${lineHeights.single};
  text-transform: uppercase;
  position: relative;
  top: -2px;
`;
