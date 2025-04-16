import React, { useState, useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components/macro';
import { Sidebar, AlertTriangle } from 'react-feather';
import Link from '@mui/material/Link';
import { colors } from '@theme/colors';
import { browserName } from 'react-device-detect';

import { ThemedText } from '@theme/text';
import { Button } from '@components/common/Button';
import { AccessoryButton } from '@components/common/AccessoryButton';
import { EXTENSION_DOCS_URL } from '@helpers/docUrls';
import { commonStrings } from '@helpers/strings';
import { ConsentInstructions } from '@components/Home/ConsentInstructions';
import { getRandomFunnyRestrictionsMessage } from '@helpers/funnyMessages';

import chromeSvg from '../../../assets/images/browsers/chrome.svg';
import braveSvg from '../../../assets/images/browsers/brave.svg';
import useExtensionProxyProofs from '@hooks/contexts/useExtensionProxyProofs';

const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/zkp2p-extension/ijpgccednehjpeclfcllnjjcmiohdjih';
const NOTARY_PROOF_FETCH_INTERVAL = 5000;


interface InstallExtensionProps {
  paymentPlatform: string;
}

export const InstallExtension: React.FC<InstallExtensionProps> = ({ 
  paymentPlatform
}) => {

  InstallExtension.displayName = "InstallExtension";
  /*
   * Context
   */

  const {
    isSidebarInstalled,
    sideBarVersion,
    refetchExtensionVersion,
  } = useExtensionProxyProofs();

  /*
   * State
   */

  const [isNotSupportedBrowser, setIsNotSupportedBrowser] = useState<boolean>(false);
  const [isInstallExtensionClicked, setIsInstallExtensionClicked] = useState<boolean>(false);
  const [extensionVersionFetchIntervalId, setExtensionVersionFetchIntervalId] = useState<NodeJS.Timeout | null>(null);

  /*
   * Effects
   */

  useEffect(() => {
    const supportedBrowsers = ['Chrome', 'Brave'];
    setIsNotSupportedBrowser(supportedBrowsers.indexOf(browserName) === -1);

    // Moot to run this on an interval because the content script needs to be injected
    refetchExtensionVersion();
  }, []);


  useEffect(() => {
    if (!isInstallExtensionClicked) {
      return;
    }

    const setupInterval = (callback: () => void) => {
      callback();

      if (extensionVersionFetchIntervalId) {
        clearInterval(extensionVersionFetchIntervalId);
      }
      
      const newIntervalId = setInterval(callback, NOTARY_PROOF_FETCH_INTERVAL);
      setExtensionVersionFetchIntervalId(newIntervalId);
    };

    if (!isSidebarInstalled) {
      setupInterval(refetchExtensionVersion);
    }

    return () => {
      if (extensionVersionFetchIntervalId) {
        clearInterval(extensionVersionFetchIntervalId);
      }
    };
  }, [isInstallExtensionClicked, isSidebarInstalled]);


  /*
   * Handlers
   */

  const handleJoinTelegramClicked = () => {
    window.open('https://t.me/+XDj9FNnW-xs5ODNl', '_blank');
  };


  const handleInstallExtensionClicked = () => {
    window.open(CHROME_EXTENSION_URL, '_blank');
    setIsInstallExtensionClicked(true);
  };

  const browserSvg = () => {
    switch (browserName) {
      case 'Brave':
        return braveSvg;
      case 'Chrome':
      default:
        return chromeSvg;
    }
  };

  const addToBrowserCopy = () => {
    switch (browserName) {
      case 'Brave':
        return 'Add to Brave';
      case 'Chrome':
        return 'Add to Chrome';
      default:
        return 'Add to browser';
    }
  };

  const getConsentInstructions = () => {
    return [
      'Preserve privacy while porting data from various platforms for use in ZKP2P',
      'Ask for explicit permission to port data before facilitating it',
      'Allow you to generate ZK proofs for your payments'
    ];
  }

  const funnyRestrictionMessage = useMemo(() => getRandomFunnyRestrictionsMessage(), []);
  const getRestrictions = () => {
    return [
      'Make payments on your behalf',
      funnyRestrictionMessage
    ];
  }


  /*
   * Render
   */

  return (
    isNotSupportedBrowser ? (
      <UnsupportedBrowserContainer>
        <IconAndCopyContainer>
          <StyledAlertTriangle />

          <ThemedText.DeprecatedBody textAlign="center">
            <div>
              { commonStrings.get('BROWSER_NOT_SUPPORTED_INSTRUCTIONS') }
              <Link
                href={EXTENSION_DOCS_URL}
                target="_blank"
              >
                Learn More ↗
              </Link>
            </div>
          </ThemedText.DeprecatedBody>
        </IconAndCopyContainer>

        <Button
          onClick={handleJoinTelegramClicked}
          width={216}
        >
          Join our Telegram
        </Button>

      </UnsupportedBrowserContainer>
    ) : (
      <InstallExtensionContainer>
        <ConsentInstructions
          instructionsTitle="This will allow PeerAuth Extension to:"
          instructions={getConsentInstructions()}
          restrictionsTitle="This will NOT allow PeerAuth Extension to:"
          restrictions={getRestrictions()}
          showExtensionTos={true}
        />

        <ButtonContainer>
          <Button
            onClick={handleInstallExtensionClicked}
            height={48}
            width={216}
            leftAccessorySvg={browserSvg()}
            loading={isInstallExtensionClicked}
            disabled={isInstallExtensionClicked}
          >
            { addToBrowserCopy() }
          </Button>
          
        </ButtonContainer>

        { isInstallExtensionClicked && (
          <ThemedText.LabelSmall textAlign="left">
            Waiting for installation. Try refreshing page.
          </ThemedText.LabelSmall>
        )}
      </InstallExtensionContainer>
    )
  )
}

const UnsupportedBrowserContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  min-height: 25vh;
  line-height: 1.3;
  gap: 36px;
`;

const StyledAlertTriangle = styled(AlertTriangle)`
  color: #FFF;
  width: 48px;
  height: 48px;
`;


const InstallExtensionContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 25vh;
  line-height: 1.3;
  gap: 24px;
`;

const IconAndCopyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
`;

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`;

const SidebarIcon = styled(Sidebar)`
  ${IconStyle}
  transform: rotate(180deg);
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrText = styled(ThemedText.BodyPrimary)`
  text-align: center;
  margin: 0.5rem 0;
`;

const ContinueInBrowserButton = styled.button`
  background: none;
  border: none;
  color: ${colors.buttonHover};
  font-size: 16px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.5rem;

  &:hover {
    opacity: 0.8;
  }
`;

export default InstallExtension;