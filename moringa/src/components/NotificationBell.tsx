'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Eye, Volume2, VolumeX, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatCurrency } from '@/lib/format';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'today' | 'week';

export function NotificationBell() {
  const { language } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  // Load sound preference
  useEffect(() => {
    const enabled = localStorage.getItem('notificationSound') === 'true' || localStorage.getItem('enableNotificationSound') === 'true';
    setSoundEnabled(enabled);
  }, []);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('notificationSound', newValue.toString());
    toast.success(newValue ? 'Sound enabled' : 'Sound disabled', { duration: 2000 });
  };

  const toggleNotificationExpand = (notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!orderId) return;
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/orders/${orderId}`, { status });
      toast.success(`Order marked as ${status.toLowerCase().replace('_', ' ')}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatOrderNumber = (value: any) => {
    const s = String(value ?? '');
    const match = s.match(/(\d+)/g);
    const digits = match && match.length ? match[match.length - 1] : s.replace(/\D/g, '');
    if (!digits) return s ? s.slice(-6) : '';
    return digits.slice(-6);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filterNotifications = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    return notifications.filter(n => {
      if (filter === 'today') {
        return new Date(n.timestamp) >= todayStart;
      }
      if (filter === 'week') {
        return new Date(n.timestamp) >= weekStart;
      }
      return true; // 'all'
    });
  };

  const filtered = filterNotifications();

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-muted transition-all hover:scale-110"
        aria-label={`Notifications${unreadCount > 0 ? ` - ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell size={22} className="text-foreground" strokeWidth={2} aria-hidden="true" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop - Click outside to close */}
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div 
            className="absolute right-0 mt-2 w-96 bg-[hsl(var(--card))] border border-border rounded-2xl shadow-2xl z-[70] animate-in slide-in-from-top-4 duration-200"
            role="dialog"
            aria-label="Notification panel"
            aria-modal="false"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Order Notifications</h3>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Sound Toggle */}
                  <button
                    onClick={toggleSound}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label={soundEnabled ? 'Disable notification sound' : 'Enable notification sound'}
                    aria-pressed={soundEnabled}
                  >
                    {soundEnabled ? (
                      <Volume2 size={18} className="text-primary" aria-hidden="true" />
                    ) : (
                      <VolumeX size={18} className="text-muted-foreground" aria-hidden="true" />
                    )}
                  </button>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      <Check size={14} />
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 bg-background rounded-lg p-1" role="tablist" aria-label="Filter notifications">
                <button
                  onClick={() => setFilter('all')}
                  role="tab"
                  aria-selected={filter === 'all'}
                  aria-controls="notifications-list"
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === 'all' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('today')}
                  role="tab"
                  aria-selected={filter === 'today'}
                  aria-controls="notifications-list"
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === 'today' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setFilter('week')}
                  role="tab"
                  aria-selected={filter === 'week'}
                  aria-controls="notifications-list"
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === 'week' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  This Week
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div 
              className="max-h-96 overflow-y-auto"
              id="notifications-list"
              role="tabpanel"
              aria-label="Notification list"
            >
              {filtered.length === 0 ? (
                <div className="p-8 text-center" role="status">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-3" strokeWidth={1.5} aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">
                    {filter === 'all' ? 'No notifications yet' : `No notifications ${filter === 'today' ? 'today' : 'this week'}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {filter === 'all' ? 'New orders will appear here' : 'Try viewing all notifications'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          !notification.read ? 'bg-primary' : 'bg-muted'
                        }`}>
                          <Bell size={18} className={
                            !notification.read ? 'text-primary-foreground' : 'text-muted-foreground'
                          } />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <Link
                                href={`/admin/orders/${notification.orderId}`}
                                className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline transition-colors inline-block"
                                onClick={() => {
                                  markAsRead(notification.id);
                                  setIsOpen(false);
                                }}
                              >
                                Order #{formatOrderNumber(notification.orderNumber)}
                              </Link>
                              {notification.customerName && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {notification.customerName}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-bold text-foreground">
                                  {formatCurrency(notification.total, language)}
                                </p>
                                {notification.items && notification.items.length > 0 && (
                                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                                    {notification.items.length} {notification.items.length === 1 ? 'item' : 'items'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-600 transition-all"
                                  aria-label="Mark as read"
                                >
                                  <Eye size={14} aria-hidden="true" />
                                </button>
                              )}
                              <button
                                onClick={() => clearNotification(notification.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 transition-all"
                                aria-label="Remove notification"
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </button>
                            </div>
                          </div>

                          {/* Order Items */}
                          {notification.items && notification.items.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <button
                                onClick={() => toggleNotificationExpand(notification.id)}
                                className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                              >
                                <span>Order Items ({notification.items.length})</span>
                                {expandedNotifications.has(notification.id) ? (
                                  <ChevronUp size={14} />
                                ) : (
                                  <ChevronDown size={14} />
                                )}
                              </button>
                              {expandedNotifications.has(notification.id) && (
                                <div className="space-y-1.5">
                                  {notification.items.map((item, idx) => (
                                    <div key={idx} className="flex items-start justify-between text-xs">
                                      <span className="text-foreground flex-1">
                                        <span className="font-medium text-primary">{item.quantity}×</span> {item.meal_name}
                                      </span>
                                      <span className="text-muted-foreground ml-2 font-medium">
                                        {formatCurrency(item.price * item.quantity, language)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2 mt-3" role="group" aria-label="Quick actions">
                            <button
                              onClick={() => updateOrderStatus(notification.orderId, 'CONFIRMED')}
                              disabled={updatingOrderId === notification.orderId}
                              aria-label="Confirm order"
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-green-500/10 text-green-700 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={14} aria-hidden="true" />
                              Confirm
                            </button>
                            <button
                              onClick={() => updateOrderStatus(notification.orderId, 'PREPARING')}
                              disabled={updatingOrderId === notification.orderId}
                              aria-label="Mark order as preparing"
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-purple-500/10 text-purple-700 rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                            >
                              <Clock size={14} aria-hidden="true" />
                              Preparing
                            </button>
                            <button
                              onClick={() => updateOrderStatus(notification.orderId, 'READY')}
                              disabled={updatingOrderId === notification.orderId}
                              aria-label="Mark order as ready"
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-700 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={14} aria-hidden="true" />
                              Ready
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border bg-muted">
                <Link
                  href="/admin/orders"
                  className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  View All Orders
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
