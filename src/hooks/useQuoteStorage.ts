import { useCallback } from 'react';

// Define the structure of quote data we want to store
export interface QuoteData {
  // USDC amounts
  usdcAmount: string;
  fiatAmount: string;
  fiatCurrency: string;

  // Token info
  token: string;
  tokenAmount?: string;

  // Recipient info
  recipientAddress: string;

  // Conversion details
  outputTokenAmount?: string;
  outputTokenDecimals?: number;
  outputTokenAmountInUsd?: string;
  usdcToFiatRate?: string;
  usdcToTokenRate?: string;

  // Fee info
  gasFeesInUsd?: string;
  appFeeInUsd?: string;
  relayerFeeInUsd?: string;
  relayerGasFeesInUsd?: string;
  relayerServiceFeesInUsd?: string;

  // Time estimates
  timeEstimate?: string;

  // Payment platform
  paymentPlatform: string;
}

const QUOTE_STORAGE_PREFIX = 'quote_data_';

export default function useQuoteStorage() {
  // Save quote data to localStorage
  const saveQuoteData = useCallback((intentHash: string, data: QuoteData) => {
    if (!intentHash) return;

    try {
      localStorage.setItem(
        `${QUOTE_STORAGE_PREFIX}${intentHash}`,
        JSON.stringify(data)
      );
      console.log(`Saved quote data for ${intentHash} to localStorage`);
    } catch (error) {
      console.error('Failed to save quote data to localStorage:', error);
    }
  }, []);

  // Get quote data from localStorage
  const getQuoteData = useCallback((intentHash: string): QuoteData | null => {
    if (!intentHash) return null;

    try {
      const data = localStorage.getItem(`${QUOTE_STORAGE_PREFIX}${intentHash}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve quote data from localStorage:', error);
      return null;
    }
  }, []);

  // Clear quote data from localStorage
  const clearQuoteData = useCallback((intentHash: string) => {
    if (!intentHash) return;

    try {
      localStorage.removeItem(`${QUOTE_STORAGE_PREFIX}${intentHash}`);
      console.log(`Cleared quote data for ${intentHash} from localStorage`);
    } catch (error) {
      console.error('Failed to clear quote data from localStorage:', error);
    }
  }, []);

  return {
    saveQuoteData,
    getQuoteData,
    clearQuoteData
  };
} 