'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  status?: string;
  message?: string;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  /** When true, pauses reconnection attempts while the tab is hidden (default: true) */
  pauseReconnectWhenHidden?: boolean;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    pauseReconnectWhenHidden = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnectingRef = useRef(false);
  // Tracks an in-flight connection attempt so we don't start parallel connects,
  // but still allow subsequent reconnect attempts after close.
  const isConnectingRef = useRef(false);
  const warnedOnceRef = useRef(false);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    const state = wsRef.current?.readyState;
    if (isConnectingRef.current || state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
      return;
    }
    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('WebSocket connected:', url);
        }
        setIsConnected(true);
        setReconnectCount(0);
        isReconnectingRef.current = false;
        isConnectingRef.current = false;
        warnedOnceRef.current = false; // reset error throttle after a successful connection
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        // Throttle console spam in dev: warn only once until a successful reconnect
        if (process.env.NODE_ENV === 'development' && !warnedOnceRef.current) {
          console.warn('WebSocket connection error');
          warnedOnceRef.current = true;
        }
        // If an error occurs before close, allow future reconnect attempts
        isConnectingRef.current = false;
        onError?.(error);
      };

      ws.onclose = () => {
        if (process.env.NODE_ENV === 'development') {
          const willRetry = reconnectCount < maxReconnectAttempts;
          if (!willRetry) {
            console.warn('WebSocket disconnected (max retries reached)');
          } else {
            // Quiet disconnect logs to reduce noise during retries
            // console.debug('WebSocket disconnected, scheduling reconnect');
          }
        }
        setIsConnected(false);
        wsRef.current = null;
        isConnectingRef.current = false;
        onDisconnect?.();

        // Attempt to reconnect
        if (reconnectCount < maxReconnectAttempts && !isReconnectingRef.current) {
          isReconnectingRef.current = true;
          // Exponential backoff with a max cap of 30s
          const base = Math.max(500, reconnectInterval);
          const jitter = Math.random() * 250; // add small jitter
          const delay = Math.min(base * Math.pow(2, Math.max(0, reconnectCount - 1)) + jitter, 30000);

          const scheduleReconnect = () => {
            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectCount((prev) => prev + 1);
              connect();
            }, delay);
          };

          if (pauseReconnectWhenHidden && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            // Wait until tab becomes visible to attempt reconnection
            const onVisible = () => {
              document.removeEventListener('visibilitychange', onVisible);
              if (document.visibilityState === 'visible') scheduleReconnect();
            };
            document.addEventListener('visibilitychange', onVisible);
          } else {
            scheduleReconnect();
          }
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      isReconnectingRef.current = false;
    }
  }, [url, onConnect, onMessage, onDisconnect, onError, reconnectCount, reconnectInterval, maxReconnectAttempts, pauseReconnectWhenHidden]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    isReconnectingRef.current = false;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('WebSocket is not connected. Cannot send message.');
      }
    }
  }, []);

  // Ping/pong keepalive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendMessage('ping');
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []); // Empty deps - connect once on mount

  return {
    isConnected,
    reconnectCount,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}
