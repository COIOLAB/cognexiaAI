/**
 * Payment Method Interface
 * Represents a Stripe payment method structure
 */
export interface PaymentMethod {
  id: string;
  object: 'payment_method';
  type: 'card' | 'bank_account' | 'alipay' | 'ideal' | 'sepa_debit';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
    country?: string;
  };
  billing_details?: {
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };
  metadata?: Record<string, string>;
  created?: number;
  customer?: string;
  livemode?: boolean;
}

/**
 * Payment Method Create Params
 */
export interface PaymentMethodCreateParams {
  type: 'card' | 'bank_account';
  card?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing_details?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
  metadata?: Record<string, string>;
}
