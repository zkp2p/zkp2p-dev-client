import { ethers, BigNumber } from "ethers";


export const etherUnits = (amount: number | string | BigNumber): BigNumber => {
  return ethers.utils.parseEther(amount.toString());
};

export const usdcUnits = (amount: number | string | BigNumber): BigNumber => {
  return ethers.utils.parseUnits(amount.toString(), 6);
};

export const tokenUnits = (amount: number | string | BigNumber, decimals: number): BigNumber => {
  return ethers.utils.parseUnits(amount.toString(), decimals);
};

export const etherUnitsToReadable = (amount: BigNumber | string, decimalsToDisplay: number = 2): string => {
  return Number(Number(ethers.utils.formatEther(amount)).toFixed(decimalsToDisplay)).toString();
};

export const tokenUnitsToReadable = (amount: BigNumber | string, decimals: number, decimalsToDisplay: number = 2): string => {
  const formatted = Number(ethers.utils.formatUnits(amount, decimals));
  const multiplier = Math.pow(10, decimalsToDisplay);
  return (Math.floor(formatted * multiplier) / multiplier).toFixed(decimalsToDisplay);
};

export const tokenUnitsToReadableWithMaxDecimals = (amount: BigNumber | string, decimals: number, maxDecimalsToDisplay: number = 2): string => {
  const formatted = Number(ethers.utils.formatUnits(amount, decimals));

  if (formatted === 0) return '0';

  // For small numbers (less than 0.001), show at least 3 non-zero places
  if (formatted < 0.001) {
    // Handle scientific notation (e.g., 7.7327284e-11)
    const formattedStr = formatted.toString();

    // Check if the number is in scientific notation
    if (formattedStr.includes('e-')) {
      const parts = formattedStr.split('e-');
      const base = parseFloat(parts[0]);
      const exponent = parseInt(parts[1], 10);

      // Convert from scientific notation to decimal format
      let decimalStr = '0.';
      // Add leading zeros based on the exponent
      for (let i = 1; i < exponent; i++) {
        decimalStr += '0';
      }

      // Add the significant digits (only 3 non-zero places)
      const baseDigits = base.toString().replace('.', '');
      let nonZeroCount = 0;
      let result = '';

      for (let i = 0; i < baseDigits.length; i++) {
        result += baseDigits[i];
        if (baseDigits[i] !== '0') {
          nonZeroCount++;
          if (nonZeroCount === 3) break;
        }
      }

      return decimalStr + result;
    } else {
      // For regular small decimals, find leading zeros and show 3 significant digits
      const decimalStr = formattedStr.split('.')[1] || '';
      let leadingZeros = 0;
      for (let i = 0; i < decimalStr.length; i++) {
        if (decimalStr[i] !== '0') break;
        leadingZeros++;
      }

      // Show at least 3 significant digits
      return formatted.toFixed(leadingZeros + 3);
    }
  }

  // For larger numbers, use the specified maxDecimalsToDisplay
  const fixedValue = formatted.toFixed(maxDecimalsToDisplay);
  // Remove trailing zeros and decimal point if needed
  return fixedValue.replace(/\.?0+$/, '');
};


export const relayTokenAmountToReadable = (amountFormatted: string | undefined) => {
  if (!amountFormatted) return '0';

  const num = Number(amountFormatted);
  if (num === 0) return '0';

  // For small numbers (less than 0.001), show at least 3 non-zero places
  if (num < 0.001) {
    // Find the first non-zero digit after decimal
    const decimalStr = num.toString().split('.')[1] || '';
    let leadingZeros = 0;
    for (let i = 0; i < decimalStr.length; i++) {
      if (decimalStr[i] !== '0') break;
      leadingZeros++;
    }
    // Show at least 3 significant digits
    return num.toFixed(leadingZeros + 3);
  }

  // For larger numbers, show 3 decimal places
  return num.toFixed(3);
};