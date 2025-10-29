'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, CreditCard, Truck, Store, Users } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type OrderType = 'DELIVERY' | 'DINE_IN' | 'TAKE_AWAY';
type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Items to Checkout</h1>
          <p className="text-gray-600 mb-6">Your cart is empty. Add some items first.</p>
          <Link href="/menu">
            <Button size="lg">Browse Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotalAmount();
  const deliveryFee = orderType === 'DELIVERY' ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate order submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Order placed successfully!');
      clearCart();
      router.push('/orders');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/cart">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Order Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setOrderType('DELIVERY')}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        orderType === 'DELIVERY' 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Truck className="mx-auto h-8 w-8 mb-2" />
                      <div className="font-medium">Delivery</div>
                      <div className="text-sm text-gray-500">30-45 min</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setOrderType('DINE_IN')}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        orderType === 'DINE_IN' 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Users className="mx-auto h-8 w-8 mb-2" />
                      <div className="font-medium">Dine In</div>
                      <div className="text-sm text-gray-500">Reserve table</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setOrderType('TAKE_AWAY')}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        orderType === 'TAKE_AWAY' 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Store className="mx-auto h-8 w-8 mb-2" />
                      <div className="font-medium">Take Away</div>
                      <div className="text-sm text-gray-500">15-20 min</div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      We&apos;ll send SMS/WhatsApp verification and updates
                    </p>
                  </div>

                  {orderType === 'DELIVERY' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Delivery Address *
                      </label>
                      <Textarea
                        placeholder="Enter your full address including apartment/unit number"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        rows={3}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Special Instructions (Optional)
                    </label>
                    <Textarea
                      placeholder="Any special requests, dietary notes, or delivery instructions"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`w-full p-4 rounded-lg border-2 text-left flex items-center space-x-3 transition-all ${
                        paymentMethod === 'CARD' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="h-6 w-6" />
                      <div>
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-gray-500">Secure payment</div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`w-full p-4 rounded-lg border-2 text-left flex items-center space-x-3 transition-all ${
                        paymentMethod === 'CASH' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-6 w-6 flex items-center justify-center bg-green-100 rounded text-green-600 font-bold text-sm">$</div>
                      <div>
                        <div className="font-medium">Cash</div>
                        <div className="text-sm text-gray-500">Pay on delivery/pickup</div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('MOBILE_MONEY')}
                      className={`w-full p-4 rounded-lg border-2 text-left flex items-center space-x-3 transition-all ${
                        paymentMethod === 'MOBILE_MONEY' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-6 w-6 flex items-center justify-center bg-blue-100 rounded text-blue-600 font-bold text-sm">📱</div>
                      <div>
                        <div className="font-medium">Mobile Money</div>
                        <div className="text-sm text-gray-500">Pay via mobile wallet</div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.meal.name}</span>
                        <span>{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  {orderType === 'DELIVERY' && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">{formatPrice(total)}</span>
                  </div>
                </CardContent>
                
                <CardContent>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting || !phoneNumber || (orderType === 'DELIVERY' && !deliveryAddress)}
                  >
                    {isSubmitting ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}