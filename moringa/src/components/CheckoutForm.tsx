'use client';

// 'use client';

// import { useState, FormEvent } from 'react';
import { useState, FormEvent } from 'react';
import { Button } from './ui/button';
import { formatPrice } from '@/lib/utils';

interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  onFail?: (error: string) => void;
  amount: number;
  orderId?: string;
}

// Fake card form for demo purposes
export default function CheckoutForm({ onSuccess, onCancel, onFail, amount }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate random failure for demo (remove this in prod)
    const fail = false; // set to true to simulate failure
    setTimeout(() => {
      setIsLoading(false);
      if (fail) {
        setMessage('Payment verification failed.');
        if (onFail) onFail('Payment verification failed.');
      } else {
        onSuccess();
      }
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card p-6 rounded-2xl border border-border">
        <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
          <span>Payment Details (Demo)</span>
          <span className="text-primary">{formatPrice(amount, 'en')}</span>
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Card Number"
            className="w-full px-3 py-2 border rounded"
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)}
            required
            maxLength={19}
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="MM/YY"
              className="w-1/2 px-3 py-2 border rounded"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              required
              maxLength={5}
            />
            <input
              type="text"
              placeholder="CVC"
              className="w-1/2 px-3 py-2 border rounded"
              value={cvc}
              onChange={e => setCvc(e.target.value)}
              required
              maxLength={4}
            />
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-xl">
          <p className="text-sm text-destructive">{message}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Processing...
            </span>
          ) : (
            `Pay ${formatPrice(amount, 'en')}`
          )}
        </Button>
      </div>
    </form>
  );
}
