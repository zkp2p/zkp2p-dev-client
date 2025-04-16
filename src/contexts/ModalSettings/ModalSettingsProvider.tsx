import React, { useCallback, useEffect, useState, ReactNode } from 'react'
import { isMobile } from 'react-device-detect';

import { MODALS } from '@helpers/types';

import ModalSettingsContext from './ModalSettingsContext'


interface ProvidersProps {
  children: ReactNode;
}

const ModalSettingsProvider = ({ children }: ProvidersProps) => {


  /*
   * State
   */

  const [currentModal, setCurrentModal] = useState<string | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    if (isMobile) {
      setCurrentModal(MODALS.NOT_SUPPORTED_PLATFORM_DEVICE);
    } else {
      setCurrentModal(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);
  
  /*
   * Handlers
   */

  const openModal = useCallback((modalId: string) => {
    setCurrentModal(modalId);
  }, []);

  const closeModal = useCallback(() => {
    setCurrentModal(null);
  }, []);

  return (
    <ModalSettingsContext.Provider
      value={{
        currentModal,
        openModal,
        closeModal
      }}
    >
      {children}
    </ModalSettingsContext.Provider>
  );
};

export default ModalSettingsProvider;
