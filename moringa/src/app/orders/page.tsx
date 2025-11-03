'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Clock, CheckCircle, Truck, X, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useAuth } from '@/contexts/AuthContext';
import PhoneVerification from '@/components/PhoneVerification';
import toast from 'react-hot-toast';

interface OrderItemIngredient {
  ingredient_id: string;
  name?: string;
  ingredient_name?: string; // legacy
  price?: number;
}

interface OrderItem {
  meal_id: string;
  quantity: number;
  meal_name?: string;
  price?: number;
  meal_price?: number;
  subtotal?: number;
  selected_ingredients?: OrderItemIngredient[];
  removed_ingredients?: string[];
  removed_ingredients_names?: string[];
}

interface Order {
  _id?: string;
  id?: string;
  order_number?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  order_type: 'DELIVERY' | 'DINE_IN' | 'TAKEAWAY';
  total: number;
  created_at?: string;
  items: OrderItem[];
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
}

export default function OrdersPage() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowVerification(true);
      setLoading(false);
    } else {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Use authenticated user's orders endpoint
      const res = await api.get('/orders/my-orders');
      const raw = res.data?.data || res.data || [];
      const list = Array.isArray(raw) ? raw : [];
      // Normalize for UI expectations
      const normalized: Order[] = list.map((o: any) => ({
        _id: o._id || o.id,
        id: o.id || o._id,
        order_number: o.order_number,
        status: o.status,
        order_type: o.order_type,
        total: o.total_amount ?? o.total ?? 0,
        created_at: o.created_at,
        items: (o.items || []).map((it: any) => ({
          meal_id: it.meal_id || it.meal?.id,
          quantity: it.quantity,
          meal_name: it.meal_name || it.meal?.name || 'Meal',
          price: it.price ?? it.meal_price ?? it.subtotal ?? 0,
          meal_price: it.meal_price,
          subtotal: it.subtotal,
          selected_ingredients: it.selected_ingredients || [],
          removed_ingredients: it.removed_ingredients || [],
          removed_ingredients_names: it.removed_ingredients_names || [],
        })),
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        delivery_address: o.delivery_address,
      }));
      setOrders(normalized);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = (phone: string) => {
    // User is now authenticated after OTP verification
    setShowVerification(false);
    toast.success(getTranslation('common', 'phoneVerified', language));
    fetchOrders();
  };

  // Show verification dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <PhoneVerification
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              // If user closes without verifying, redirect to menu
              window.location.href = '/menu';
            }
          }}
          onVerified={handleVerified}
          title="Verify Your Phone to View Orders"
          description="Please verify your phone number to access your order history"
        />
      </>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { icon: Clock, color: 'text-accent bg-accent/10', label: getTranslation('orderStatus', 'PENDING', language) },
      CONFIRMED: { icon: CheckCircle, color: 'text-primary bg-primary/10', label: getTranslation('orderStatus', 'CONFIRMED', language) },
      PREPARING: { icon: Clock, color: 'text-accent bg-accent/10', label: getTranslation('orderStatus', 'PREPARING', language) },
      READY: { icon: CheckCircle, color: 'text-primary bg-primary/10', label: getTranslation('orderStatus', 'READY', language) },
      OUT_FOR_DELIVERY: { icon: Truck, color: 'text-primary bg-primary/10', label: getTranslation('orderStatus', 'OUT_FOR_DELIVERY', language) },
      DELIVERED: { icon: CheckCircle, color: 'text-primary bg-primary/10', label: getTranslation('orderStatus', 'DELIVERED', language) },
      CANCELLED: { icon: X, color: 'text-destructive bg-destructive/10', label: getTranslation('orderStatus', 'CANCELLED', language) },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
  <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-[hsl(var(--muted))] rounded w-1/3"></div>
              <div className="h-48 bg-[hsl(var(--muted))] rounded"></div>
              <div className="h-48 bg-[hsl(var(--muted))] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
  <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-[hsl(var(--muted-foreground))] mb-4" />
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
              {getTranslation('common', 'noOrdersYet', language)}
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] mb-8">
              {getTranslation('common', 'noOrdersDescription', language)}
            </p>
            <Link href="/menu">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {getTranslation('common', 'menu', language)}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
  <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-8">
            {getTranslation('common', 'yourOrders', language)}
          </h1>

          <div className="space-y-6">
            {orders.map((order) => {
              const statusConf = getStatusConfig(order.status);
              const StatusIcon = statusConf.icon;
              const orderId = (order._id || order.id || '').toString();
              const orderNumber = order.order_number || orderId.slice(-6);
              const locale = language === 'ar' ? 'ar-IL' : language === 'he' ? 'he-IL' : 'en-US';
              const createdDate = order.created_at ? new Date(order.created_at).toLocaleDateString(locale) : 'N/A';
              
              return (
                <Card key={orderId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {createdDate} • {getTranslation('orderType', order.order_type, language)}
                        </p>
                      </div>
                      
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConf.color}`}>
                        <StatusIcon className="mr-1 h-4 w-4" />
                        {statusConf.label}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium text-[hsl(var(--foreground))] mb-2">
                          {getTranslation('common', 'itemsOrdered', language)}
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="border-b pb-2 last:border-0">
                              <div className="flex justify-between text-sm font-medium mb-1">
                                <span>{item.quantity}x {item.meal_name || 'Meal'}</span>
                        <span>{formatPrice(item.subtotal ?? ((item.meal_price || 0) * item.quantity || (item.price || 0)), language)}</span>
                              </div>
                              
                              {/* Base meal price per unit */}
                              {typeof item.meal_price === 'number' && (
                                <div className="text-[10px] text-[hsl(var(--muted-foreground))] ml-4">
                                  {getTranslation('common', 'base', language)}: {formatPrice(item.meal_price, language)}
                                </div>
                              )}

                              {/* Show added ingredients with prices */}
                              {item.selected_ingredients && item.selected_ingredients.length > 0 && (
                                <div className="text-xs text-success ml-4">
                                  + {item.selected_ingredients
                                    .map((ing: any) => {
                                      const nm = ing.name || ing.ingredient_name || ing.ingredient_id;
                                      const pr = typeof ing.price === 'number' ? ` (${formatPrice(ing.price, language)})` : '';
                                      return `${nm}${pr}`;
                                    })
                                    .join(', ')}
                                </div>
                              )}
                              
                              {/* Show removed ingredients */}
                              {item.removed_ingredients && item.removed_ingredients.length > 0 && (
                                <div className="text-xs text-destructive ml-4">
                                  - {(item.removed_ingredients_names && item.removed_ingredients_names.length > 0
                                      ? item.removed_ingredients_names
                                      : item.removed_ingredients).join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Order Total */}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">{getTranslation('common', 'total', language)}</span>
                        <span className="font-semibold text-lg text-primary">
                          {formatPrice(order.total, language)}
                        </span>
                      </div>
                      
                      {/* Delivery Address */}
                      {order.delivery_address && (
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <p className="text-sm text-[hsl(var(--foreground))]">
                            <strong>{getTranslation('common', 'deliveryAddress', language)}:</strong> {order.delivery_address}
                          </p>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                            {getTranslation('common', 'cancelOrder', language)}
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          {getTranslation('common', 'reorder', language)}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}