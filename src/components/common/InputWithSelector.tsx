// import React, { ChangeEvent } from 'react';
// import styled from 'styled-components';
// import { Selector } from './Selector'; // Import the generalized Selector

// interface InputProps<T> {
//   label: string;
//   name: string;
//   value?: string;
//   onChange: (event: ChangeEvent<HTMLInputElement>) => void;
//   placeholder?: string;
//   selectorLabel: string;
//   selectedItem: T;
//   items: T[];
//   onSelect: (item: T) => void;
//   renderItem: (item: T) => React.ReactNode;
//   getItemLabel: (item: T) => string;
// }

// export const InputWithSelector = <T,>({
//   label,
//   name,
//   value,
//   onChange,
//   placeholder,
//   selectorLabel,
//   selectedItem,
//   items,
//   onSelect,
//   renderItem,
//   getItemLabel,
// }: InputProps<T>) => {
//   return (
//     <Container>
//       <Label>{label}</Label>
//       <InputWrapper>
//         <StyledInput
//           type="text"
//           name={name}
//           value={value}
//           onChange={onChange}
//           placeholder={placeholder}
//         />
//         <Selector
//           label={selectorLabel}
//           selectedItem={selectedItem}
//           items={items}
//           onSelect={onSelect}
//           renderItem={renderItem}
//           getItemLabel={getItemLabel}
//         />
//       </InputWrapper>
//     </Container>
//   );
// };

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 8px;
// `;

// const Label = styled.label`
//   font-size: 14px;
//   color: #aaa;
// `;

// const InputWrapper = styled.div`
//   display: flex;
//   gap: 8px;
// `;

// const StyledInput = styled.input`
//   flex: 1;
//   padding: 8px;
//   border: 1px solid #aaa;
//   border-radius: 4px;
//   font-size: 16px;
//   color: #fff;
//   background-color: #131a2a;

//   &:focus {
//     outline: none;
//     border-color: #555;
//   }
// `;
