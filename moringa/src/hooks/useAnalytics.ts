"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type RangeParams = { days?: number };

const paramsOrUndefined = (p?: RangeParams) => (p?.days ? { params: { days: p.days } } : undefined);

export function useAnalyticsSummary(range?: RangeParams) {
  return useQuery({
    queryKey: ['analytics:summary', range],
    queryFn: async () => {
      const res = await api.get('/analytics/summary', paramsOrUndefined(range));
      return res.data as {
        orders_total: number;
        orders_delivered: number;
        revenue_delivered: number;
        aov_delivered: number;
        sold_meals_delivered: number;
        payment_failures: number;
        refunds: number;
      };
    },
    staleTime: 0,
  });
}

export function useAnalyticsPayments(range?: RangeParams) {
  return useQuery({
    queryKey: ['analytics:payments', range],
    queryFn: async () => {
      const res = await api.get('/analytics/payments/summary', paramsOrUndefined(range));
      return res.data as { pending: number; paid: number; failed: number; refunded: number; total: number };
    },
    staleTime: 0,
  });
}

export function useAnalyticsDaily(range: Required<RangeParams>) {
  return useQuery({
    queryKey: ['analytics:daily', range],
    queryFn: async () => {
      const res = await api.get('/analytics/sales/daily', { params: { days: range.days } });
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as Array<{ date: string; orders: number; delivered_orders?: number; revenue: number }>;
    },
    staleTime: 0,
  });
}

export function useAnalyticsMonthly(months = 12) {
  return useQuery({
    queryKey: ['analytics:monthly', months],
    queryFn: async () => {
      const res = await api.get('/analytics/sales/monthly', { params: { months } });
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as Array<{ month: string; month_name: string; orders: number; revenue: number }>;
    },
    staleTime: 0,
  });
}

export function useAnalyticsPopularMeals(range?: RangeParams, limit = 10) {
  return useQuery({
    queryKey: ['analytics:popular', range, limit],
    queryFn: async () => {
      const res = await api.get('/analytics/meals/popular', { params: { limit, delivered_only: true, ...(range?.days ? { days: range.days } : {}) } });
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as Array<{ meal_id: string; meal_name: string; order_count: number; revenue: number }>;
    },
    staleTime: 0,
  });
}

export function useAnalyticsOrdersByStatus(range?: RangeParams) {
  return useQuery({
    queryKey: ['analytics:status', range],
    queryFn: async () => {
      const res = await api.get('/analytics/orders/by-status', paramsOrUndefined(range));
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as Array<{ status: string; count: number }>;
    },
    staleTime: 0,
  });
}

export function useAnalyticsOrdersByType(range?: RangeParams) {
  return useQuery({
    queryKey: ['analytics:type', range],
    queryFn: async () => {
      const res = await api.get('/analytics/orders/by-type', paramsOrUndefined(range));
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as Array<{ type: string; count: number; revenue: number }>;
    },
    staleTime: 0,
  });
}
