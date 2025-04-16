import { useContext } from 'react';

import { ExtensionProxyProofsContext } from '../../contexts/ExtensionProxyProofs';

const useExtensionProxyProofs = () => {
  return { ...useContext(ExtensionProxyProofsContext) };
};

export default useExtensionProxyProofs;