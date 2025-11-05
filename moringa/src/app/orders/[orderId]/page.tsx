'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, XCircle, Package, Truck, MapPin, Phone, Star, MessageSquare } from 'lucide-react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import ReviewForm from '@/components/ReviewForm';

interface OrderItem {
  id: string;
  meal_name: string;
  meal_price: number;
  quantity: number;
  selected_ingredients: Array<{
    name: string;
    price: number;
  }>;
  removed_ingredients_names?: string[];
  special_instructions?: string;
  subtotal: number;
}

interface StatusHistory {
  status: string;
  changed_at: string;
  notes?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  order_type: string;
  payment_method: string;
  payment_status: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address?: string;
  special_instructions?: string;
  status_history?: StatusHistory[];
  created_at: string;
  estimated_delivery_time?: string;
}

const statusSteps = [
  { key: 'PENDING', label: 'Order Placed', icon: CheckCircle },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'PREPARING', label: 'Preparing', icon: Package },
  { key: 'READY', label: 'Ready', icon: CheckCircle },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const statusConfig: Record<string, { color: string; bgColor: string; icon: any }> = {
  PENDING: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock },
  CONFIRMED: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CheckCircle },
  PREPARING: { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Package },
  READY: { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  OUT_FOR_DELIVERY: { color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: Truck },
  DELIVERED: { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  CANCELLED: { color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
};

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { isCustomerAuthenticated } = useCustomerAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);
  const [reviewedMeals, setReviewedMeals] = useState<Set<string>>(new Set());

  const orderId = params.orderId as string;

  useEffect(() => {
    if (!isCustomerAuthenticated) {
      router.push('/');
      return;
    }
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, isCustomerAuthenticated]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
      
      // Check which meals have been reviewed
      if (response.data.status === 'DELIVERED') {
        checkReviewedMeals(response.data.items);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load order');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const checkReviewedMeals = async (items: OrderItem[]) => {
    try {
      const response = await api.get('/reviews/user/me');
      const userReviews = response.data;
      
      const reviewed = new Set<string>();
      items.forEach((item) => {
        const hasReview = userReviews.some(
          (review: any) => review.meal_id === item.id && review.order_id === orderId
        );
        if (hasReview) {
          reviewed.add(item.id);
        }
      });
      
      setReviewedMeals(reviewed);
    } catch (error) {
      console.error('Error checking reviewed meals:', error);
    }
  };

  const handleReviewSuccess = (mealId: string) => {
    setReviewedMeals(new Set(reviewedMeals).add(mealId));
    setShowReviewForm(null);
    toast.success('Thank you for your review!');
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.status === 'CANCELLED') return -1;
    const currentIndex = statusSteps.findIndex(step => step.key === order.status);
    return currentIndex >= 0 ? currentIndex : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Order Status Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Order #{order.order_number}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig[order.status]?.bgColor || 'bg-gray-100'}`}>
              <StatusIcon size={18} className={statusConfig[order.status]?.color || 'text-gray-700'} />
              <span className={`font-semibold ${statusConfig[order.status]?.color || 'text-gray-700'}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Progress Tracker */}
          {order.status !== 'CANCELLED' && (
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-neutral-800" />
              <div
                className="absolute top-5 left-0 h-1 bg-primary transition-all duration-500"
                style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {statusSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isComplete = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isComplete
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-200 dark:bg-neutral-800 text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                      >
                        <StepIcon size={18} />
                      </div>
                      <span className={`text-xs mt-2 text-center max-w-[80px] ${isComplete ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {order.status === 'CANCELLED' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <XCircle size={20} />
                <p className="font-medium">This order has been cancelled</p>
              </div>
            </div>
          )}

          {order.estimated_delivery_time && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Clock size={18} />
                <p className="text-sm">
                  Estimated delivery: {new Date(order.estimated_delivery_time).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Order Items</h2>
          <div className="space-y-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="pb-6 border-b border-gray-200 dark:border-neutral-800 last:border-0 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {item.quantity}× {item.meal_name}
                    </h3>
                    {item.selected_ingredients && item.selected_ingredients.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">Extras:</p>
                        <ul className="text-xs text-foreground mt-1 space-y-1">
                          {item.selected_ingredients.map((ing, i) => (
                            <li key={i}>• {ing.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.removed_ingredients_names && item.removed_ingredients_names.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">Removed:</p>
                        <ul className="text-xs text-foreground mt-1 space-y-1">
                          {item.removed_ingredients_names.map((name, i) => (
                            <li key={i}>• {name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.special_instructions && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Note: {item.special_instructions}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-foreground">{formatCurrency(item.subtotal, language)}</p>
                  </div>
                </div>

                {/* Review Button for Delivered Orders */}
                {order.status === 'DELIVERED' && (
                  <div className="mt-4">
                    {reviewedMeals.has(item.id) ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>You've reviewed this meal</span>
                      </div>
                    ) : showReviewForm === item.id ? (
                      <div className="bg-muted/30 border border-border rounded-lg p-4">
                        <ReviewForm
                          mealId={item.id}
                          mealName={item.meal_name}
                          orderId={orderId}
                          onSuccess={() => handleReviewSuccess(item.id)}
                          onCancel={() => setShowReviewForm(null)}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowReviewForm(item.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
                      >
                        <Star className="h-4 w-4" />
                        Write a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-800 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatCurrency(order.subtotal, language)}</span>
            </div>
            {order.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium text-foreground">{formatCurrency(order.tax_amount, language)}</span>
              </div>
            )}
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium text-foreground">{formatCurrency(order.delivery_fee, language)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-neutral-800">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatCurrency(order.total_amount, language)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        {order.order_type === 'DELIVERY' && order.delivery_address && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Delivery Information</h2>
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-primary mt-1" />
              <div>
                <p className="font-medium text-foreground">{order.delivery_address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Info */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Order Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Type</p>
              <p className="font-medium text-foreground mt-1">{order.order_type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium text-foreground mt-1">{order.payment_method.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <p className={`font-medium mt-1 ${order.payment_status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.payment_status}
              </p>
            </div>
          </div>
          {order.special_instructions && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
              <p className="text-sm text-muted-foreground">Special Instructions</p>
              <p className="text-foreground mt-1">{order.special_instructions}</p>
            </div>
          )}
        </div>

        {/* Need Help */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you have any questions about your order, please contact us.
          </p>
          <div className="flex items-center gap-2 text-primary">
            <Phone size={16} />
            <span className="text-sm font-medium">Contact Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
