'use client';

import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import api from '@/lib/api';

/**
 * Component that listens for new notifications and displays toast popups
 * Only active on admin pages to prevent showing notifications to customers
 */
export function NotificationListener() {
  const { notifications, addNotification } = useNotifications();
  const previousCountRef = useRef(notifications.length);
  const hasInitializedRef = useRef(false);
  const initializedOrdersPollRef = useRef(false);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const [isPolling, setIsPolling] = useState(false);

  const formatOrderNumber = (value: any) => {
    const s = String(value ?? '');
    const match = s.match(/(\d+)/g);
    const digits = match && match.length ? match[match.length - 1] : s.replace(/\D/g, '');
    if (!digits) return s ? s.slice(-6) : '';
    return digits.slice(-6);
  };

  useEffect(() => {
    // Skip the initial render to avoid showing old notifications
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      previousCountRef.current = notifications.length;
      return;
    }

    // Check if there's a new notification (count increased)
    if (notifications.length > previousCountRef.current) {
      // Get the newest notification (first in array)
      const newNotification = notifications[0];
      
      // Only show if it's unread
      if (!newNotification.read) {
        // Import toast dynamically to show the notification
        import('react-hot-toast').then(({ default: toast }) => {
          import('lucide-react').then(({ ShoppingBag }) => {
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
                          Order #{formatOrderNumber(newNotification.orderNumber)}
                        </p>
                        {newNotification.customerName && (
                          <p className="mt-1 text-sm font-medium text-foreground">
                            Customer: {newNotification.customerName}
                          </p>
                        )}
                        <p className="mt-1 text-lg font-bold text-primary">
                          ${newNotification.total.toFixed(2)}
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
          });
        });

        // Play notification sound if enabled
        if (typeof window !== 'undefined' && 'Audio' in window) {
          try {
            const enabled = localStorage.getItem('notificationSound') === 'true' || localStorage.getItem('enableNotificationSound') === 'true';
            if (enabled) {
              const audio = new Audio('/notification.mp3');
              audio.volume = 0.5;
              audio.play().catch(() => {});
            }
          } catch {}
        }
      }
    }

    previousCountRef.current = notifications.length;
  }, [notifications]);

  // Poll backend for new orders and convert to notifications for admin
  useEffect(() => {
    // Load seen order IDs from localStorage
    if (!initializedOrdersPollRef.current) {
      try {
        const stored = localStorage.getItem('seenOrderIds');
        if (stored) {
          const arr: string[] = JSON.parse(stored);
          seenOrderIdsRef.current = new Set(arr);
        }
      } catch {}
      initializedOrdersPollRef.current = true;
    }

    let cancelled = false;
    let intervalId: any;

    const fetchLatestOrders = async (isFirstRun = false) => {
      if (cancelled || isPolling) return;
      setIsPolling(true);
      try {
        // Fetch recent orders (backend returns array or {data: []})
  const res = await api.get('/orders/');
        const raw = res.data?.data || res.data || [];
        const list: any[] = Array.isArray(raw) ? raw : [];

        // Normalize and process newest first
        const normalized = list.map((o: any) => ({
          id: o.id || o._id,
          order_number: o.order_number || (o.id || o._id || '').toString(),
          total: o.total_amount ?? o.total ?? 0,
          customer: o.customer_name || o.user?.name || o.customer_phone || o.phone || 'Customer',
          created_at: o.created_at,
        }));

        // On first run, just seed the seen IDs to avoid spamming old notifications
        if (isFirstRun) {
          normalized.forEach(n => seenOrderIdsRef.current.add(n.id));
          localStorage.setItem('seenOrderIds', JSON.stringify(Array.from(seenOrderIdsRef.current)));
          return;
        }

        // For subsequent runs, emit notifications for truly new orders
        for (const n of normalized) {
          if (!n.id) continue;
          if (!seenOrderIdsRef.current.has(n.id)) {
            // Mark as seen first to avoid duplicates
            seenOrderIdsRef.current.add(n.id);
            localStorage.setItem('seenOrderIds', JSON.stringify(Array.from(seenOrderIdsRef.current)));

            // Add to notification center and show toast for admin
            addNotification({
              orderId: n.id,
              orderNumber: formatOrderNumber(n.order_number),
              customerName: n.customer,
              total: n.total,
            }, true);
          }
        }
      } catch (e) {
        // Silent fail to avoid noisy UI; admin already sees orders list
        // console.error('Polling orders failed', e);
      } finally {
        setIsPolling(false);
      }
    };

    // Initial seed run (no popups)
    fetchLatestOrders(true);

    // Poll every 5 seconds
    intervalId = setInterval(() => fetchLatestOrders(false), 5000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [addNotification]);

  // This component doesn't render anything
  return null;
}
