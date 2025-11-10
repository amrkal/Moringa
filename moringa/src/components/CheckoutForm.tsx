'use client';

import { useState, FormEvent } from 'react';
import { Button } from './ui/button';
import { formatPrice } from '@/lib/utils';
import { CreditCard, Lock, CheckCircle2 } from 'lucide-react';

interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  amount: number;
}

// Modern card form for demo purposes
export default function CheckoutForm({ onSuccess, onCancel, amount }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Format card number with spaces (4 digits per group)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry with /
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Summary */}
      <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-transparent p-4 sm:p-5 rounded-2xl border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <span className="text-sm sm:text-base font-medium text-muted-foreground">Total Amount</span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">{formatPrice(amount, 'en')}</span>
        </div>
      </div>

      {/* Card Details */}
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Secure Payment</h3>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Cardholder Name */}
          <div>
            <label htmlFor="cardholderName" className="block text-sm font-medium text-foreground mb-1.5">
              Cardholder Name
            </label>
            <input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={cardholderName}
              onChange={e => setCardholderName(e.target.value)}
              required
            />
          </div>

          {/* Card Number */}
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-foreground mb-1.5">
              Card Number
            </label>
            <div className="relative">
              <input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                required
                maxLength={19}
              />
              <CreditCard className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Expiry & CVC */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-foreground mb-1.5">
                Expiry Date
              </label>
              <input
                id="expiry"
                type="text"
                placeholder="MM/YY"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                required
                maxLength={5}
              />
            </div>
            <div>
              <label htmlFor="cvc" className="block text-sm font-medium text-foreground mb-1.5">
                CVC
              </label>
              <input
                id="cvc"
                type="text"
                placeholder="123"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={cvc}
                onChange={e => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                required
                maxLength={4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl">
        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs sm:text-sm text-muted-foreground">
          Your payment information is encrypted and secure. This is a demo payment form.
        </p>
      </div>

      {message && (
        <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive rounded-xl">
          <p className="text-sm text-destructive">{message}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 h-12 sm:h-11 rounded-xl border-border hover:bg-muted transition-all"
          size="lg"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 h-12 sm:h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
          size="lg"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Pay {formatPrice(amount, 'en')}</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
