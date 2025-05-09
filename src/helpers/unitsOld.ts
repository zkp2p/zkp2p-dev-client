export const toBigInt = (amount: string, decimals: number = 6): bigint => {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = (fraction + '000000').slice(0, decimals);  // Pad or truncate fraction to decimals
  const integerRepresentation = whole + paddedFraction;
  return BigInt(integerRepresentation);
};

export const toBigIntEth = (amount: string): bigint => {
  if (amount === '0') {
    return 0n;
  }
  // Remove commas from the input string
  const cleanAmount = amount.replace(/,/g, '');

  const [whole, fraction = ''] = cleanAmount.split('.');
  const wholeBigInt = BigInt(whole);
  const fractionPadded = (fraction + '0'.repeat(18)).slice(0, 18);
  const fractionBigInt = BigInt(fractionPadded);

  const result = (wholeBigInt * (10n ** 18n)) + fractionBigInt;
  return result;
};


export const toUsdcString = (amount: bigint, includeCommas: boolean = false): string => {
  let amountString = amount.toString();
  // Pad with leading zeros if necessary
  amountString = amountString.padStart(7, '0');

  // Insert decimal point 6 places from the right
  const wholePart = amountString.slice(0, -6);
  let fractionalPart = amountString.slice(-6);

  // Trim trailing zeros from the fractional part
  fractionalPart = fractionalPart.replace(/0+$/, '');

  // If all digits were zeros, ensure at least one zero remains
  if (fractionalPart.length === 0) {
    fractionalPart = '0';
  }

  if (includeCommas) {
    const formattedWholePart = new Intl.NumberFormat().format(parseInt(wholePart, 10));
    if (fractionalPart === '0') {
      return formattedWholePart;
    }

    let result = `${formattedWholePart}.${fractionalPart}`;
    result = result.replace(/^,/, '');

    return result;
  } else {
    let result = `${wholePart}.${fractionalPart}`;

    return parseFloat(result).toString();
  }
};


export const toEthStringWithDecimals = (amount: bigint, includeCommas: boolean = false, maxDecimals: number = 18, removeTrailingZeros: boolean = true): string => {
  if (amount === 0n) {
    return '0';
  }
  if (typeof amount !== 'bigint') {
    amount = BigInt(amount);
  }
  const ethInWei = BigInt(1000000000000000000); // 1 ETH = 10^18 wei
  const wholePart = amount / ethInWei;
  const fractionalPart = amount % ethInWei;

  let fractionalString = fractionalPart.toString().padStart(18, '0');

  // Limit the fractional part to maxDecimals
  fractionalString = fractionalString.slice(0, maxDecimals);

  // Remove trailing zeros if required
  if (removeTrailingZeros) {
    fractionalString = fractionalString.replace(/0+$/, '');
  }

  if (includeCommas) {
    const formattedWholePart = new Intl.NumberFormat().format(Number(wholePart));
    if (fractionalString === '') {
      return formattedWholePart;
    }
    let result = `${formattedWholePart}.${fractionalString}`;
    result = result.replace(/^,/, '');
    return result;
  } else {
    if (fractionalString === '') {
      return wholePart.toString();
    }
    return `${wholePart}.${fractionalString}`;
  }
}

// toEthString with fixed decimals
export const toEthString = (amount: bigint, includeCommas: boolean = false, numDecimals: number = 18): string => {
  let result = toEthStringWithDecimals(amount, includeCommas, numDecimals, true);
  return parseFloat(result).toFixed(numDecimals);
};

export const toUsdString = (amount: bigint): string => {
  const usdcString = toUsdcString(amount);
  const parts = usdcString.split('.');

  let wholePart = parts[0];
  let decimalPart = parts.length > 1 ? parts[1].substring(0, 2) : '00';

  // Check if we need to round up
  if (parts.length > 1 && parts[1].length > 2 && parts[1][2] >= '5') {
    const decimalAsNumber = parseInt(decimalPart, 10) + 1;

    // Check if rounding up caused a carry-over
    if (decimalAsNumber === 100) {
      decimalPart = '00';
      wholePart = (parseInt(wholePart, 10) + 1).toString();
    } else {
      decimalPart = decimalAsNumber.toString().padStart(2, '0');
    }
  }

  return `${wholePart}.${decimalPart}`;
};

// export function conversionRateToPercentageString(rate: bigint, premiumForOffRamper: boolean = false): string {
//   const scaledValue = rate * PRECISION;
//   const reciprocal = (PRECISION * (10000n * PRECISION)) / scaledValue;

//   const adjustedRate = Number(reciprocal - 10000n);
//   const percentage = Math.abs(adjustedRate / 100);

//   let percentageSign;
//   if (premiumForOffRamper) {
//     percentageSign = adjustedRate >= 0 ? "+" : "–";
//   } else {
//     percentageSign = adjustedRate >= 0 ? "–" : "+";
//   }

//   let percentageString = percentageSign + percentage.toFixed(2);
//   percentageString = percentageString.replace(/\.00$|0$/, '');

//   return percentageString + '%';
// };

// export function conversionRateToMultiplierString(rate: bigint): string {
//   const scaledValue = BigInt(rate) * PRECISION;
//   const reciprocal = (PRECISION * (10000n * PRECISION)) / scaledValue;

//   const adjustedRate = Number(reciprocal - 10000n);
//   const percentage = adjustedRate / 10000;

//   const conversionRatio = 1 + percentage;

//   let ratioString = conversionRatio.toFixed(3);
//   ratioString = ratioString.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');

//   return ratioString;
// };

// export function calculateConversionRate(depositAmount: string, receiveAmount: string): string {
//   const deposit = toBigInt(depositAmount);
//   const receive = toBigInt(receiveAmount);

//   if (deposit === 0n || receive === 0n) {
//     return '0';
//   }

//   return conversionRateToMultiplierString((PRECISION * deposit) / receive);
// }

// export function toEthString(value: bigint): string {
//   if (typeof value !== 'bigint') {
//     return '0';
//   }

//   const reducedValue = value / BigInt(1e15);
//   const ethValue = Number(reducedValue) / 1e3;

//   return ethValue.toFixed(3);
// };

export function toEthStringLong(value: bigint): string {
  if (typeof value !== 'bigint') {
    return '0';
  }

  const valueStr = value.toString();
  const decimals = 18;
  const precision = 9;

  const paddedValue = valueStr.padStart(decimals + 1, '0');
  const splitPosition = paddedValue.length - decimals;

  const integerPart = paddedValue.substring(0, splitPosition) || '0';
  const fractionalPart = paddedValue.substring(splitPosition).padEnd(decimals, '0');
  const ethValue = `${integerPart}.${fractionalPart.substring(0, precision)}`;

  const formattedEthValue = parseFloat(ethValue).toFixed(precision).replace(/\.?0+$/, '');

  return formattedEthValue;
};

export function toTokenStringGeneral(amount: bigint, decimals: number, includeCommas: boolean = false): string {
  if (typeof amount !== 'bigint') {
    return '0';
  }

  let amountString = amount.toString();
  amountString = amountString.padStart(decimals + 1, '0');

  const wholePart = amountString.slice(0, -decimals) || '0';
  let fractionalPart = amountString.slice(-decimals);

  fractionalPart = fractionalPart.replace(/0+$/, '');

  if (fractionalPart.length === 0) {
    fractionalPart = '0';
  }

  if (includeCommas) {
    const formattedWholePart = new Intl.NumberFormat().format(parseInt(wholePart, 10));
    if (fractionalPart === '0') {
      return formattedWholePart;
    }

    let result = `${formattedWholePart}.${fractionalPart}`;
    result = result.replace(/^,/, '');
    return result;
  } else {
    let result = `${wholePart}.${fractionalPart}`;
    return parseFloat(result).toString();
  }
}


export function toTokenString(value: bigint, decimals: number): string {
  switch (decimals) {
    case 18:
      return toEthStringLong(value);
    case 6:
      return toUsdcString(value);
    default:
      return toTokenStringGeneral(value, decimals);
  }
}
