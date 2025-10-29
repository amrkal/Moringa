'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';
import { Clock, CheckCircle, Truck, X } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  orderType: 'DELIVERY' | 'DINE_IN' | 'TAKE_AWAY';
  totalAmount: number;
  createdAt: string;
  estimatedDeliveryTime?: string;
  items: Array<{
    id: string;
    quantity: number;
    mealName: string;
    price: number;
  }>;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-12345',
    status: 'OUT_FOR_DELIVERY',
    orderType: 'DELIVERY',
    totalAmount: 28.98,
    createdAt: new Date().toISOString(),
    estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    items: [
      { id: '1', quantity: 1, mealName: 'Classic Burger', price: 15.99 },
      { id: '2', quantity: 2, mealName: 'Artisan Coffee', price: 4.99 },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-12344',
    status: 'DELIVERED',
    orderType: 'TAKE_AWAY',
    totalAmount: 12.99,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: '3', quantity: 1, mealName: 'Fluffy Pancakes', price: 12.99 },
    ],
  },
];

const statusConfig = {
  PENDING: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Order Received' },
  CONFIRMED: { icon: CheckCircle, color: 'text-blue-600 bg-blue-100', label: 'Confirmed' },
  PREPARING: { icon: Clock, color: 'text-orange-600 bg-orange-100', label: 'Preparing' },
  READY: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Ready for Pickup' },
  OUT_FOR_DELIVERY: { icon: Truck, color: 'text-blue-600 bg-blue-100', label: 'Out for Delivery' },
  DELIVERED: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Delivered' },
  CANCELLED: { icon: X, color: 'text-red-600 bg-red-100', label: 'Cancelled' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Simulate loading orders
    setOrders(mockOrders);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h1>
          <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet.</p>
          <Button size="lg">Browse Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Order #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {formatDate(new Date(order.createdAt))} • {order.orderType.replace('_', ' ')}
                      </p>
                    </div>
                    
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status].color}`}>
                      <StatusIcon className="mr-1 h-4 w-4" />
                      {statusConfig[order.status].label}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Items Ordered</h4>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.mealName}</span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Order Total */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold text-lg text-green-600">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                    
                    {/* Estimated Delivery Time */}
                    {order.estimatedDeliveryTime && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Estimated {order.orderType === 'DELIVERY' ? 'delivery' : 'pickup'} time:</strong>{' '}
                          {formatDate(new Date(order.estimatedDeliveryTime))}
                        </p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm">
                        Track Order
                      </Button>
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}