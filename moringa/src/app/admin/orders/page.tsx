'use client';

import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/format';
import { formatDate as utilFormatDate } from '@/lib/utils';

interface OrderItemIngredient {
  ingredient_id: string;
  name?: string; // backend returns 'name'
  ingredient_name?: string; // legacy fallback
  price?: number;
}

interface OrderItem {
  meal_id: string;
  meal_name?: string;
  quantity: number;
  price?: number;
  meal_price?: number;
  subtotal?: number;
  selected_ingredients?: OrderItemIngredient[];
  removed_ingredients?: string[];
  removed_ingredients_names?: string[];
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  delivery_address?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  // Inline dropdown change; no modal needed

  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: 'bg-accent/10 text-accent', icon: Clock },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-primary/10 text-primary', icon: CheckCircle },
    { value: 'PREPARING', label: 'Preparing', color: 'bg-primary/20 text-primary', icon: Package },
    { value: 'READY', label: 'Ready', color: 'bg-primary/10 text-primary', icon: CheckCircle },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for delivery', color: 'bg-primary/10 text-primary', icon: Truck },
    { value: 'DELIVERED', label: 'Delivered', color: 'bg-primary/10 text-primary', icon: CheckCircle },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  ];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/orders' 
        : `/orders?status=${statusFilter}`;
      const response = await api.get(url);
      const raw = response.data?.data || response.data || [];
      const list = Array.isArray(raw) ? raw : [];
      const normalized: Order[] = list.map((o: any) => ({
        id: o.id || o._id,
        order_number: o.order_number || (o.id || o._id || '').toString().slice(-6),
        user_id: o.user_id,
        status: o.status,
        total_amount: o.total_amount ?? o.total ?? 0,
        delivery_address: o.delivery_address,
        phone: o.customer_phone || o.phone,
        created_at: o.created_at,
        updated_at: o.updated_at,
        items: (o.items || []).map((it: any) => ({
          meal_id: it.meal_id,
          meal_name: it.meal_name || it.meal?.name || 'Meal',
          quantity: it.quantity,
          price: it.price,
          meal_price: it.meal_price,
          subtotal: it.subtotal,
          selected_ingredients: it.selected_ingredients || [],
          removed_ingredients: it.removed_ingredients || [],
          removed_ingredients_names: it.removed_ingredients_names || [],
        })),
      }));
      setOrders(normalized);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    if (!orderId) {
      toast.error('Missing order id');
      return;
    }
    try {
      await api.put(`/orders/${orderId}`, { status });
      toast.success('Order status updated');
      // Optimistic update
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update order status');
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    if (!statusOption) return null;
    
    const Icon = statusOption.icon;
    return (
      <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusOption.color}`}>
        <Icon size={14} />
        {statusOption.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{getTranslation('admin', 'loading', language)}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">{getTranslation('admin', 'ordersManagement', language)}</h1>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-foreground"
            >
              <option value="all">{getTranslation('admin', 'allOrders', language)}</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('admin', 'orderNumberShort', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('admin', 'date', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('admin', 'customer', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('admin', 'total', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('admin', 'status', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('admin', 'actions', language)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {getTranslation('admin', 'noOrdersFound', language)}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-muted/50 cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {order.order_number?.split('-').pop() || order.order_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {utilFormatDate(new Date(order.created_at), language)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">{order.phone}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {order.delivery_address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {formatCurrency(order.total_amount, language)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.status)}
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className="px-2 py-1 border border-border rounded-md bg-card text-foreground text-xs"
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary hover:text-primary/80">
                          {expandedOrderId === order.id ? '▼' : '▶'}
                        </button>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && order.items && order.items.length > 0 && (
                      <tr key={`${order.id}-details`}>
                        <td colSpan={6} className="px-6 py-4 bg-muted/30">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm mb-2">Order Items:</h4>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="border-l-2 border-primary pl-4 py-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">{item.quantity}x {item.meal_name}</span>
                                  <span>{formatCurrency(item.subtotal || (item.meal_price || 0) * item.quantity, language)}</span>
                                </div>
                                
                                {/* Show base price per unit */}
                                {typeof item.meal_price === 'number' && (
                                  <div className="text-[10px] text-muted-foreground mt-1 ml-4">
                                    Base: {formatCurrency(item.meal_price, language)}
                                  </div>
                                )}

                                {/* Show added ingredients with prices */}
                                {item.selected_ingredients && item.selected_ingredients.length > 0 && (
                                  <div className="text-xs text-success mt-1 ml-4">
                                    + Added: {item.selected_ingredients
                                      .map((ing: any) => {
                                        const nm = ing.name || ing.ingredient_name || ing.ingredient_id;
                                        const pr = typeof ing.price === 'number' ? ` (${formatCurrency(ing.price, language)})` : '';
                                        return `${nm}${pr}`;
                                      })
                                      .join(', ')}
                                  </div>
                                )}
                                
                                {/* Show removed ingredients */}
                                {item.removed_ingredients && item.removed_ingredients.length > 0 && (
                                  <div className="text-xs text-destructive mt-1">
                                    - Removed: {(item.removed_ingredients_names && item.removed_ingredients_names.length > 0
                                        ? item.removed_ingredients_names
                                        : item.removed_ingredients).join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline update replaces modal */}
    </AdminLayout>
  );
}
