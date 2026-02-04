/**
 * Calculate spinner size based on button height.
 * Maintains consistent visual proportions across button sizes.
 */
export function getSpinnerSizeForButton(buttonHeight: number): number {
  if (buttonHeight >= 48) return 20;
  if (buttonHeight >= 44) return 18;
  if (buttonHeight >= 36) return 16;
  if (buttonHeight >= 28) return 12;
  return 10;
}
