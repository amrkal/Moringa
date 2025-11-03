'use client';

import { useState } from 'react';
import { Bell, X, Check, Trash2, Eye } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatCurrency } from '@/lib/format';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export function NotificationBell() {
  const { language } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-muted transition-all hover:scale-110"
        aria-label="Notifications"
      >
        <Bell size={22} className="text-foreground" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800">
              <div>
                <h3 className="text-lg font-bold text-foreground">Order Notifications</h3>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
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

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    New orders will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-neutral-800">
                  {notifications.map((notification) => (
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
                              <p className="text-sm font-semibold text-foreground">
                                New Order #{formatOrderNumber(notification.orderNumber)}
                              </p>
                              {notification.customerName && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {notification.customerName}
                                </p>
                              )}
                              <p className="text-sm font-bold text-primary mt-1">
                                {formatCurrency(notification.total, language)}
                              </p>
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
                                  title="Mark as read"
                                >
                                  <Eye size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => clearNotification(notification.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 transition-all"
                                title="Remove"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* View Order Link */}
                          <Link
                            href={`/admin/orders`}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium mt-2"
                            onClick={() => {
                              markAsRead(notification.id);
                              setIsOpen(false);
                            }}
                          >
                            View Order →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800">
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
