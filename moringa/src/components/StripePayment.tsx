'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import api from '@/lib/api';


interface StripePaymentProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  onFail?: (error: string) => void;
}

export default function StripePayment({ orderId, amount, onSuccess, onCancel, onFail }: StripePaymentProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    // Load Stripe publishable key
    const loadStripeKey = async () => {
      try {
        const res = await api.get('/payments/config');
        const { publishable_key } = res.data;
        setStripePromise(loadStripe(publishable_key));
      } catch (err) {
        setError('Failed to load payment configuration');
        console.error(err);
      }
    };

    loadStripeKey();
  }, []);

  useEffect(() => {
    if (!orderId || !amount) return;

    // Create PaymentIntent
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const res = await api.post('/payments/create-payment-intent', {
          order_id: orderId,
          amount: amount,
          currency: 'usd'
        });
        
        setClientSecret(res.data.client_secret);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to initialize payment');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [orderId, amount]);

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: 'hsl(var(--primary))',
      colorBackground: 'hsl(var(--card))',
      colorText: 'hsl(var(--foreground))',
      colorDanger: 'hsl(var(--destructive))',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  if (error) {
    if (onFail) onFail(error);
    return (
      <div className="p-6 bg-destructive/10 border border-destructive rounded-xl">
        <p className="text-destructive font-semibold mb-2">Payment Error</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
        >
          Cancel Payment
        </button>
      </div>
    );
  }




  // Debug panel to show publishable key and client secret
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugKey, setDebugKey] = useState('');
  useEffect(() => {
    // Only set after stripePromise is set
    if (stripePromise) {
      // Try to extract the publishable key from the promise (not officially supported, so fallback to localStorage)
      api.get('/payments/config').then(res => setDebugKey(res.data.publishable_key)).catch(() => {});
    }
  }, [stripePromise]);

  if (loading || !clientSecret || !stripePromise) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Initializing secure payment...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-2 text-right">
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => setDebugOpen((v) => !v)}
        >
          {debugOpen ? 'Hide' : 'Show'} Payment Debug Info
        </button>
      </div>
      {debugOpen && (
        <div className="mb-4 p-2 bg-muted border rounded text-xs text-left break-all">
          <div><b>Publishable Key:</b> {debugKey}</div>
          <div><b>Client Secret:</b> {clientSecret}</div>
        </div>
      )}
      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <CheckoutForm 
          onSuccess={onSuccess} 
          onCancel={onCancel}
          onFail={onFail}
          amount={amount}
          orderId={orderId}
        />
      </Elements>
    </div>
  );
}
