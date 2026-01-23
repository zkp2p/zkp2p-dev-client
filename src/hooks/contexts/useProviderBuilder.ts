import { useContext } from 'react';

import { ProviderBuilderContext } from '../../contexts/ProviderBuilder';

const useProviderBuilder = () => {
  return { ...useContext(ProviderBuilderContext) };
};

export default useProviderBuilder;
