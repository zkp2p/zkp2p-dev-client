import { useMemo } from 'react';
import { useNavigate, useLocation, To, NavigateOptions } from 'react-router-dom';

const PARAM_KEY_MAP = {
  'REFERRER': 'referrer',
  'REFERRER_LOGO': 'referrerLogo',
  'REFERRER_FROM_CURRENCY': 'inputCurrency',
  'REFERRER_INPUT_AMOUNT': 'inputAmount',
  'REFERRER_PAYMENT_PLATFORM': 'paymentPlatform',
  'REFERRER_TO_TOKEN': 'toToken',
  'REFERRER_AMOUNT_USDC': 'amountUsdc',
  'REFERRER_RECIPIENT_ADDRESS': 'recipientAddress',
  'REFERRER_CALLBACK_URL': 'callbackUrl',
} as const;

/**
 * The shape of the standardized keys you can update or retrieve.
 * For partial updates, each is optional.
 */
type ParamKey = keyof typeof PARAM_KEY_MAP;
type ParamUpdate = Partial<Record<ParamKey, string | null>>;

export default function useQuery() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithQuery = (to: To, options: NavigateOptions = {}) => {
    const path = typeof to === 'string'
      ? to + location.search
      : {
        ...to,
        pathname: to.pathname + location.search
      };

    navigate(path, options);
  };

  const queryParams = useMemo(() => {
    const params: Record<ParamKey, string | null> = {
      REFERRER: null,
      REFERRER_LOGO: null,
      REFERRER_FROM_CURRENCY: null,
      REFERRER_INPUT_AMOUNT: null,
      REFERRER_PAYMENT_PLATFORM: null,
      REFERRER_TO_TOKEN: null,
      REFERRER_AMOUNT_USDC: null,
      REFERRER_RECIPIENT_ADDRESS: null,
      REFERRER_CALLBACK_URL: null,
    };

    const searchParams = new URLSearchParams(location.search);

    // For each known standardized key in the map, read the actual param from the URL
    (Object.entries(PARAM_KEY_MAP) as [ParamKey, string][])
      .forEach(([standardizedKey, actualParamName]) => {
        const val = searchParams.get(actualParamName);
        params[standardizedKey] = val || null;
      });

    return params;
  }, [location.search]);

  const updateQueryParams = (updates: ParamUpdate, options: NavigateOptions = {}) => {
    const searchParams = new URLSearchParams(location.search);

    for (const [standardizedKey, newValue] of Object.entries(updates) as [ParamKey, string | null][]) {
      const actualParamName = PARAM_KEY_MAP[standardizedKey];

      if (!newValue) {
        searchParams.delete(actualParamName);
      }
      else {
        searchParams.set(actualParamName, newValue);
      }
    }

    navigate(
      {
        pathname: location.pathname,
        search: searchParams.toString()
      },
      options
    );
  };

  const clearReferrerQueryParams = () => {
    updateQueryParams({
      REFERRER: null,
      REFERRER_LOGO: null,
      REFERRER_FROM_CURRENCY: null,
      REFERRER_INPUT_AMOUNT: null,
      REFERRER_PAYMENT_PLATFORM: null,
      REFERRER_TO_TOKEN: null,
      REFERRER_AMOUNT_USDC: null,
      REFERRER_RECIPIENT_ADDRESS: null,
      REFERRER_CALLBACK_URL: null,
    });
  };

  return {
    navigateWithQuery,
    queryParams,
    updateQueryParams,
    clearReferrerQueryParams
  };
}
