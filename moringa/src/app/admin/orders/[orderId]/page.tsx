'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Printer, MapPin, Phone, Mail, Clock, CheckCircle, XCircle, Package, Truck } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  meal_id: string;
  meal_name: string;
  meal_price: number;
  quantity: number;
  selected_ingredients: Array<{
    ingredient_id: string;
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
  changed_by?: string;
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
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address?: string;
  special_instructions?: string;
  status_history?: StatusHistory[];
  created_at: string;
  updated_at?: string;
}

const statusConfig: Record<string, {color: string; bgColor: string; icon: any}> = {
  PENDING: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock },
  CONFIRMED: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CheckCircle },
  PREPARING: { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Package },
  READY: { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  OUT_FOR_DELIVERY: { color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: Truck },
  DELIVERED: { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  CANCELLED: { color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const orderId = params.orderId as string;

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load order');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus.toLowerCase().replace('_', ' ')}`);
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found</p>
        </div>
      </AdminLayout>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => router.push('/admin/orders')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Printer size={18} />
            Print Receipt
          </button>
        </div>

        {/* Order Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Order #{order.order_number}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig[order.status]?.bgColor || 'bg-gray-100'}`}>
              <StatusIcon size={18} className={statusConfig[order.status]?.color || 'text-gray-700'} />
              <span className={`font-semibold ${statusConfig[order.status]?.color || 'text-gray-700'}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Status Update Buttons */}
          <div className="mt-6 flex flex-wrap gap-2 print:hidden">
            {order.status !== 'CONFIRMED' && order.status !== 'CANCELLED' && (
              <button
                onClick={() => updateStatus('CONFIRMED')}
                disabled={updating}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Confirm Order
              </button>
            )}
            {order.status === 'CONFIRMED' && (
              <button
                onClick={() => updateStatus('PREPARING')}
                disabled={updating}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                Start Preparing
              </button>
            )}
            {order.status === 'PREPARING' && (
              <button
                onClick={() => updateStatus('READY')}
                disabled={updating}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                Mark as Ready
              </button>
            )}
            {order.status === 'READY' && order.order_type === 'DELIVERY' && (
              <button
                onClick={() => updateStatus('OUT_FOR_DELIVERY')}
                disabled={updating}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                Out for Delivery
              </button>
            )}
            {(order.status === 'READY' || order.status === 'OUT_FOR_DELIVERY') && (
              <button
                onClick={() => updateStatus('DELIVERED')}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Complete Order
              </button>
            )}
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <button
                onClick={() => updateStatus('CANCELLED')}
                disabled={updating}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pb-4 border-b border-gray-200 dark:border-neutral-800 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {item.quantity}× {item.meal_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(item.meal_price, language)} each
                        </p>
                        {item.selected_ingredients && item.selected_ingredients.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground">Added:</p>
                            <ul className="text-xs text-foreground mt-1 space-y-1">
                              {item.selected_ingredients.map((ing, i) => (
                                <li key={i}>• {ing.name} (+{formatCurrency(ing.price, language)})</li>
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

            {/* Status History */}
            {order.status_history && order.status_history.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Status History</h2>
                <div className="space-y-4">
                  {order.status_history.map((history, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig[history.status]?.bgColor || 'bg-gray-100'}`}>
                          {React.createElement(statusConfig[history.status]?.icon || Clock, {
                            size: 18,
                            className: statusConfig[history.status]?.color || 'text-gray-700'
                          })}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">{history.status.replace('_', ' ')}</h3>
                          <span className="text-xs text-muted-foreground">
                            {new Date(history.changed_at).toLocaleString()}
                          </span>
                        </div>
                        {history.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{history.notes}</p>
                        )}
                        {history.changed_by && (
                          <p className="text-xs text-muted-foreground mt-1">By: {history.changed_by}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone size={14} /> Phone
                  </p>
                  <p className="font-medium text-foreground">{order.customer_phone}</p>
                </div>
                {order.customer_email && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail size={14} /> Email
                    </p>
                    <p className="font-medium text-foreground">{order.customer_email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Order Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Order Type</p>
                  <p className="font-medium text-foreground">{order.order_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium text-foreground">{order.payment_method.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p className={`font-medium ${order.payment_status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.payment_status}
                  </p>
                </div>
                {order.delivery_address && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin size={14} /> Delivery Address
                    </p>
                    <p className="font-medium text-foreground">{order.delivery_address}</p>
                  </div>
                )}
                {order.special_instructions && (
                  <div>
                    <p className="text-sm text-muted-foreground">Special Instructions</p>
                    <p className="font-medium text-foreground">{order.special_instructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .container, .container * {
            visibility: visible;
          }
          .container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
