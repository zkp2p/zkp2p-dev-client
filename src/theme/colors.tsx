/**
 * Peer Brand Color System
 *
 * Mirrors zkp2p-clients web theme tokens to keep styles aligned.
 */

/**
 * Add opacity information to a hex color
 * @param amount opacity value from 0 to 100
 * @param hexColor
 */
export function opacify(amount: number, hexColor: string): string {
  if (!hexColor.startsWith('#')) {
    return hexColor;
  }

  if (hexColor.length !== 7) {
    throw new Error(`opacify: provided color ${hexColor} was not in hexadecimal format (e.g. #000000)`);
  }

  if (amount < 0 || amount > 100) {
    throw new Error('opacify: provided amount should be between 0 and 100');
  }

  const opacityHex = Math.round((amount / 100) * 255).toString(16);
  const opacifySuffix = opacityHex.length < 2 ? `0${opacityHex}` : opacityHex;

  return `${hexColor.slice(0, 7)}${opacifySuffix}`;
}

/**
 * Core brand colors (from zkp2p-clients @zkp2p/brand tokens)
 */
export const brandColors = {
  black: '#000000',
  white: '#FFFFFF',
  lightGrey: '#EEEEEE',
  richBlack: '#181818',
  obsidian: '#101010',
  grey: '#9A9A9A',
  igniteYellow: '#FFE500',
  igniteRed: '#FF3A33',
  success: '#4BB543',
  warning: '#FFC107',
  error: '#FF4040',
  errorAlt: '#DF2E2D',
  link: '#1F95E2',
} as const;

export const borders = {
  dark: '#383838',
  light: '#EEEEEE',
  cardLight: '#C9C9C9',
  subtle: '#D3D3D3',
} as const;

export const gradients = {
  ignite: 'linear-gradient(270deg, #FFE500 0%, #FF3A33 100%)',
  igniteHover: 'linear-gradient(90deg, #FFE500 0%, #FF3A33 100%)',
  igniteVertical: 'linear-gradient(180deg, #FFE500 0%, #FF3A33 100%)',
  igniteText: 'linear-gradient(90deg, #FFE500, #FF3A33)',
  igniteNearHorizontal: 'linear-gradient(-89.11deg, #FFE500 3.94%, #FF3A33 91.73%)',
  igniteDiagonal: 'linear-gradient(8.27deg, #FFE500 8.73%, #FF3A33 89.42%)',
  igniteSteepDiagonal: 'linear-gradient(42.6deg, #FFE500 19.59%, #FF3A33 69.63%)',
} as const;

export const gradientValues = {
  stops: '#FFE500 0%, #FF3A33 100%',
  start: '#FFE500',
  end: '#FF3A33',
} as const;

export const fontFamilies = {
  headline: "'PP Valve', sans-serif",
  body: "'Inter', sans-serif",
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const fontSizes = {
  hero: 110,
  h1: 96,
  h2: 64,
  h3: 48,
  h4: 44,
  h5: 32,
  h6: 24,
  bodyLarge: 24,
  body: 20,
  bodySmall: 16,
  button: 14,
  caption: 12,
  sub1: 18,
  sub2: 14,
  subheading: 14,
  label: 14,
  badge: 8,
} as const;

export const lineHeights = {
  tight: 0.9,
  headline: 1.02,
  body: 1.3,
  relaxed: 1.5,
  single: 1,
} as const;

export const letterSpacing = {
  headline: '0',
  normal: '0',
  wide: '0.1em',
  tight: '-0.02em',
  snug: '-0.01em',
  subheading: '0.02em',
  button: '0.1em',
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 10,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const transitions = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
  background: 'background 0.2s ease',
} as const;

/*
 * Peer Brand Colors
 *
 * Maps brand package tokens to the existing `peer` object interface.
 */
export const peer = {
  black: brandColors.black,
  white: brandColors.white,
  richBlack: brandColors.richBlack,
  lightGrey: brandColors.lightGrey,
  igniteYellow: brandColors.igniteYellow,
  igniteRed: brandColors.igniteRed,
  borderDark: borders.dark,
  borderLight: borders.light,
  textPrimary: brandColors.white,
  textSecondary: brandColors.grey,
  textPlaceholder: '#6C757D',
  success: brandColors.success,
  warning: brandColors.warning,
  error: brandColors.error,
  link: brandColors.link,
} as const;

/*
 * Legacy Colors
 *
 * Backwards-compatible color mappings for existing components.
 */
export const colors = {
  linkBlue: peer.link,
  darkText: peer.white,
  grayText: peer.textPlaceholder,
  lightGrayText: peer.textSecondary,
  white: peer.white,
  black: peer.black,
  offWhite: peer.lightGrey,
  container: peer.black,
  buttonDefault: peer.igniteRed,
  buttonHover: peer.igniteRed,
  buttonDisabled: opacify(25, peer.igniteRed),
  iconButtonDefault: opacify(24, peer.white),
  iconButtonHover: opacify(33, peer.white),
  iconButtonActive: opacify(44, peer.white),
  inputDefaultColor: peer.black,
  inputPlaceholderColor: peer.textPlaceholder,
  connectionStatusRed: peer.error,
  connectionStatusGreen: peer.success,
  defaultBorderColor: peer.borderDark,
  readOnlyBorderColor: peer.borderDark,
  defaultInputColor: peer.black,
  readOnlyInputColor: peer.black,
  selectorColor: peer.richBlack,
  selectorHover: opacify(80, peer.richBlack),
  selectorHoverBorder: opacify(15, peer.white),
  rowSelectorColor: peer.richBlack,
  rowSelectorHover: opacify(80, peer.richBlack),
  warningRed: peer.error,
  warningYellow: peer.warning,
  validGreen: peer.success,
  invalidRed: peer.error,
  defaultBorder: peer.borderDark,
  backgroundSecondary: peer.richBlack,
  textPrimary: peer.textPrimary,
  textSecondary: peer.textSecondary,
};
