'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface MPesaPaymentProps {
  orderId: string;
  amount: number; // assume already in major currency units (e.g. USD or KES equivalent)
  phoneNumber: string; // MSISDN in international or local format
  onSuccess: () => void;
  onCancel: () => void;
}

interface MPesaConfig {
  business_short_code: string;
  environment: string;
}

export default function MPesaPayment({ orderId, amount, phoneNumber, onSuccess, onCancel }: MPesaPaymentProps) {
  const [config, setConfig] = useState<MPesaConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [initiated, setInitiated] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Load MPesa config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/mpesa/config');
        setConfig(res.data);
      } catch (e: any) {
        setError(e.response?.data?.detail || 'Failed to load MPesa configuration');
      }
    };
    fetchConfig();
  }, []);

  // Poll transaction status
  useEffect(() => {
    if (!polling || !checkoutRequestId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/mpesa/transaction/${checkoutRequestId}`);
        const tx = res.data;
        setStatusMessage(`Status: ${tx.status}`);
        if (tx.status === 'SUCCESS') {
          toast.success('Payment successful');
          setPolling(false);
          onSuccess();
        } else if (tx.status === 'FAILED' || tx.status === 'CANCELED') {
          toast.error('Payment failed');
          setPolling(false);
          setError('Payment failed');
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [polling, checkoutRequestId, onSuccess]);

  const initiatePayment = async () => {
    if (!phoneNumber) {
      toast.error('Phone number required for MPesa payment');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setStatusMessage('Sending STK Push...');
      const res = await api.post('/mpesa/stk-push', {
        order_id: orderId,
        amount: amount,
        phone_number: phoneNumber,
        description: `Payment for order ${orderId}`,
      });
      setInitiated(true);
      setCheckoutRequestId(res.data.checkout_request_id);
      setStatusMessage('Prompt sent. Please complete payment on your phone.');
      setPolling(true);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to initiate MPesa payment');
      toast.error('Failed to initiate MPesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">M-Pesa Payment</h3>
      {config && (
        <p className="text-xs text-muted-foreground">Environment: {config.environment} • Short Code: {config.business_short_code}</p>
      )}
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">{error}</div>
      )}
      {!initiated ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">We will send an STK Push prompt to your phone ({phoneNumber}). Confirm to complete payment.</p>
          <Button disabled={loading} onClick={initiatePayment} className="w-full">
            {loading ? 'Sending...' : 'Pay with M-Pesa'}
          </Button>
          <Button variant="ghost" onClick={onCancel} className="w-full">Cancel</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">{statusMessage}</p>
          {polling && <p className="text-xs text-muted-foreground">Checking status...</p>}
          {!polling && !error && (
            <Button onClick={onSuccess} className="w-full">Continue</Button>
          )}
          {error && (
            <Button variant="ghost" onClick={onCancel} className="w-full">Close</Button>
          )}
        </div>
      )}
    </div>
  );
}
