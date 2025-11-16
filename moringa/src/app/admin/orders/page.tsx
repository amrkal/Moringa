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
  order_type: string;
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
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-700', icon: Clock },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-500/10 text-blue-700', icon: CheckCircle },
    { value: 'PREPARING', label: 'Preparing', color: 'bg-purple-500/10 text-purple-700', icon: Package },
    { value: 'READY', label: 'Ready', color: 'bg-indigo-500/10 text-indigo-700', icon: CheckCircle },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for delivery', color: 'bg-cyan-500/10 text-cyan-700', icon: Truck },
    { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-500/10 text-green-700', icon: CheckCircle },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500/10 text-red-700', icon: XCircle },
  ];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/orders/' 
        : `/orders/?status=${statusFilter}`;
      const response = await api.get(url);
      const raw = response.data?.data || response.data || [];
      const list = Array.isArray(raw) ? raw : [];
      const normalized: Order[] = list.map((o: any) => ({
        id: o.id || o._id,
        order_number: o.order_number || (o.id || o._id || '').toString().slice(-6),
        user_id: o.user_id,
        status: o.status,
        order_type: o.order_type || 'DELIVERY',
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

  // Filter status options based on order type
  const getAvailableStatuses = (orderType: string) => {
    if (orderType === 'DINE_IN' || orderType === 'TAKE_AWAY') {
      // Exclude OUT_FOR_DELIVERY for non-delivery orders
      return statusOptions.filter(opt => opt.value !== 'OUT_FOR_DELIVERY');
    }
    return statusOptions;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded-xl w-64 mb-2" />
            <div className="h-4 bg-muted rounded w-48" />
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
                <div className="h-6 bg-muted rounded w-20 animate-pulse" />
                <div className="h-6 bg-muted rounded flex-1 animate-pulse" />
                <div className="h-6 bg-muted rounded w-24 animate-pulse" />
                <div className="h-6 bg-muted rounded w-32 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-5 relative">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">{getTranslation('admin', 'ordersManagement', language)}</h1>
            <p className="mt-2 text-muted-foreground">Manage and track all customer orders • {orders.length} total</p>
          </div>
          {/* Gradient accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-card text-foreground shadow-sm font-medium"
            >
              <option value="all">All Orders</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-premium overflow-hidden relative">
          {/* Decorative gradient accent positioned above the table to avoid invalid thead children */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gradient-to-r from-muted/50 to-muted/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Actions
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
                    <tr className="hover:bg-muted/30 transition-all cursor-pointer group" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-foreground">
                          #{order.order_number?.split('-').pop() || order.order_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {utilFormatDate(new Date(order.created_at), language)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{order.phone || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {order.delivery_address || 'No address'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                        {formatCurrency(order.total_amount, language)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className="px-3 py-1.5 border border-border rounded-xl bg-card text-foreground text-xs font-medium hover:bg-muted transition-all"
                          >
                            {getAvailableStatuses(order.order_type).map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="p-2 rounded-lg border-2 border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all hover:scale-110">
                          {expandedOrderId === order.id ? '▼' : '▶'}
                        </button>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && order.items && order.items.length > 0 && (
                      <tr key={`${order.id}-details`}>
                        <td colSpan={6} className="px-6 py-6 bg-gradient-to-r from-muted/20 to-muted/5">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                              <Package size={16} className="text-primary" />
                              Order Items ({order.items.length})
                            </h4>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="bg-card rounded-xl border-l-4 border-primary p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold text-sm">
                                      {item.quantity}
                                    </span>
                                    <span className="font-semibold text-foreground">{item.meal_name}</span>
                                  </div>
                                  <span className="font-bold text-foreground">
                                    {formatCurrency(item.subtotal || (item.meal_price || 0) * item.quantity, language)}
                                  </span>
                                </div>
                                
                                {/* Show base price per unit */}
                                {typeof item.meal_price === 'number' && (
                                  <div className="text-xs text-muted-foreground mt-2 ml-11">
                                    Base price: {formatCurrency(item.meal_price, language)} each
                                  </div>
                                )}

                                {/* Show added ingredients with prices */}
                                {item.selected_ingredients && item.selected_ingredients.length > 0 && (
                                  <div className="text-xs mt-2 ml-11 flex items-start gap-2">
                                    <span className="text-green-600 font-medium">+ Added:</span>
                                    <span className="text-muted-foreground">
                                      {item.selected_ingredients
                                        .map((ing: any) => {
                                          const nm = ing.name || ing.ingredient_name || ing.ingredient_id;
                                          const pr = typeof ing.price === 'number' ? ` (+${formatCurrency(ing.price, language)})` : '';
                                          return `${nm}${pr}`;
                                        })
                                        .join(', ')}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Show removed ingredients */}
                                {item.removed_ingredients && item.removed_ingredients.length > 0 && (
                                  <div className="text-xs mt-2 ml-11 flex items-start gap-2">
                                    <span className="text-red-600 font-medium">- Removed:</span>
                                    <span className="text-muted-foreground">
                                      {(item.removed_ingredients_names && item.removed_ingredients_names.length > 0
                                        ? item.removed_ingredients_names
                                        : item.removed_ingredients).join(', ')}
                                    </span>
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
