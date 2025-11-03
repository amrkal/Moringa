'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getLocalizedText } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, CreditCard, Truck, Store, Users, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useAuth } from '@/contexts/AuthContext';
import PhoneVerification from '@/components/PhoneVerification';
import api from '@/lib/api';
import { useNotifications } from '@/contexts/NotificationContext';

type OrderType = 'DELIVERY' | 'DINE_IN' | 'TAKEAWAY';
type PaymentMethod = 'CASH' | 'CARD' | 'WALLET';

interface Settings {
  accept_delivery: boolean;
  accept_dine_in: boolean;
  accept_takeaway: boolean;
  accept_cash: boolean;
  accept_card: boolean;
  accept_mobile_money: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isAuthenticated, user, verifyPhone } = useAuth();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const { addNotification } = useNotifications();
  const [settings, setSettings] = useState<Settings>({
    accept_delivery: true,
    accept_dine_in: true,
    accept_takeaway: true,
    accept_cash: true,
    accept_card: true,
    accept_mobile_money: false,
  });
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data) {
          const newSettings = {
            accept_delivery: response.data.accept_delivery ?? true,
            accept_dine_in: response.data.accept_dine_in ?? true,
            accept_takeaway: response.data.accept_takeaway ?? true,
            accept_cash: response.data.accept_cash ?? true,
            accept_card: response.data.accept_card ?? true,
            accept_mobile_money: response.data.accept_mobile_money ?? false,
          };
          setSettings(newSettings);

          // Set default order type to the first available option
          if (newSettings.accept_delivery) {
            setOrderType('DELIVERY');
          } else if (newSettings.accept_takeaway) {
            setOrderType('TAKEAWAY');
          } else if (newSettings.accept_dine_in) {
            setOrderType('DINE_IN');
          }

          // Set default payment method to the first available option
          if (newSettings.accept_card) {
            setPaymentMethod('CARD');
          } else if (newSettings.accept_cash) {
            setPaymentMethod('CASH');
          } else if (newSettings.accept_mobile_money) {
            setPaymentMethod('WALLET');
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Use defaults if API fails
        setOrderType('DELIVERY');
        setPaymentMethod('CARD');
      }
    };

    loadSettings();
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-muted to-accent/10 rounded-full flex items-center justify-center shadow-xl">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            {getTranslation('common', 'emptyCart', language)}
          </h1>
          <p className="text-muted-foreground mb-8">
            {getTranslation('common', 'startShopping', language)}
          </p>
          <Link href="/menu">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all px-8">
              <ShoppingBag className="mr-2 h-5 w-5" />
              {getTranslation('common', 'menu', language)}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotalAmount();
  const deliveryFee = orderType === 'DELIVERY' ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const placeOrder = async () => {
    // Double-check authentication before placing order
    if (!isAuthenticated || !user?.phone) {
      toast.error(getTranslation('common', 'pleaseVerifyPhone', language) || 'Please verify your phone number');
      setShowVerification(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug: Log raw cart items
      console.log('[Checkout] Raw cart items:', items.map(it => ({ 
        mealId: it.mealId, 
        name: it.meal.name, 
        type: typeof it.meal.name,
        isObject: typeof it.meal.name === 'object',
        value: it.meal.name 
      })));

      // Build order payload according to backend schema
      const mapOrderType = (ot: OrderType | null): 'DELIVERY' | 'DINE_IN' | 'TAKE_AWAY' => {
        if (ot === 'TAKEAWAY') return 'TAKE_AWAY';
        return (ot || 'DELIVERY') as any;
      };
      const mapPaymentMethod = (pm: PaymentMethod): 'CASH' | 'CARD' | 'MOBILE_MONEY' => {
        if (pm === 'WALLET') return 'MOBILE_MONEY';
        return pm as any;
      };

      // Runtime fix: forcibly convert all cart item meal.name fields to string (English or fallback)
      const fixedItems = items.map((it) => {
        let mealName = it.meal.name;
        if (typeof mealName === 'object' && mealName !== null) {
          const nameObj = mealName as any;
          mealName = nameObj.en || nameObj.ar || nameObj.he || '';
          console.log('[Checkout] Converting meal name from object to string:', nameObj, '→', mealName);
        }
        return {
          ...it,
          meal: {
            ...it.meal,
            name: mealName,
          },
        };
      });

      console.log('[Checkout] Fixed items:', fixedItems.map(it => ({ mealId: it.mealId, name: it.meal.name, type: typeof it.meal.name })));

      const payload = {
        order_type: mapOrderType(orderType),
        payment_method: mapPaymentMethod(paymentMethod),
        delivery_address: orderType === 'DELIVERY' ? deliveryAddress : undefined,
        phone_number: user.phone,
        special_instructions: specialInstructions || undefined,
        items: fixedItems.map((it) => {
          const perItemPrice = it.meal.price + (it.selectedIngredients || []).reduce((sum, si) => sum + (si.price || 0), 0);
          // meal.name should already be a string from fixedItems, but double-check
          let mealName = it.meal.name;
          if (typeof mealName === 'object' && mealName !== null) {
            console.error('[Checkout] ERROR: meal.name is still an object!', mealName);
            mealName = (mealName as any).en || (mealName as any).ar || (mealName as any).he || '';
          }
          if (typeof mealName !== 'string') {
            console.error('[Checkout] ERROR: meal_name is not a string!', mealName, typeof mealName);
            mealName = '';
          }
          return {
            meal_id: it.mealId,
            meal_name: mealName,
            quantity: it.quantity,
            price: perItemPrice,
            special_instructions: it.specialInstructions || undefined,
            selected_ingredients: (it.selectedIngredients || []).map((si) => ({ ingredient_id: si.id })),
            removed_ingredients: (it.removedIngredients || []).map((ri: any) => typeof ri === 'string' ? ri : ri.id),
          };
        }),
      };

      // Final verification: ensure all meal_name values are strings
      payload.items.forEach((item, idx) => {
        if (typeof item.meal_name !== 'string') {
          console.error(`[Checkout] ERROR at item ${idx}: meal_name is not a string!`, item.meal_name, typeof item.meal_name);
        }
      });
      
      console.log('[Checkout] Final payload:', JSON.stringify(payload, null, 2));
      
      // Stringify and parse to ensure clean serialization
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      console.log('[Checkout] Clean payload after JSON round-trip:', cleanPayload);
      
      const res = await api.post('/orders', cleanPayload);
      if (res.status >= 200 && res.status < 300) {
        const orderData = res.data;
        toast.success('Order placed successfully!');
        
        // Trigger notification for admin - show only trailing numeric digits (up to 6)
        const rawOrderNumber = orderData.order_number || String(orderData.id || orderData._id || '');
        const digitsMatch = String(rawOrderNumber).match(/(\d+)/g);
        const trailing = digitsMatch && digitsMatch.length ? digitsMatch[digitsMatch.length - 1] : String(rawOrderNumber).replace(/\D/g, '');
        const orderNumber = (trailing || String(rawOrderNumber)).slice(-6) || 'N/A';
        const totalAmount = getTotalAmount();
        
        addNotification({
          orderId: orderData.id || orderData._id,
          orderNumber: orderNumber,
          customerName: user.name || user.phone,
          total: totalAmount,
        });
        
        clearCart();
        router.push('/orders');
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For delivery, require address
    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      toast.error(getTranslation('common', 'pleaseEnterAddress', language) || 'Please enter your delivery address');
      return;
    }

    // If not authenticated, show verification popup
    if (!isAuthenticated) {
      setShowVerification(true);
      return;
    }

    // Place the order
    await placeOrder();
  };

  const handleVerified = async (phone: string) => {
    // User is now verified and logged in
    setShowVerification(false);
    toast.success(getTranslation('common', 'phoneVerified', language));
    
    // Check if cart has any items with object meal names and clear if found
    const hasObjectNames = items.some(item => typeof item.meal.name === 'object');
    if (hasObjectNames) {
      console.error('[Checkout] Cart has items with object meal names after verification. Clearing cart...');
      clearCart();
      toast.error('Your cart was cleared due to a data format issue. Please add items again.');
      return;
    }
    
    // Automatically place the order after verification
    await placeOrder();
  };

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
  <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/cart">
              <Button variant="ghost" className="mb-4 hover:bg-accent rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {getTranslation('common', 'cart', language)}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{getTranslation('common', 'checkout', language)}</h1>
            <p className="text-muted-foreground mt-2">Complete your order in a few easy steps</p>
          </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Order Type */}
              <Card className="border-border/50 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                <CardHeader>
                  <CardTitle className="text-lg font-bold tracking-tight">{getTranslation('common', 'orderType', language)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid gap-4 ${
                    [settings.accept_delivery, settings.accept_dine_in, settings.accept_takeaway].filter(Boolean).length === 3
                      ? 'grid-cols-3'
                      : [settings.accept_delivery, settings.accept_dine_in, settings.accept_takeaway].filter(Boolean).length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-1'
                  }`}>
                    {settings.accept_delivery && (
                      <button
                        type="button"
                        onClick={() => setOrderType('DELIVERY')}
                        className={`p-5 rounded-xl border-2 text-center transition-all group relative overflow-hidden ${
                          orderType === 'DELIVERY' 
                            ? 'border-primary bg-primary/10 text-primary shadow-md scale-105' 
                            : 'border-border hover:border-primary/50 hover:shadow-sm hover:scale-105'
                        }`}
                      >
                        {orderType === 'DELIVERY' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-shimmer" />
                        )}
                        <Truck className={`mx-auto h-10 w-10 mb-2 transition-transform ${orderType === 'DELIVERY' ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <div className="font-semibold text-base relative">{getTranslation('common', 'delivery', language)}</div>
                        <div className="text-sm text-muted-foreground relative">30-45 {getTranslation('common', 'minutes', language)}</div>
                      </button>
                    )}
                    
                    {settings.accept_dine_in && (
                      <button
                        type="button"
                        onClick={() => setOrderType('DINE_IN')}
                        className={`p-5 rounded-xl border-2 text-center transition-all group relative overflow-hidden ${
                          orderType === 'DINE_IN' 
                            ? 'border-primary bg-primary/10 text-primary shadow-md scale-105' 
                            : 'border-border hover:border-primary/50 hover:shadow-sm hover:scale-105'
                        }`}
                      >
                        {orderType === 'DINE_IN' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-shimmer" />
                        )}
                        <Users className={`mx-auto h-10 w-10 mb-2 transition-transform ${orderType === 'DINE_IN' ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <div className="font-semibold text-base relative">{getTranslation('common', 'dineIn', language)}</div>
                        <div className="text-sm text-muted-foreground relative">{getTranslation('common', 'reserveTable', language)}</div>
                      </button>
                    )}
                    
                    {settings.accept_takeaway && (
                      <button
                        type="button"
                        onClick={() => setOrderType('TAKEAWAY')}
                        className={`p-5 rounded-xl border-2 text-center transition-all group relative overflow-hidden ${
                          orderType === 'TAKEAWAY' 
                            ? 'border-primary bg-primary/10 text-primary shadow-md scale-105' 
                            : 'border-border hover:border-primary/50 hover:shadow-sm hover:scale-105'
                        }`}
                      >
                        {orderType === 'TAKEAWAY' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-shimmer" />
                        )}
                        <Store className={`mx-auto h-10 w-10 mb-2 transition-transform ${orderType === 'TAKEAWAY' ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <div className="font-semibold text-base relative">{getTranslation('common', 'takeaway', language)}</div>
                        <div className="text-sm text-muted-foreground relative">15-20 {getTranslation('common', 'minutes', language)}</div>
                      </button>
                    )}
                  </div>
                  
                  {!settings.accept_delivery && !settings.accept_dine_in && !settings.accept_takeaway && (
                    <div className="p-4 bg-warning-soft border border-warning rounded-lg text-center">
                      <p className="text-sm text-warning font-medium">
                        No order types are currently available. Please contact the restaurant.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Address - Only for Delivery */}
              {orderType === 'DELIVERY' && (
                <Card className="border-border/50 rounded-2xl overflow-hidden animate-fade-in" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">{getTranslation('common', 'deliveryInformation', language)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {getTranslation('common', 'deliveryAddressLabel', language)} *
                      </label>
                      <Textarea
                        placeholder={getTranslation('common', 'enterAddress', language)}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {getTranslation('common', 'specialInstructions', language)} ({getTranslation('common', 'optional', language)})
                      </label>
                      <Textarea
                        placeholder={getTranslation('common', 'addSpecialInstructions', language)}
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method - Only for Delivery */}
              {orderType === 'DELIVERY' && (
                <Card className="border-border/50 rounded-2xl overflow-hidden animate-fade-in" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">{getTranslation('common', 'paymentMethod', language)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {settings.accept_card && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CARD')}
                          className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all relative overflow-hidden group ${
                            paymentMethod === 'CARD' 
                              ? 'border-primary bg-primary/10 shadow-md' 
                              : 'border-border hover:border-primary/50 hover:shadow-sm'
                          }`}
                        >
                          {paymentMethod === 'CARD' && (
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                          )}
                          <div className={`p-3 rounded-lg ${paymentMethod === 'CARD' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'} transition-all`}>
                            <CreditCard className="h-6 w-6" />
                          </div>
                          <div className="flex-1 relative">
                            <div className="font-semibold">{getTranslation('common', 'card', language)}</div>
                            <div className="text-sm text-muted-foreground">{getTranslation('common', 'payByCard', language)}</div>
                          </div>
                          {paymentMethod === 'CARD' && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            </div>
                          )}
                        </button>
                      )}
                      
                      {settings.accept_cash && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CASH')}
                          className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all relative overflow-hidden group ${
                            paymentMethod === 'CASH' 
                              ? 'border-primary bg-primary/10 shadow-md' 
                              : 'border-border hover:border-primary/50 hover:shadow-sm'
                          }`}
                        >
                          {paymentMethod === 'CASH' && (
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                          )}
                          <div className={`p-3 rounded-lg ${paymentMethod === 'CASH' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'} transition-all font-bold text-lg flex items-center justify-center w-12 h-12`}>
                            $
                          </div>
                          <div className="flex-1 relative">
                            <div className="font-semibold">{getTranslation('common', 'cash', language)}</div>
                            <div className="text-sm text-muted-foreground">{getTranslation('common', 'payOnDelivery', language)}</div>
                          </div>
                          {paymentMethod === 'CASH' && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            </div>
                          )}
                        </button>
                      )}
                      
                      {settings.accept_mobile_money && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('WALLET')}
                          className={`w-full p-4 rounded-lg border-2 text-left flex items-center space-x-3 transition-all ${
                            paymentMethod === 'WALLET' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="h-6 w-6 flex items-center justify-center bg-accent/80 rounded text-accent-foreground font-bold text-sm">📱</div>
                          <div>
                            <div className="font-medium">{getTranslation('common', 'wallet', language)}</div>
                            <div className="text-sm text-muted-foreground">{getTranslation('common', 'payByWallet', language)}</div>
                          </div>
                        </button>
                      )}
                    </div>
                    
                    {!settings.accept_cash && !settings.accept_card && !settings.accept_mobile_money && (
                      <div className="p-4 bg-warning-soft border border-warning rounded-lg text-center">
                        <p className="text-sm text-warning font-medium">
                          No payment methods are currently available. Please contact the restaurant.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Special Instructions for Takeaway/Dine-in */}
              {(orderType === 'TAKEAWAY' || orderType === 'DINE_IN') && (
                <Card className="border-border/50 rounded-2xl overflow-hidden animate-fade-in" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">{getTranslation('common', 'specialInstructions', language)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder={getTranslation('common', 'addSpecialInstructions', language)}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 shadow-lg border-border">
                <CardHeader className="bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    {getTranslation('common', 'orderSummary', language)}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-4">
                  {/* Items */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm gap-2">
                        <span className="flex-1 min-w-0">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold mr-2">{item.quantity}</span>
                          <span className="line-clamp-1">{item.meal.name}</span>
                        </span>
                        <span className="font-semibold tabular-nums shrink-0">{formatPrice(item.totalPrice, language)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{getTranslation('common', 'subtotal', language)}</span>
                      <span className="font-semibold tabular-nums">{formatPrice(subtotal, language)}</span>
                    </div>
                    
                    {orderType === 'DELIVERY' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{getTranslation('common', 'deliveryFee', language)}</span>
                        <span className="font-semibold tabular-nums">{formatPrice(deliveryFee, language)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{getTranslation('common', 'tax', language)}</span>
                      <span className="font-semibold tabular-nums">{formatPrice(tax, language)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">{getTranslation('common', 'total', language)}</span>
                      <span className="text-2xl font-bold text-primary tabular-nums">{formatPrice(total, language)}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardContent className="bg-muted/20 pt-0">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || (orderType === 'DELIVERY' && !deliveryAddress)}
                  >
                    {isSubmitting 
                      ? `${getTranslation('common', 'placeOrder', language)}...` 
                      : isAuthenticated 
                        ? `${getTranslation('common', 'placeOrder', language)} - ${formatPrice(total, language)}`
                        : orderType === 'DELIVERY'
                          ? `${getTranslation('common', 'continueToVerification', language)} - ${formatPrice(total, language)}`
                          : `${getTranslation('common', 'verifyPhone', language)} & ${getTranslation('common', 'placeOrder', language)} - ${formatPrice(total, language)}`
                    }
                  </Button>
                  {!isAuthenticated && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      {orderType === 'DELIVERY' 
                        ? getTranslation('common', 'verifyToViewOrders', language)
                        : getTranslation('common', 'verifyToViewOrders', language)
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
        </div>
      </div>
      
      {/* Phone Verification Dialog */}
      <PhoneVerification
        open={showVerification}
        onOpenChange={setShowVerification}
        onVerified={handleVerified}
        title="Verify Your Phone to Complete Order"
        description="We need to verify your phone number before placing your order"
      />
    </div>
  );
}