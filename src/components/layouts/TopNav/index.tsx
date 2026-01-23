import React from 'react';
import { Link } from "react-router-dom";
import styled from "styled-components";

import useMediaQuery from "@hooks/useMediaQuery";
import useQuery from '@hooks/useQuery';
import { colors } from '@theme/colors';


export const TopNav: React.FC<{ withoutLinks?: boolean }> = ({ withoutLinks }) => {
  /*
   * Context
   */

  const currentDeviceSize = useMediaQuery();
  const { navigateWithQuery } = useQuery();

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
                <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="logo" />
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
                <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="logo" />
              </Logo>
              <DevBadge>Developer</DevBadge>
            </LogoContainer>
            <NavLinks>
              <NavLink
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithQuery('/');
                }}
              >
                Home
              </NavLink>
              <NavLink
                to="/build-provider"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithQuery('/build-provider');
                }}
              >
                Build Provider
              </NavLink>
            </NavLinks>
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
                <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="logo" />
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
                <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="logo" />
              </Logo>
              <DevBadge>Developer</DevBadge>
            </LogoContainer>
            <NavLinks>
              <NavLink
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithQuery('/');
                }}
              >
                Home
              </NavLink>
              <NavLink
                to="/build-provider"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithQuery('/build-provider');
                }}
              >
                Build Provider
              </NavLink>
            </NavLinks>
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
  letter-spacing: 0.04em;
  color: #ffffff;
  text-decoration: none;
  font-size: 1.2rem;

  img {
    width: ${({ size }) => size || 32}px;
    height: ${({ size }) => size || 32}px;
    object-fit: cover;
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
  color: white;
  border: 1px solid ${colors.white};
  font-size: 0.8rem;
  font-weight: bold;
  padding: 8px;
  border-radius: 12px;
  margin-left: 8px;
  position: relative;
  top: -2px;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-left: 2rem;

  @media (max-width: 600px) {
    gap: 1rem;
    margin-left: 1rem;
  }
`;

const NavLink = styled(Link)`
  color: ${colors.grayText};
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: ${colors.white};
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: ${colors.white};
  }
`;