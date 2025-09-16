import Stripe from 'stripe';

// Helper function to safely get environment variables
const getEnvVar = (key: string, isRequired: boolean = true): string | undefined => {
  const value = process.env[key];
  
  // Check for placeholder values
  if (value && (value.includes('placeholder') || value.includes('51234567890'))) {
    // Only show warnings in production mode when real Stripe integration is expected
    if (isRequired && process.env.NODE_ENV === 'production') {
      console.warn(`Environment variable ${key} appears to contain placeholder data`);
    }
    return undefined;
  }
  
  return value;
};

// Server-side Stripe instance with safe initialization
const createStripeInstance = (): Stripe | null => {
  // Skip Stripe initialization in development mode when using mock payments
  if (process.env.NODE_ENV === 'development') {
    return null;
  }
  
  const secretKey = getEnvVar('STRIPE_SECRET_KEY');
  
  if (!secretKey) {
    console.error('Stripe secret key is not properly configured. Payment functionality will be disabled.');
    return null;
  }
  
  try {
    return new Stripe(secretKey, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
};

export const stripe = createStripeInstance();

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: getEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  secretKey: getEnvVar('STRIPE_SECRET_KEY'),
  webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET'),
  currency: 'USD',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  paymentMethodTypes: ['card'] as const,
  captureMethod: 'automatic' as const,
} as const;

// Validate Stripe keys are present (only in production mode)
if (process.env.NODE_ENV === 'production') {
  if (typeof window === 'undefined') {
    // Server-side validation
    if (!STRIPE_CONFIG.secretKey) {
      console.error('Missing or invalid STRIPE_SECRET_KEY environment variable');
    }
  } else {
    // Client-side validation
    if (!STRIPE_CONFIG.publishableKey) {
      console.error('Missing or invalid NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
    }
  }
}

// Stripe appearance customization for Ambassador Collection brand
export const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#d97706', // Ambassador Collection amber
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    colorDanger: '#dc2626',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Input': {
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '16px',
    },
    '.Input:focus': {
      borderColor: '#d97706',
      boxShadow: '0 0 0 2px rgba(217, 119, 6, 0.1)',
    },
    '.Label': {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px',
    },
    '.Tab': {
      border: '1px solid #d1d5db',
      borderRadius: '8px',
    },
    '.Tab:hover': {
      color: '#d97706',
    },
    '.Tab--selected': {
      borderColor: '#d97706',
      color: '#d97706',
    },
  },
};

// Error messages mapping
export const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  card_declined: 'Your card was declined. Please try a different payment method.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: 'Your card\'s security code is incorrect.',
  incomplete_cvc: 'Your card\'s security code is incomplete.',
  incomplete_number: 'Your card number is incomplete.',
  incomplete_expiry: 'Your card\'s expiration date is incomplete.',
  invalid_number: 'Your card number is invalid.',
  invalid_expiry_month: 'Your card\'s expiration month is invalid.',
  invalid_expiry_year: 'Your card\'s expiration year is invalid.',
  invalid_cvc: 'Your card\'s security code is invalid.',
  processing_error: 'An error occurred while processing your card. Please try again.',
  rate_limit: 'Too many requests. Please try again in a moment.',
  insufficient_funds: 'Your card has insufficient funds.',
  generic_decline: 'Your card was declined. Please contact your bank for more information.',
} as const;

// Currency configuration
export const CURRENCY_CONFIG = {
  USD: { symbol: '$', decimal_digits: 2, code: 'USD', name: 'US Dollar' },
  EUR: { symbol: '€', decimal_digits: 2, code: 'EUR', name: 'Euro' },
  GBP: { symbol: '£', decimal_digits: 2, code: 'GBP', name: 'British Pound' },
  CAD: { symbol: 'C$', decimal_digits: 2, code: 'CAD', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', decimal_digits: 2, code: 'AUD', name: 'Australian Dollar' },
} as const;

export type SupportedCurrency = keyof typeof CURRENCY_CONFIG;

// Helper function to format currency
export function formatCurrency(amount: number, currency: SupportedCurrency = 'USD'): string {
  const config = CURRENCY_CONFIG[currency];
  const value = amount / Math.pow(10, config.decimal_digits);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: config.decimal_digits,
    maximumFractionDigits: config.decimal_digits,
  }).format(value);
}

// Convert currency amounts
export function convertCurrency(
  amount: number, 
  fromCurrency: SupportedCurrency, 
  toCurrency: SupportedCurrency,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  return Math.round(amount * exchangeRate);
}

// Validate currency code
export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return currency in CURRENCY_CONFIG;
}