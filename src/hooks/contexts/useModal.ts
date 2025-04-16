import { useContext } from 'react';

import { ModalSettingsContext } from '../../contexts/ModalSettings';


const useModal = () => {
  return { ...useContext(ModalSettingsContext) };
};

export default useModal;
