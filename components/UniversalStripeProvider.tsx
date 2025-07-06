import React from 'react';
import { Platform } from 'react-native';

// Native Stripe (iOS/Android)
let StripeProviderNative: any;
if (Platform.OS !== 'web') {
  try {
    StripeProviderNative = require('@stripe/stripe-react-native').StripeProvider;
  } catch (e) {
    console.warn('Stripe React Native not installed.');
  }
}

// Web Stripe
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('YOUR_STRIPE_PUBLIC_KEY_HERE');

type Props = {
  children: React.ReactNode;
};

export default function UniversalStripeProvider({ children }: Props) {
  if (Platform.OS === 'web') {
    return <Elements stripe={stripePromise}>{children}</Elements>;
  }

  if (StripeProviderNative) {
    return (
      <StripeProviderNative publishableKey="pk_live_IGqfybsjMLQbjecJ1XwI8zvM">
        {children}
      </StripeProviderNative>
    );
  }

  console.error('Stripe provider not available for this platform.');
  return <>{children}</>;
}
