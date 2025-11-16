'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Clock, CheckCircle, Truck, X, ShoppingBag, ChevronDown, ChevronUp, Package, Phone, MapPin, Calendar, Hash, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useAuth } from '@/contexts/AuthContext';
import PhoneVerification from '@/components/PhoneVerification';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [reorderingId, setReorderingId] = useState<string | null>(null);

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
      console.log('Orders API Response:', res.data); // Debug log
      const raw = res.data?.data || res.data || [];
      const list = Array.isArray(raw) ? raw : [];
      
      // Normalize for UI expectations
      const normalized: Order[] = list.map((o: any) => {
        console.log('Processing order:', o); // Debug log
        
        return {
          _id: o._id || o.id,
          id: o.id || o._id,
          order_number: o.order_number,
          status: o.status || 'PENDING',
          order_type: o.order_type || 'DELIVERY',
          total: o.total_amount ?? o.total ?? 0,
          created_at: o.created_at || o.createdAt,
          items: (o.items || []).map((it: any) => {
            // Calculate subtotal: base meal price * quantity + selected ingredients * quantity
            const baseMealPrice = it.meal_price ?? it.price ?? 0;
            const selectedIngredientsTotal = (it.selected_ingredients || []).reduce(
              (sum: number, ing: any) => sum + (ing.price || 0), 
              0
            );
            const itemSubtotal = it.subtotal ?? ((baseMealPrice + selectedIngredientsTotal) * (it.quantity || 1));
            
            return {
              meal_id: it.meal_id || it.meal?.id,
              quantity: it.quantity || 1,
              meal_name: it.meal_name || it.meal?.name || 'Meal',
              price: baseMealPrice,
              meal_price: baseMealPrice,
              subtotal: itemSubtotal,
              selected_ingredients: (it.selected_ingredients || []).map((ing: any) => ({
                ingredient_id: ing.ingredient_id || ing.id,
                name: ing.name || ing.ingredient_name,
                price: ing.price || 0,
              })),
              removed_ingredients: it.removed_ingredients || [],
              removed_ingredients_names: it.removed_ingredients_names || [],
            };
          }),
          customer_name: o.customer_name || o.customerName || 'Guest',
          customer_phone: o.customer_phone || o.customerPhone || '',
          delivery_address: o.delivery_address || o.deliveryAddress || '',
        };
      });
      
      console.log('Normalized orders:', normalized); // Debug log
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
              router.push('/menu');
            }
          }}
          onVerified={handleVerified}
          title="Verify Your Phone to View Orders"
          description="Please verify your phone number to access your order history"
        />
      </>
    );
  }

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleReorder = async (order: Order) => {
    const orderId = (order._id || order.id || '').toString();
    setReorderingId(orderId);
    
    try {
      // Add each item to cart with customizations
      for (const item of order.items) {
        // Simulate adding to cart (you'll need to integrate with your cart context)
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      toast.success(getTranslation('common', 'itemsAddedToCart', language) || 'Items added to cart!');
      router.push('/cart');
    } catch (error) {
      console.error('Failed to reorder:', error);
      toast.error(getTranslation('common', 'reorderFailed', language) || 'Failed to reorder');
    } finally {
      setReorderingId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success(getTranslation('common', 'orderCancelled', language) || 'Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error(getTranslation('common', 'cancelFailed', language) || 'Failed to cancel order');
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { 
        icon: Clock, 
        color: 'text-amber-700 dark:text-amber-400', 
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        borderColor: 'border-amber-200 dark:border-amber-900',
        label: getTranslation('orderStatus', 'PENDING', language) 
      },
      CONFIRMED: { 
        icon: CheckCircle, 
        color: 'text-blue-700 dark:text-blue-400', 
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-900',
        label: getTranslation('orderStatus', 'CONFIRMED', language) 
      },
      PREPARING: { 
        icon: Package, 
        color: 'text-purple-700 dark:text-purple-400', 
        bgColor: 'bg-purple-50 dark:bg-purple-950/30',
        borderColor: 'border-purple-200 dark:border-purple-900',
        label: getTranslation('orderStatus', 'PREPARING', language) 
      },
      READY: { 
        icon: CheckCircle, 
        color: 'text-emerald-700 dark:text-emerald-400', 
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-200 dark:border-emerald-900',
        label: getTranslation('orderStatus', 'READY', language) 
      },
      OUT_FOR_DELIVERY: { 
        icon: Truck, 
        color: 'text-cyan-700 dark:text-cyan-400', 
        bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
        borderColor: 'border-cyan-200 dark:border-cyan-900',
        label: getTranslation('orderStatus', 'OUT_FOR_DELIVERY', language) 
      },
      DELIVERED: { 
        icon: CheckCircle, 
        color: 'text-green-700 dark:text-green-400', 
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        borderColor: 'border-green-200 dark:border-green-900',
        label: getTranslation('orderStatus', 'DELIVERED', language) 
      },
      CANCELLED: { 
        icon: X, 
        color: 'text-red-700 dark:text-red-400', 
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        borderColor: 'border-red-200 dark:border-red-900',
        label: getTranslation('orderStatus', 'CANCELLED', language) 
      },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const getOrderTimeline = (status: string, orderType: string) => {
    // Steps vary by order type; delivery includes courier leg, others do not
    const deliverySteps = [
      { key: 'PENDING', label: 'Pending', icon: Clock },
      { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
      { key: 'PREPARING', label: 'Preparing', icon: Package },
      { key: 'READY', label: 'Ready', icon: CheckCircle },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
      { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
    ] as const;
    const pickupSteps = [
      { key: 'PENDING', label: 'Pending', icon: Clock },
      { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
      { key: 'PREPARING', label: 'Preparing', icon: Package },
      { key: 'READY', label: 'Ready', icon: CheckCircle },
      { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
    ] as const;

    const steps = orderType === 'DELIVERY' ? deliverySteps : pickupSteps;
    const statusOrder = steps.map(s => s.key as string);
    const idx = Math.max(0, statusOrder.indexOf(status));

    return steps.map((step, i) => ({
      ...step,
      completed: i <= idx,
      active: i === idx,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-muted/50 rounded-2xl w-1/3"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted/50 rounded w-32"></div>
                      <div className="h-6 bg-muted/50 rounded w-24"></div>
                    </div>
                    <div className="h-8 bg-muted/50 rounded-full w-28"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/50 rounded w-full"></div>
                    <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse"></div>
              <ShoppingBag className="relative mx-auto h-24 w-24 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
              {getTranslation('common', 'noOrdersYet', language)}
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              {getTranslation('common', 'noOrdersDescription', language)}
            </p>
            <Link href="/menu">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 py-6 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-200"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {getTranslation('common', 'menu', language)}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-4 py-1 sm:py-2 md:py-1 lg:py-2 pb-6 sm:pb-8 lg:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-2 sm:mb-2 md:mb-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-0.5 tracking-tight">
              {getTranslation('common', 'yourOrders', language)}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {orders.length} {orders.length === 1 ? getTranslation('common', 'orderSingular', language) : getTranslation('common', 'ordersPlural', language)} • {getTranslation('common', 'trackOrderHistory', language)}
            </p>
          </div>

          <div className="space-y-2 sm:space-y-2.5 md:space-y-2 lg:space-y-2">
            {orders.map((order) => {
              const statusConf = getStatusConfig(order.status);
              const StatusIcon = statusConf.icon;
              const orderId = (order._id || order.id || '').toString();
              // Shorten order number for display - show only last 8 characters
              const fullOrderNumber = order.order_number || orderId;
              const orderNumber = fullOrderNumber.length > 8 
                ? fullOrderNumber.slice(-8).toUpperCase() 
                : fullOrderNumber.toUpperCase();
              const locale = language === 'ar' ? 'ar-IL' : language === 'he' ? 'he-IL' : 'en-US';
              const createdDate = order.created_at ? new Date(order.created_at) : new Date();
              const isExpanded = expandedOrders.has(orderId);
              const timeline = getOrderTimeline(order.status, order.order_type);
              const activeIndex = Math.max(0, timeline.findIndex(s => s.active));
              const progressRatio = timeline.length > 1 ? (activeIndex / (timeline.length - 1)) : 0;
              const isReordering = reorderingId === orderId;
              
              return (
                <Card 
                  key={orderId} 
                  className="border border-border rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <CardHeader className="pb-2.5 sm:pb-3 p-3 sm:p-4 md:p-3 lg:p-3">
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Order Number & Date */}
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-semibold text-foreground text-base sm:text-lg tracking-tight truncate">
                            {orderNumber}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="whitespace-nowrap">{createdDate.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="whitespace-nowrap">{createdDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="hidden xs:flex items-center gap-1">
                            <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="truncate">{getTranslation('orderType', order.order_type, language)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border ${statusConf.borderColor} ${statusConf.bgColor} flex-shrink-0`}>
                        <StatusIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${statusConf.color}`} strokeWidth={2.5} />
                        <span className={`text-xs sm:text-sm font-semibold ${statusConf.color} whitespace-nowrap`}>
                          {statusConf.label}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 pt-0">
                    {/* Order Timeline - Only show if not cancelled/delivered */}
                    {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                      <div className="bg-muted/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 md:p-3 lg:p-3">
                        <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">{getTranslation('common', 'orderProgress', language)}</h4>
                        <div className={`flex items-center justify-between relative ${language === 'ar' || language === 'he' ? 'flex-row-reverse' : ''}`}>
                          {/* Progress Line */}
                          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" style={{ width: 'calc(100% - 40px)', marginInlineStart: '20px', marginInlineEnd: '20px' }}></div>
                          <div
                            className="absolute top-5 h-0.5 bg-primary transition-all duration-500"
                            style={
                              (language === 'ar' || language === 'he')
                                ? { right: 0, width: `calc((100% - 40px) * ${progressRatio})`, marginRight: '20px' }
                                : { left: 0, width: `calc((100% - 40px) * ${progressRatio})`, marginLeft: '20px' }
                            }
                          ></div>
                          
                          {timeline.map((step, idx) => {
                            const StepIcon = step.icon;
                            return (
                              <div key={step.key} className="flex flex-col items-center gap-1.5 sm:gap-2 relative z-10">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  step.completed 
                                    ? 'bg-primary border-primary text-primary-foreground' 
                                    : 'bg-background border-border text-muted-foreground'
                                }`}>
                                  <StepIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
                                </div>
                                <span className={`text-[10px] sm:text-xs text-center max-w-[50px] sm:max-w-[60px] leading-tight ${
                                  step.completed ? 'text-foreground font-medium' : 'text-muted-foreground'
                                }`}>
                                  {getTranslation('orderStatus', step.key, language)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick Summary */}
                    <div className="py-2 sm:py-2.5 md:py-2 border-y border-border">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>{order.items.length} {order.items.length === 1 ? getTranslation('common', 'item', language) : getTranslation('common', 'items', language)}</span>
                          </div>
                          {order.customer_name && order.customer_name !== 'Guest' && (
                            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                              <span>•</span>
                              <span className="font-medium truncate max-w-[120px]">{order.customer_name}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary tracking-tight">
                          {formatPrice(order.total, language)}
                        </div>
                      </div>
                      {order.order_type && (
                        <div className="text-xs text-muted-foreground">
                          <Package className="h-3 w-3 inline mr-1" />
                          {getTranslation('orderType', order.order_type, language)}
                        </div>
                      )}
                    </div>

                    {/* Expandable Order Details */}
                    {isExpanded && (
                      <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Order Items */}
                        <div className="space-y-2 sm:space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                              <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold flex-shrink-0">
                                      {item.quantity}
                                    </span>
                                    <span className="font-semibold text-foreground text-sm sm:text-base truncate">{item.meal_name || getTranslation('common', 'meal', language)}</span>
                                  </div>
                                  
                                  {/* Base meal price */}
                                  {typeof item.meal_price === 'number' && (
                                    <div className="text-[10px] sm:text-xs text-muted-foreground ml-6 sm:ml-8">
                                      {formatPrice(item.meal_price, language)} {getTranslation('common', 'each', language)}
                                    </div>
                                  )}

                                  {/* Added ingredients */}
                                  {item.selected_ingredients && item.selected_ingredients.length > 0 && (
                                    <div className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 ml-6 sm:ml-8 mt-1">
                                      <div className="flex items-start gap-1">
                                        <span className="font-semibold shrink-0">+</span>
                                        <div className="flex flex-wrap gap-1">
                                          {item.selected_ingredients.map((ing: any, ingIdx: number) => {
                                            const nm = ing.name || ing.ingredient_name || ing.ingredient_id || 'Ingredient';
                                            const pr = typeof ing.price === 'number' && ing.price > 0 ? ` (+${formatPrice(ing.price, language)})` : '';
                                            const ingredientsLength = item.selected_ingredients?.length || 0;
                                            return (
                                              <span key={ingIdx} className="inline-flex items-baseline">
                                                <span className="font-medium">{nm}</span>
                                                {pr && <span className="text-[9px] ml-0.5">{pr}</span>}
                                                {ingIdx < ingredientsLength - 1 && <span className="mx-1">•</span>}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Removed ingredients */}
                                  {item.removed_ingredients && item.removed_ingredients.length > 0 && (
                                    <div className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 ml-6 sm:ml-8 mt-1 flex items-start gap-1">
                                      <span className="font-semibold">−</span>
                                      <span className="line-clamp-1">{(item.removed_ingredients_names && item.removed_ingredients_names.length > 0
                                          ? item.removed_ingredients_names
                                          : item.removed_ingredients).join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-right flex-shrink-0">
                                  <div className="font-semibold text-foreground text-sm sm:text-base">
                                    {formatPrice(item.subtotal ?? ((item.meal_price || 0) * item.quantity || (item.price || 0)), language)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Additional Info */}
                        {(order.customer_phone || order.delivery_address) && (
                          <div className="space-y-1.5 sm:space-y-2">
                            {order.customer_phone && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 rounded-lg p-2 sm:p-3">
                                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{order.customer_phone}</span>
                              </div>
                            )}
                            {order.delivery_address && (
                              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 rounded-lg p-2 sm:p-3">
                                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                                <span className="flex-1 line-clamp-2">{order.delivery_address}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 sm:pt-2 md:pt-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleOrderExpanded(orderId)}
                        className="rounded-lg sm:rounded-xl hover:bg-muted/50 transition-colors text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden xs:inline">{getTranslation('common', 'hideDetails', language)}</span>
                            <span className="xs:hidden">{getTranslation('common', 'hideDetails', language)}</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden xs:inline">{getTranslation('common', 'viewDetails', language)}</span>
                            <span className="xs:hidden">{getTranslation('common', 'viewDetails', language)}</span>
                          </>
                        )}
                      </Button>

                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelOrder(orderId)}
                          className="rounded-lg sm:rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900 hover:border-red-300 dark:hover:border-red-800 transition-colors text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
                        >
                          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden xs:inline">{getTranslation('common', 'cancelOrder', language)}</span>
                          <span className="xs:hidden">Cancel</span>
                        </Button>
                      )}

                      {order.status !== 'CANCELLED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(order)}
                          disabled={isReordering}
                          className="rounded-lg sm:rounded-xl hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-colors text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
                        >
                          {isReordering ? (
                            <>
                              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 animate-spin" />
                              <span className="hidden xs:inline">{getTranslation('common', 'processing', language)}</span>
                              <span className="xs:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden xs:inline">{getTranslation('common', 'reorder', language)}</span>
                              <span className="xs:hidden">Reorder</span>
                            </>
                          )}
                        </Button>
                      )}
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