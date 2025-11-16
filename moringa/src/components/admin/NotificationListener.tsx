'use client';

import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import api from '@/lib/api';

/**
 * Component that listens for new notifications via WebSocket
 * Falls back to polling if WebSocket connection fails
 * Only active on admin pages to prevent showing notifications to customers
 */
export function NotificationListener() {
  const { notifications, addNotification } = useNotifications();
  const previousCountRef = useRef(notifications.length);
  const hasInitializedRef = useRef(false);
  const initializedOrdersPollRef = useRef(false);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const [isPolling, setIsPolling] = useState(false);
  const [usePolling, setUsePolling] = useState(false);

  const formatOrderNumber = (value: any) => {
    const s = String(value ?? '');
    const match = s.match(/(\d+)/g);
    const digits = match && match.length ? match[match.length - 1] : s.replace(/\D/g, '');
    if (!digits) return s ? s.slice(-6) : '';
    return digits.slice(-6);
  };

  // WebSocket connection for real-time notifications
  const getWsUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws/admin';
    // Add authentication token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? `${baseUrl}?token=${token}` : baseUrl;
  };
  
  const { isConnected: wsConnected } = useWebSocket(getWsUrl(), {
    onMessage: (message) => {
      // Handle incoming WebSocket messages
      if (message.type === 'new_order' && message.data) {
        const order = message.data;
        const orderId = order.id;
        
        // Check if we've already seen this order
        if (!seenOrderIdsRef.current.has(orderId)) {
          seenOrderIdsRef.current.add(orderId);
          localStorage.setItem('seenOrderIds', JSON.stringify(Array.from(seenOrderIdsRef.current)));
          
          // Add notification with toast
          addNotification({
            orderId: orderId,
            orderNumber: formatOrderNumber(order.order_number),
            customerName: order.customer_name || order.customer_phone || 'Customer',
            total: order.total_amount || order.total || 0,
            items: order.items || [],
          }, true);
        }
      } else if (message.type === 'order_status_update' && message.data) {
        // Handle order status updates (could update existing notification)
        console.log('Order status updated:', message.data);
      } else if (message.type === 'connection') {
        console.log('WebSocket:', message.message);
      }
    },
    onConnect: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✓ Real-time notifications active (WebSocket)');
      }
      setUsePolling(false); // Disable polling when WebSocket is active
    },
    onDisconnect: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('→ Using polling fallback for notifications');
      }
      setUsePolling(true); // Enable polling fallback
    },
    onError: (error) => {
      // Silently fall back to polling without spamming console
      setUsePolling(true);
    },
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
  });

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
        // Show native browser notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            const n = new Notification('🎉 New Order Received!', {
              body: `Order #${formatOrderNumber(newNotification.orderNumber)}\n${newNotification.customerName || 'Customer'}\n$${newNotification.total.toFixed(2)}`,
              icon: '/logo.jpg',
              badge: '/logo.jpg',
              tag: `order-${newNotification.orderId}`,
              requireInteraction: false,
            });
            n.onclick = () => {
              window.focus();
              window.location.href = '/admin/orders';
              n.close();
            };
            setTimeout(() => n.close(), 10000);
          } catch {}
        }

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
              audio.onerror = () => {
                // Silently handle missing audio file - only log once
                if (!sessionStorage.getItem('audioWarningShown')) {
                  console.warn('Notification sound file not found. Please add notification.mp3 to the public folder.');
                  sessionStorage.setItem('audioWarningShown', 'true');
                }
              };
              audio.play().catch(() => {});
            }
          } catch {}
        }
      }
    }

    previousCountRef.current = notifications.length;
  }, [notifications]);

  // Polling fallback - only used when WebSocket is disconnected
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

    // Only poll if WebSocket is not connected
    if (!usePolling) {
      return;
    }

    let cancelled = false;
    let intervalId: any;

    const fetchLatestOrders = async (isFirstRun = false) => {
      if (cancelled || isPolling) return;
      setIsPolling(true);
      try {
        // Fetch recent orders (backend returns array or {data: []})
  const res = await api.get('/orders');
        const raw = res.data?.data || res.data || [];
        const list: any[] = Array.isArray(raw) ? raw : [];

        // Normalize and process newest first
        const normalized = list.map((o: any) => ({
          id: o.id || o._id,
          order_number: o.order_number || (o.id || o._id || '').toString(),
          total: o.total_amount ?? o.total ?? 0,
          customer: o.customer_name || o.user?.name || o.customer_phone || o.phone || 'Customer',
          created_at: o.created_at,
          items: o.items?.map((item: any) => ({
            meal_name: item.meal_name || item.meal?.name || 'Unknown Item',
            quantity: item.quantity || 1,
            price: item.price || item.unit_price || 0,
          })) || [],
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
              items: n.items,
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
  }, [addNotification, usePolling]); // Re-run when usePolling changes

  // This component doesn't render anything
  return null;
}
