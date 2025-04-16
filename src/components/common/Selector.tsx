// import React, { useReducer, useRef } from 'react';
// import styled from 'styled-components';
// import { ChevronDown, X } from 'react-feather';
// import { Overlay } from '@components/modals/Overlay';
// import { useOnClickOutside } from '@hooks/useOnClickOutside';
// import { Z_INDEX } from '@theme/zIndex';
// import { colors } from '@theme/colors';

// interface SelectorProps<T> {
//   label: string;
//   selectedItem: T;
//   items: T[];
//   onSelect: (item: T) => void;
//   renderItem: (item: T) => React.ReactNode;
//   getItemLabel: (item: T) => string;
//   disabled?: boolean;
// }

// export const Selector = <T,>({
//   label,
//   selectedItem,
//   items,
//   onSelect,
//   renderItem,
//   getItemLabel,
//   disabled = false,
// }: SelectorProps<T>) => {
//   const [isOpen, toggleOpen] = useReducer((s) => !s, false);

//   const ref = useRef<HTMLDivElement>(null);
//   useOnClickOutside(ref, isOpen ? toggleOpen : undefined);

//   const handleOverlayClick = () => {
//     toggleOpen();
//   };

//   const handleItemClick = (item: T) => {
//     onSelect(item);
//     toggleOpen();
//   };

//   return (
//     <Wrapper ref={ref}>
//       <SelectorButton onClick={toggleOpen} disabled={disabled}>
//         <Label>{label}</Label>
//         <SelectedItem>{getItemLabel(selectedItem)}</SelectedItem>
//         <StyledChevronDown />
//       </SelectorButton>

//       {isOpen && (
//         <ModalContainer>
//           <Overlay onClick={handleOverlayClick} />
//           <Modal>
//             <ModalHeader>
//               <ModalTitle>Select {label}</ModalTitle>
//               <CloseButton onClick={handleOverlayClick}>
//                 <X />
//               </CloseButton>
//             </ModalHeader>
//             <ModalContent>
//               {items.map((item, index) => (
//                 <Item key={index} onClick={() => handleItemClick(item)}>
//                   {renderItem(item)}
//                 </Item>
//               ))}
//             </ModalContent>
//           </Modal>
//         </ModalContainer>
//       )}
//     </Wrapper>
//   );
// };

// const Wrapper = styled.div`
//   position: relative;
//   display: flex;
// `;

// const SelectorButton = styled.button<{ disabled: boolean }>`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 8px 12px;
//   border: 1px solid ${colors.selectorColor};
//   border-radius: 8px;
//   background-color: ${colors.defaultInputColor};
//   color: #fff;
//   cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

//   &:hover {
//     background-color: ${({ disabled }) => !disabled && colors.selectorHover};
//   }
// `;

// const Label = styled.div`
//   font-size: 14px;
//   color: #aaa;
// `;

// const SelectedItem = styled.div`
//   font-size: 16px;
//   font-weight: bold;
// `;

// const StyledChevronDown = styled(ChevronDown)`
//   width: 20px;
//   height: 20px;
// `;

// const ModalContainer = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   z-index: ${Z_INDEX.overlay};
//   width: 100vw;
//   height: 100vh;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const Modal = styled.div`
//   background: ${colors.container};
//   border: 1px solid ${colors.defaultBorderColor};
//   border-radius: 8px;
//   width: 400px;
//   max-height: 80vh;
//   overflow-y: auto;
//   z-index: ${Z_INDEX.modal};
// `;

// const ModalHeader = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 16px;
//   border-bottom: 1px solid ${colors.defaultBorderColor};
// `;

// const ModalTitle = styled.div`
//   font-size: 18px;
//   font-weight: bold;
// `;

// const CloseButton = styled.button`
//   background: none;
//   border: none;
//   color: #fff;
//   cursor: pointer;
// `;

// const ModalContent = styled.div`
//   padding: 16px;
// `;

// const Item = styled.div`
//   padding: 12px;
//   border-bottom: 1px solid ${colors.defaultBorderColor};
//   cursor: pointer;

//   &:hover {
//     background-color: ${colors.selectorHover};
//   }
// `;
