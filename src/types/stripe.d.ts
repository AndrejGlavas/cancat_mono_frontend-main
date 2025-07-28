  
  declare namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': {
        'buy-button-id': string;
        'publishable-key': string;
        'client-reference-id'?: string;
        'customer-email'?: string;
        'theme'?: 'stripe' | 'night' | 'flat' | 'none';
        'language'?: string;
        'button-height'?: string;
        'collect-phone-number'?: boolean;
        'collect-zip-code'?: boolean;
        'success-url'?: string;
        'cancel-url'?: string;
      }
    }
  }