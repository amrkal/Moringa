'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Star,
  Award,
  Activity,
  Download,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { formatCurrency } from '@/lib/format';
import { getLocalizedText } from '@/lib/i18n';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalMeals: number;
  recentOrders: any[];
  popularMeals: any[];
  monthlyRevenue: number[];
  todayOrders: number;
  todayRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
}

interface AnalyticsData {
  salesOverview: any;
  dailySales: any[];
  popularMeals: any[];
  peakHours: any[];
  ordersByType: any[];
  ordersByStatus: any[];
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalMeals: 0,
    recentOrders: [],
    popularMeals: [],
    monthlyRevenue: [],
    todayOrders: 0,
    todayRevenue: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
  });
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    salesOverview: null,
    dailySales: [],
    popularMeals: [],
    peakHours: [],
    ordersByType: [],
    ordersByStatus: [],
  });
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<string>('30'); // Time period filter in days (supports custom)
  const [customDays, setCustomDays] = useState<string>('');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchDashboardData();
    fetchAnalyticsData();
  }, [timePeriod]);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [
        salesOverviewRes,
        dailySalesRes,
        popularMealsRes,
        peakHoursRes,
        ordersByTypeRes,
        ordersByStatusRes,
      ] = await Promise.all([
        api.get('/analytics/sales/overview', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/analytics/sales/daily?days=${timePeriod}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/analytics/meals/popular/?limit=10', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/analytics/orders/peak-hours?days=${timePeriod}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/analytics/orders/by-type/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/analytics/orders/by-status/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setAnalytics({
        salesOverview: salesOverviewRes.data,
        dailySales: dailySalesRes.data.data || [],
        popularMeals: popularMealsRes.data.data || [],
        peakHours: peakHoursRes.data.data || [],
        ordersByType: ordersByTypeRes.data.data || [],
        ordersByStatus: ordersByStatusRes.data.data || [],
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Orders', 'Revenue'],
      ...analytics.dailySales.map((day: any) => [
        day.date,
        day.orders,
        day.revenue.toFixed(2),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Title
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Primary blue
    doc.text('Moringa Restaurant', 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Sales Analytics Report', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Muted gray
    doc.text(`Generated on: ${today}`, 14, 38);

    // Summary Stats
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary Statistics', 14, 50);
    
    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Total Orders', stats.totalOrders.toString()],
        ['Total Revenue', `₪${stats.totalRevenue.toFixed(2)}`],
        ['Average Order Value', `₪${stats.avgOrderValue.toFixed(2)}`],
        ['Today\'s Orders', stats.todayOrders.toString()],
        ['Today\'s Revenue', `₪${stats.todayRevenue.toFixed(2)}`],
        ['Pending Orders', stats.pendingOrders.toString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Daily Sales Table
    const finalY = (doc as any).lastAutoTable.finalY || 110;
    doc.setFontSize(14);
    doc.text('Daily Sales (Last 30 Days)', 14, finalY + 10);
    
    autoTable(doc, {
      startY: finalY + 15,
      head: [['Date', 'Orders', 'Revenue']],
      body: analytics.dailySales.map((day: any) => [
        new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        day.orders.toString(),
        `₪${day.revenue.toFixed(2)}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 50, halign: 'right' },
      },
    });

    // Popular Meals Table
    const finalY2 = (doc as any).lastAutoTable.finalY || 200;
    if (finalY2 > 250) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Top 10 Popular Meals', 14, 20);
      autoTable(doc, {
        startY: 25,
        head: [['Meal Name', 'Orders', 'Revenue']],
        body: analytics.popularMeals.slice(0, 10).map((meal: any) => [
          meal.meal_name,
          meal.order_count.toString(),
          `₪${meal.total_revenue.toFixed(2)}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
      });
    } else {
      doc.setFontSize(14);
      doc.text('Top 10 Popular Meals', 14, finalY2 + 10);
      autoTable(doc, {
        startY: finalY2 + 15,
        head: [['Meal Name', 'Orders', 'Revenue']],
        body: analytics.popularMeals.slice(0, 10).map((meal: any) => [
          meal.meal_name,
          meal.order_count.toString(),
          `₪${meal.total_revenue.toFixed(2)}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
      });
    }

    // Order Statistics
    const finalY3 = (doc as any).lastAutoTable.finalY || 200;
    if (finalY3 > 250) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Order Distribution', 14, 20);
      
      autoTable(doc, {
        startY: 25,
        head: [['Order Type', 'Count', 'Percentage']],
        body: analytics.ordersByType.map((type: any) => [
          type.type,
          type.count.toString(),
          `${type.percentage}%`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
      });
    } else {
      doc.setFontSize(14);
      doc.text('Order Distribution', 14, finalY3 + 10);
      
      autoTable(doc, {
        startY: finalY3 + 15,
        head: [['Order Type', 'Count', 'Percentage']],
        body: analytics.ordersByType.map((type: any) => [
          type.type,
          type.count.toString(),
          `${type.percentage}%`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
      });
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [ordersRes, usersRes, mealsRes] = await Promise.all([
        api.get('/orders/'),
        api.get('/users/'),
        api.get('/meals/?active_only=false')
      ]);

      console.log('Dashboard API Responses:', { ordersRes: ordersRes.data, usersRes: usersRes.data, mealsRes: mealsRes.data });

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.items || ordersRes.data?.data || [];
      const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.items || usersRes.data?.data || [];
      const meals = Array.isArray(mealsRes.data) ? mealsRes.data : mealsRes.data?.items || mealsRes.data?.data || [];

      // Calculate stats
      const totalRevenue = orders.reduce((sum: number, order: any) => {
        const amount = order.total_amount || order.total || 0;
        return sum + amount;
      }, 0);
      
      // Sort orders by date and get recent ones
      const sortedOrders = orders.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      const recentOrders = sortedOrders.slice(0, 5);
      
      // Calculate popular meals based on order frequency
      const mealCounts: Record<string, { meal: any; count: number; revenue: number }> = {};
      orders.forEach((order: any) => {
        (order.items || []).forEach((item: any) => {
          const mealId = item.meal_id || item.mealId;
          if (!mealId) return;
          
          if (!mealCounts[mealId]) {
            const meal = meals.find((m: any) => (m.id || m._id) === mealId);
            mealCounts[mealId] = { meal: meal || { name: item.meal_name || 'Unknown', price: item.meal_price || 0 }, count: 0, revenue: 0 };
          }
          mealCounts[mealId].count += item.quantity || 1;
          // Use subtotal if available, otherwise calculate from meal_price and quantity
          const itemRevenue = item.subtotal ?? ((item.meal_price || item.price || 0) * (item.quantity || 1));
          mealCounts[mealId].revenue += itemRevenue;
        });
      });
      
      const popularMeals = Object.values(mealCounts)
        .sort((a, b) => {
          // Sort by order count (popularity) first, then by revenue
          if (b.count !== a.count) {
            return b.count - a.count;
          }
          return b.revenue - a.revenue;
        })
        .slice(0, 10) // Show top 10 instead of 5
        .map(({ meal, count, revenue }) => ({
          ...meal,
          orderCount: count,
          totalRevenue: revenue,
          available: meal.is_active ?? meal.is_available ?? true
        }));

      // Calculate monthly revenue (last 12 months)
      const now = new Date();
      const monthlyRevenue = Array(12).fill(0);
      orders.forEach((order: any) => {
        const orderDate = new Date(order.created_at || order.createdAt);
        const monthDiff = (now.getFullYear() - orderDate.getFullYear()) * 12 + (now.getMonth() - orderDate.getMonth());
        if (monthDiff >= 0 && monthDiff < 12) {
          const index = 11 - monthDiff;
          monthlyRevenue[index] += order.total_amount || order.total || 0;
        }
      });

      // Calculate today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at || order.createdAt);
        return orderDate >= today;
      });
      const todayRevenue = todayOrders.reduce((sum: number, order: any) => {
        return sum + (order.total_amount || order.total || 0);
      }, 0);

      // Calculate average order value
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      // Count pending orders
      const pendingOrders = orders.filter((order: any) => 
        order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PREPARING'
      ).length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: users.length,
        totalMeals: meals.length,
        recentOrders,
        popularMeals,
        monthlyRevenue,
        todayOrders: todayOrders.length,
        todayRevenue,
        avgOrderValue,
        pendingOrders
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={getTranslation('admin', 'dashboard', language)}>
        <div className="space-y-5">
          {/* Loading Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted/50 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted/50 rounded w-20"></div>
                    <div className="h-6 bg-muted/50 rounded w-16"></div>
                  </div>
                </div>
                <div className="mt-4 h-3 bg-muted/50 rounded w-24"></div>
              </div>
            ))}
          </div>
          
          {/* Loading Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-muted/50 rounded w-32 mb-4"></div>
              <div className="h-64 bg-muted/30 rounded-xl"></div>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-muted/50 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted/30 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: getTranslation('admin', 'totalOrders', language),
      value: stats.totalOrders,
      icon: ShoppingBag,
      change: '+12%',
      changeType: 'positive' as const,
      color: 'bg-info',
      href: '/admin/orders'
    },
    {
      title: getTranslation('admin', 'revenue', language),
      value: formatCurrency(stats.totalRevenue, language, 'ILS'),
      icon: DollarSign,
      change: '+18%',
      changeType: 'positive' as const,
      color: 'bg-success',
      href: '/admin/orders'
    },
    {
      title: getTranslation('admin', 'totalUsers', language),
      value: stats.totalUsers,
      icon: Users,
      change: '+8%',
      changeType: 'positive' as const,
      color: 'bg-primary',
      href: '/admin/users'
    },
    {
      title: getTranslation('admin', 'totalMeals', language),
      value: stats.totalMeals,
      icon: Package,
      change: '+3%',
      changeType: 'positive' as const,
      color: 'bg-primary',
      href: '/admin/meals'
    }
  ];

  return (
    <AdminLayout title={getTranslation('admin', 'dashboard', language)}>
      <div className="space-y-5" dir="ltr">
        {/* Dashboard Header */}
        <div className="relative pb-5 mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {getTranslation('admin', 'dashboard', language)}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Monitor your restaurant's performance and insights</p>
            </div>
            
            {/* Time Period Filter */}
            <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border">
              {[
                { value: '1', label: '1 Day' },
                { value: '7', label: '7 Days' },
                { value: '30', label: '30 Days' },
                { value: '90', label: '90 Days' },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setTimePeriod(period.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timePeriod === period.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {period.label}
                </button>
              ))}
              <div className="h-6 w-px bg-border mx-1" />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={365}
                  placeholder="Days"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-20 px-2 py-1.5 rounded-lg border border-border bg-card text-sm"
                />
                <button
                  onClick={() => {
                    const n = parseInt(customDays, 10);
                    if (!isNaN(n) && n >= 1 && n <= 365) {
                      setTimePeriod(String(n));
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
          {/* Gradient accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>

        {/* Export Reports Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl border border-blue-200 dark:border-blue-900 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Export Analytics Reports</h2>
              <p className="text-sm text-muted-foreground">Download comprehensive sales and performance data</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportToCSV}
                disabled={analytics.dailySales.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                disabled={analytics.dailySales.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <FileText className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Link 
              key={index}
              href={stat.href}
              className="card-premium p-6 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
                  <span className="text-sm font-semibold">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 tracking-tight">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{getTranslation('admin', 'fromLastMonth', language)}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Today's Performance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Today's Orders</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{stats.todayOrders}</p>
            </div>
          </div>

          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Today's Revenue</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(stats.todayRevenue, language, 'ILS')}</p>
            </div>
          </div>

          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(stats.avgOrderValue, language, 'ILS')}</p>
            </div>
          </div>

          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
              {stats.pendingOrders > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Pending Orders</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily Sales Chart */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground tracking-tight">Daily Sales Trend</h3>
                <p className="text-xs text-muted-foreground mt-1">Last {timePeriod} {timePeriod === '1' ? 'day' : 'days'} performance</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.dailySales}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `₪${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`₪${value.toFixed(2)}`, 'Revenue']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">{getTranslation('admin', 'recentOrders', language)}</h3>
              <Link 
                href="/admin/orders"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                {getTranslation('admin', 'viewAll', language)} →
              </Link>
            </div>
            <div className="space-y-1">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order, index) => {
                  const orderId = order._id || order.id || '';
                  const orderNumber = orderId.toString().slice(-8).toUpperCase();
                  const customerName = order.customer_name || order.customerName || order.user?.name || getTranslation('admin', 'guestUser', language);
                  const orderDate = new Date(order.created_at || order.createdAt || Date.now());
                  const itemCount = (order.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
                  
                  // Status badge styling
                  const getStatusStyle = (status: string) => {
                    const styles = {
                      DELIVERED: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900',
                      COMPLETED: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900',
                      OUT_FOR_DELIVERY: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900',
                      READY: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
                      PREPARING: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
                      CONFIRMED: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
                      PENDING: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
                      CANCELLED: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900',
                    };
                    return styles[status as keyof typeof styles] || styles.PENDING;
                  };
                  
                  return (
                    <Link
                      key={orderId || index}
                      href={`/admin/orders`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                          <ShoppingBag className="h-5 w-5 text-primary" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-foreground tracking-tight">
                              #{orderNumber}
                            </p>
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getStatusStyle(order.status || 'PENDING')}`}>
                              {order.status || 'PENDING'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {customerName} • {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {orderDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'he' ? 'he-IL' : 'en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-bold text-foreground tracking-tight">
                          {formatCurrency(order.total_amount || order.total || 0, language, 'ILS')}
                        </p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-muted-foreground text-sm">{getTranslation('admin', 'noRecentOrders', language)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Meals */}
        <div className="card-premium overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-muted/30 relative">
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">{getTranslation('admin', 'popularMeals', language)}</h3>
              <Link 
                href="/admin/meals"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                {getTranslation('admin', 'viewAll', language)} →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {getTranslation('admin', 'mealColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {getTranslation('admin', 'priceColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {getTranslation('admin', 'status', language)}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {getTranslation('admin', 'actions', language)}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {stats.popularMeals.length > 0 ? (
                  stats.popularMeals.map((meal, index) => {
                    // Medal colors for top 3
                    const getMedalColor = (rank: number) => {
                      if (rank === 0) return 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800';
                      if (rank === 1) return 'bg-slate-100 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800';
                      if (rank === 2) return 'bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800';
                      return 'bg-muted/50 text-muted-foreground border-border';
                    };

                    return (
                      <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all shrink-0 border-2 ${getMedalColor(index)}`}>
                              {index < 3 ? (
                                <Award className="h-5 w-5" strokeWidth={2.5} />
                              ) : (
                                <span className="text-sm font-bold">#{index + 1}</span>
                              )}
                            </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground tracking-tight truncate">
                              {typeof meal.name === 'string' 
                                ? meal.name 
                                : getLocalizedText(
                                    { en: meal.name?.en ?? '', ar: meal.name?.ar ?? '', he: meal.name?.he ?? '' },
                                    language
                                  )
                              }
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-md">
                              {(() => {
                                const desc = typeof meal.description === 'string'
                                  ? meal.description
                                  : getLocalizedText(
                                      { en: meal.description?.en ?? '', ar: meal.description?.ar ?? '', he: meal.description?.he ?? '' },
                                      language
                                    );
                                return desc ? `${desc.slice(0, 60)}...` : '';
                              })()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{meal.orderCount || 0}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">orders</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-foreground">
                          {formatCurrency(meal.totalRevenue || 0, language, 'ILS')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-muted-foreground">
                          {formatCurrency(meal.price || 0, language, 'ILS')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          meal.available 
                            ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900' 
                            : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
                        }`}>
                          {meal.available ? getTranslation('admin', 'available', language) : getTranslation('admin', 'unavailable', language)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link 
                          href="/admin/meals"
                          className="text-primary hover:text-primary/80 transition-colors p-2 hover:bg-primary/5 rounded-lg inline-flex"
                        >
                          <Eye className="h-4 w-4" strokeWidth={2} />
                        </Link>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-muted-foreground text-sm">{getTranslation('admin', 'noMealsFound', language)}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">Top Performing Meal</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-300 tracking-tight">
                  {stats.popularMeals.length > 0 ? (
                    typeof stats.popularMeals[0].name === 'string' 
                      ? stats.popularMeals[0].name 
                      : getLocalizedText(
                          { en: stats.popularMeals[0].name?.en ?? '', ar: stats.popularMeals[0].name?.ar ?? '', he: stats.popularMeals[0].name?.he ?? '' },
                          language
                        )
                  ) : 'N/A'}
                </p>
              </div>
              <Award className="h-10 w-10 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
              <Star className="h-4 w-4 fill-current" />
              <span>{stats.popularMeals[0]?.orderCount || 0} orders</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium mb-1">Highest Revenue Meal</p>
                <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300 tracking-tight">
                  {stats.popularMeals.length > 0 ? formatCurrency(stats.popularMeals[0]?.totalRevenue || 0, language, 'ILS') : 'N/A'}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
              <span>from {stats.popularMeals[0]?.orderCount || 0} orders</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-400 font-medium mb-1">Total Menu Items</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-300 tracking-tight">
                  {stats.totalMeals}
                </p>
              </div>
              <Package className="h-10 w-10 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-400">
              <Activity className="h-4 w-4" />
              <span>{stats.popularMeals.filter(m => m.available).length} available</span>
            </div>
          </div>
        </div>

        {/* Additional Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Peak Hours Chart */}
          <div className="card-premium p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Peak Order Hours</h3>
              <p className="text-sm text-muted-foreground mt-1">Order distribution by hour (last {timePeriod} {timePeriod === '1' ? 'day' : 'days'})</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [value, 'Orders']}
                  labelFormatter={(label) => `${label}:00 - ${label}:59`}
                />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Orders" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Types Distribution */}
          <div className="card-premium p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Order Types</h3>
              <p className="text-sm text-muted-foreground mt-1">Distribution by delivery type</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.ordersByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }: any) => `${type}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.ordersByType.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Popular Meals Chart */}
          <div className="card-premium p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Top 10 Popular Meals</h3>
              <p className="text-sm text-muted-foreground mt-1">By order count</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.popularMeals} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="meal_name" 
                  width={120}
                  stroke="#6b7280"
                  fontSize={11}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [value, 'Orders']}
                />
                <Legend />
                <Bar dataKey="order_count" fill="#10b981" name="Orders" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution */}
          <div className="card-premium p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Order Status</h3>
              <p className="text-sm text-muted-foreground mt-1">Current order distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }: any) => `${status}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.ordersByStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}