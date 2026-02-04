import { useRef, useReducer } from 'react';
import { MoreHorizontal } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';
import styled from "styled-components";

import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { CLIENT_VERSION } from '@helpers/constants';
import {
  peer,
  radii,
  fontFamilies,
  fontWeights,
  fontSizes,
  letterSpacing,
  lineHeights,
} from '@theme/colors';
import useMediaQuery from "@hooks/useMediaQuery";


export const MenuDropdown = () => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)
  const dropdownId = 'menu-dropdown';

  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation();
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)
  const currentDeviceSize = useMediaQuery();
  const isMobile = currentDeviceSize === 'mobile';

  /*
   * Handler
   */

  const jumpToMedia = (url: string) => {
    window.open(url, '_blank');
  };

  /*
   * Component
   */

  return (
    <Wrapper isMobile={isMobile} ref={ref}>
      <NavButton
        type="button"
        onClick={toggleOpen}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
      >
        <StyledMoreHorizontal />
      </NavButton>

      {isOpen && (
        <NavDropdown id={dropdownId} role="menu" isMobile={isMobile}>
          <NavDropdownItemContainer>
            <NavDropdownItem as={Link} to={"/tos" + location.search} onClick={toggleOpen}>
              <DropdownText>Terms of Service</DropdownText>
            </NavDropdownItem>

            <NavDropdownItem as={Link} to={"/pp" + location.search} onClick={toggleOpen}>
              <DropdownText>Privacy Policy</DropdownText>
            </NavDropdownItem>
          </NavDropdownItemContainer>

          <NavDropdownItem
            href="https://dune.com/zkp2p/zkp2p"
            target="_blank"
            rel="noopener noreferrer">
              <DropdownText>Analytics ↗</DropdownText>
          </NavDropdownItem>

          <NavDropdownItem
            href="https://docs.zkp2p.xyz/"
            target="_blank"
            rel="noopener noreferrer">
              <DropdownText>Documentation ↗</DropdownText>
          </NavDropdownItem>
          
          <NavDropdownItem
            href="https://chromewebstore.google.com/detail/zkp2p-extension/ijpgccednehjpeclfcllnjjcmiohdjih"
            target="_blank"
            rel="noopener noreferrer">
              <DropdownText>Browser Extension ↗</DropdownText>
          </NavDropdownItem>

          <NavDropdownItem
            href="https://v1.zkp2p.xyz/"
            target="_blank"
            rel="noopener noreferrer">
              <DropdownText>ZKP2P V1 ↗</DropdownText>
          </NavDropdownItem>

          <IconRow>
            <IconButton
              type="button"
              onClick={() => jumpToMedia('https://x.com/zkp2p')}
              aria-label="ZKP2P on X"
            >
              <Icon icon={'twitter'} />
            </IconButton>

            <IconButton
              type="button"
              onClick={() => jumpToMedia('https://github.com/zkp2p')}
              aria-label="ZKP2P on GitHub"
            >
              <Icon icon={'github'} />
            </IconButton>

            <IconButton
              type="button"
              onClick={() => jumpToMedia('https://t.me/+XDj9FNnW-xs5ODNl')}
              aria-label="ZKP2P on Telegram"
            >
              <Icon icon={'telegram'} />
            </IconButton>

            <VersionLabel>
              v{CLIENT_VERSION}
            </VersionLabel>
          </IconRow>
        </NavDropdown>
      )}
    </Wrapper>
  )
};

const Wrapper = styled.div<{isMobile?: boolean}>`
  display: flex;
  ${({ isMobile }) => isMobile ? '' : 'flex-direction: column'};
  ${({ isMobile }) => isMobile ? '' : 'align-items: flex-start'};
  position: relative;
`;

const StyledMoreHorizontal = styled(MoreHorizontal)`
  color: ${peer.white};
  width: 24px;
  height: 24px;
`;

const NavButton = styled.button.attrs({ type: 'button' })`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  min-width: 44px;
  min-height: 44px;
  padding: 8px;
  background: transparent;
  border: none;
  touch-action: manipulation;

  &:focus-visible {
    outline: 2px solid ${peer.igniteYellow};
    outline-offset: 2px;
    border-radius: ${radii.sm}px;
  }
`;

const NavDropdown = styled.div<{isMobile?: boolean}>`
  display: flex;
  flex-direction: column;
  width: 200px;
  border-radius: ${radii.md}px;
  border: 1px solid transparent;
  padding: 1.5rem;
  background: ${peer.richBlack};
  z-index: 20;
  gap: 0.75rem;
  color: ${peer.textPrimary};

  position: absolute;
  ${({ isMobile }) => isMobile ? `
    bottom: calc(100% + 28px);
    top: auto;
    right: -20px;
  ` : `
    top: calc(100% + 20px);
    right: 0;
  `}
`;

const NavDropdownItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  white-space: nowrap;
`;

const NavDropdownItem = styled.a`
  color: inherit;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`;

const IconRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 0.5rem;
  align-items: center;
`;

const Icon = styled(SVGIconThemed).attrs({ 'aria-hidden': true })`
  width: 20px;
  height: 20px;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
`;

const IconButton = styled.button.attrs({ type: 'button' })`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: ${radii.sm}px;
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover ${Icon} {
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid ${peer.igniteYellow};
    outline-offset: 2px;
  }
`;

const VersionLabel = styled.div`
  font-size: ${fontSizes.caption}px;
  color: ${peer.textSecondary};
  font-family: ${fontFamilies.body};
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.wide};
  line-height: ${lineHeights.single};
  text-align: left;
`;

const DropdownText = styled.span`
  font-size: ${fontSizes.button}px;
  font-weight: ${fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.wide};
  line-height: ${lineHeights.single};
  font-family: ${fontFamilies.body};
`;
