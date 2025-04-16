import React from 'react';
import Checkbox, { CheckboxProps } from "@mui/joy/Checkbox";


interface CustomCheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  color?: CheckboxProps['color'];
  boxVariant?: CheckboxProps['variant'];
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  color = "primary",
  boxVariant = "plain",
}) => {
  return (
    <Checkbox
      size="md"
      color={color}
      variant={boxVariant}
      checked={checked}
      onChange={onChange}
    />
  );
};
