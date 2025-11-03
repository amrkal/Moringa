'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  DollarSign,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react';
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
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [ordersRes, usersRes, mealsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/users'),
        api.get('/meals?active_only=false')
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.items || ordersRes.data || [];
      const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.items || usersRes.data || [];
      const meals = Array.isArray(mealsRes.data) ? mealsRes.data : mealsRes.data.items || mealsRes.data || [];

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
            mealCounts[mealId] = { meal: meal || { name: 'Unknown', price: 0 }, count: 0, revenue: 0 };
          }
          mealCounts[mealId].count += item.quantity || 1;
          mealCounts[mealId].revenue += (item.price || 0) * (item.quantity || 1);
        });
      });
      
      const popularMeals = Object.values(mealCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
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

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: users.length,
        totalMeals: meals.length,
        recentOrders,
        popularMeals,
        monthlyRevenue
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
      color: 'bg-info'
    },
    {
      title: getTranslation('admin', 'revenue', language),
      value: formatCurrency(stats.totalRevenue, language, 'ILS'),
      icon: DollarSign,
      change: '+18%',
      changeType: 'positive' as const,
      color: 'bg-success'
    },
    {
      title: getTranslation('admin', 'totalUsers', language),
      value: stats.totalUsers,
      icon: Users,
      change: '+8%',
      changeType: 'positive' as const,
      color: 'bg-primary'
    },
    {
      title: getTranslation('admin', 'totalMeals', language),
      value: stats.totalMeals,
      icon: Package,
      change: '+3%',
      changeType: 'positive' as const,
      color: 'bg-primary'
    }
  ];

  return (
    <AdminLayout title={getTranslation('admin', 'dashboard', language)}>
      <div className="space-y-6" dir="ltr">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-[hsl(var(--card))] rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{stat.title}</p>
                  <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="ml-1 text-sm text-success font-medium">
                  {stat.change}
                </span>
                <span className="ml-1 text-sm text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'fromLastMonth', language)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-[hsl(var(--card))] rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">{getTranslation('admin', 'monthlyRevenue', language)}</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {stats.monthlyRevenue.map((revenue, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-6 bg-primary rounded-t"
                    style={{
                      height: `${(revenue / Math.max(...stats.monthlyRevenue)) * 200}px`
                    }}
                  />
                  <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-[hsl(var(--card))] rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">{getTranslation('admin', 'recentOrders', language)}</h3>
              <button className="text-primary hover:opacity-90 text-sm font-medium is-link">
                {getTranslation('admin', 'viewAll', language)}
              </button>
            </div>
            <div className="space-y-3">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                        <span className="text-xs font-medium">
                          #{order.id?.toString().slice(-4) || `000${index}`}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                          Order #{order.id?.toString().slice(-6) || `00000${index}`}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {order.customer_name || getTranslation('admin', 'guestUser', language)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {formatCurrency(order.total_amount || order.total || 0, language, 'ILS')}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-success-soft text-success' :
                        order.status === 'PREPARING' ? 'bg-info-soft text-info' :
                        order.status === 'CANCELLED' ? 'bg-destructive-soft text-destructive' :
                        'bg-warning-soft text-warning'
                      }`}>
                        {order.status || 'PENDING'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[hsl(var(--muted-foreground))] text-center py-4">{getTranslation('admin', 'noRecentOrders', language)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Popular Meals */}
        <div className="bg-[hsl(var(--card))] rounded-lg shadow">
          <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">{getTranslation('admin', 'popularMeals', language)}</h3>
              <button className="text-primary hover:opacity-90 text-sm font-medium is-link">
                {getTranslation('admin', 'viewAll', language)}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {getTranslation('admin', 'mealColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {getTranslation('admin', 'categoryColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {getTranslation('admin', 'priceColumn', language)}
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
                {stats.popularMeals.length > 0 ? (
                  stats.popularMeals.map((meal, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                            <Package className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                              {typeof meal.name === 'string' 
                                ? meal.name 
                                : getLocalizedText(
                                    { en: meal.name?.en ?? '', ar: meal.name?.ar ?? '', he: meal.name?.he ?? '' },
                                    language
                                  )
                              }
                            </div>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                              {(() => {
                                const desc = typeof meal.description === 'string'
                                  ? meal.description
                                  : getLocalizedText(
                                      { en: meal.description?.en ?? '', ar: meal.description?.ar ?? '', he: meal.description?.he ?? '' },
                                      language
                                    );
                                return desc ? `${desc.slice(0, 50)}...` : '';
                              })()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[hsl(var(--muted-foreground))]">
                        {meal.category || getTranslation('admin', 'uncategorized', language)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[hsl(var(--foreground))]">
                        {formatCurrency(meal.price || 0, language, 'ILS')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          meal.available ? 'bg-success-soft text-success' : 'bg-destructive-soft text-destructive'
                        }`}>
                          {meal.available ? getTranslation('admin', 'available', language) : getTranslation('admin', 'unavailable', language)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary hover:opacity-90 is-link">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-[hsl(var(--muted-foreground))]">
                      {getTranslation('admin', 'noMealsFound', language)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[hsl(var(--card))] rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">{getTranslation('admin', 'quickActions', language)}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-[hsl(var(--input))] rounded-lg hover:border-primary hover:bg-primary-soft transition-colors">
              <Package className="h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">{getTranslation('admin', 'dashboardAddMeal', language)}</span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-[hsl(var(--input))] rounded-lg hover:border-primary hover:bg-primary-soft transition-colors">
              <Users className="h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">{getTranslation('admin', 'dashboardManageUsers', language)}</span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-[hsl(var(--input))] rounded-lg hover:border-primary hover:bg-primary-soft transition-colors">
              <ShoppingBag className="h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">{getTranslation('admin', 'dashboardViewOrders', language)}</span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-[hsl(var(--input))] rounded-lg hover:border-primary hover:bg-primary-soft transition-colors">
              <Clock className="h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">{getTranslation('admin', 'settings', language)}</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}