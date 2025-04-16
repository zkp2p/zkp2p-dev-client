/**
 * Add opacity information to a hex color
 * @param amount opacity value from 0 to 100
 * @param hexColor
 */
export function opacify(amount: number, hexColor: string): string {
  if (!hexColor.startsWith('#')) {
    return hexColor;
  };

  if (hexColor.length !== 7) {
    throw new Error(`opacify: provided color ${hexColor} was not in hexadecimal format (e.g. #000000)`);
  };

  if (amount < 0 || amount > 100) {
    throw new Error('opacify: provided amount should be between 0 and 100');
  };

  const opacityHex = Math.round((amount / 100) * 255).toString(16);
  const opacifySuffix = opacityHex.length < 2 ? `0${opacityHex}` : opacityHex;

  return `${hexColor.slice(0, 7)}${opacifySuffix}`;
};

export const colors = {
  linkBlue: '#0066CC',
  
  darkText: '#FFFFFF',
  grayText: '#6C757D',
  lightGrayText: '#9CA3AA',

  white: '#FFFFFF',
  black: '#000000',
  offWhite: '#9CA3AA',

  container: '#0D111C',

  buttonDefault: '#FF3F3E',
  buttonHover: '#B82524',
  buttonDisabled: '#B82524',

  iconButtonDefault: '#98A1C03D',
  iconButtonHover: '#98A1C055',
  iconButtonActive: '#98A1C070',

  inputDefaultColor: '#131A2A',
  inputPlaceholderColor: '#6C757D',
  
  connectionStatusRed: '#DF2E2D',
  connectionStatusGreen: '#4BB543',

  defaultBorderColor: '#98A1C03D',
  readOnlyBorderColor: '#98A1C03D',

  defaultInputColor: '#131A2A',
  readOnlyInputColor: '#101A2A',

  selectorColor: '#0D111C',
  selectorHover: '#1B1E29',
  selectorHoverBorder: 'rgba(255, 255, 255, 0.1)',

  // hacky (need to run through the app and have appropriate colors)
  rowSelectorColor: '#232839',
  rowSelectorHover: '#1E222F',
  
  warningRed: '#DF2E2D',
  warningYellow: '#FFC107',
  validGreen: '#4BB543',
  invalidRed: '#DF2E2D',
};
