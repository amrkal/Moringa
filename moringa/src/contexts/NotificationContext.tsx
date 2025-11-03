'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';

interface OrderNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName?: string;
  total: number;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: OrderNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<OrderNotification, 'id' | 'timestamp' | 'read'>, showToast?: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);

  const formatOrderNumber = (value: any) => {
    const s = String(value ?? '');
    const match = s.match(/(\d+)/g);
    const digits = match && match.length ? match[match.length - 1] : s.replace(/\D/g, '');
    if (!digits) return s ? s.slice(-6) : '';
    return digits.slice(-6);
  };

  // Load notifications from localStorage on mount
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem('orderNotifications');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotifications(parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          })));
        } catch (error) {
          console.error('Failed to parse stored notifications:', error);
        }
      }
    };

    loadNotifications();

    // Listen for storage changes (cross-tab/window communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'orderNotifications' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setNotifications(parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          })));
        } catch (error) {
          console.error('Failed to parse storage change:', error);
        }
      }
    };

    // Poll localStorage every 2 seconds to detect changes from same window
    const pollInterval = setInterval(loadNotifications, 2000);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('orderNotifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<OrderNotification, 'id' | 'timestamp' | 'read'>, showToast = false) => {
    const newNotification: OrderNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Only show toast notification if showToast is true (admin side only)
    if (showToast) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-in slide-in-from-right-full' : 'animate-out slide-out-to-right-full'
            } max-w-md w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-2xl pointer-events-auto flex`}
          >
            <div className="flex-1 w-0 p-5">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-base font-bold text-foreground">
                    New Order Received! 🎉
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Order #{formatOrderNumber(notification.orderNumber)}
                  </p>
                  {notification.customerName && (
                    <p className="mt-1 text-sm font-medium text-foreground">
                      Customer: {notification.customerName}
                    </p>
                  )}
                  <p className="mt-1 text-lg font-bold text-primary">
                    ${notification.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-border">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-primary hover:bg-primary/10 focus:outline-none transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ),
        {
          duration: 8000,
          position: 'top-right',
        }
      );

      // Play notification sound if enabled by user setting and file is present (admin side only)
      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          const enabled = localStorage.getItem('notificationSound') === 'true' || localStorage.getItem('enableNotificationSound') === 'true';
          if (enabled) {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Could not play notification sound:', err));
          }
        } catch (error) {
          // Ignore sound errors silently
        }
      }
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('orderNotifications');
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
