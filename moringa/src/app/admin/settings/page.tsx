'use client';

import { useState, useEffect } from 'react';
import { Save, Store, DollarSign, Truck, Clock, MapPin, Phone, Mail, Globe } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Settings {
  // Restaurant Info
  restaurant_name: string;
  restaurant_name_en?: string;
  restaurant_name_ar?: string;
  restaurant_name_he?: string;
  restaurant_description: string;
  restaurant_description_en?: string;
  restaurant_description_ar?: string;
  restaurant_description_he?: string;
  restaurant_phone: string;
  restaurant_email: string;
  restaurant_address: string;
  restaurant_address_en?: string;
  restaurant_address_ar?: string;
  restaurant_address_he?: string;
  
  // Business Hours
  opening_time: string;
  closing_time: string;
  
  // Delivery Settings
  delivery_fee: number;
  minimum_order_amount: number;
  delivery_radius_km: number;
  estimated_delivery_time: number; // in minutes
  
  // Tax & Payments
  tax_rate: number;
  currency: string;
  accept_cash: boolean;
  accept_card: boolean;
  accept_mobile_money: boolean;
  
  // Other
  is_accepting_orders: boolean;
  // Theme
  theme_primary?: string;
  theme_primary_foreground?: string;
  theme_background?: string;
  theme_foreground?: string;
  theme_accent?: string;
  theme_accent_foreground?: string;
  theme_radius?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    restaurant_name: 'Moringa',
    restaurant_name_en: '',
    restaurant_name_ar: '',
    restaurant_name_he: '',
    restaurant_description: 'Fresh and delicious meals',
    restaurant_description_en: '',
    restaurant_description_ar: '',
    restaurant_description_he: '',
    restaurant_phone: '',
    restaurant_email: '',
    restaurant_address: '',
    restaurant_address_en: '',
    restaurant_address_ar: '',
    restaurant_address_he: '',
    opening_time: '09:00',
    closing_time: '22:00',
    delivery_fee: 5.00,
    minimum_order_amount: 15.00,
    delivery_radius_km: 10,
    estimated_delivery_time: 30,
    tax_rate: 0.15,
    currency: 'USD',
    accept_cash: true,
    accept_card: true,
    accept_mobile_money: false,
    is_accepting_orders: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'delivery' | 'payments' | 'theme'>('info');
  const [languageTab, setLanguageTab] = useState<'en' | 'ar' | 'he'>('en');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data) {
        // Ensure all optional string fields have default empty strings
        setSettings({
          ...response.data,
          restaurant_name_en: response.data.restaurant_name_en || '',
          restaurant_name_ar: response.data.restaurant_name_ar || '',
          restaurant_name_he: response.data.restaurant_name_he || '',
          restaurant_description_en: response.data.restaurant_description_en || '',
          restaurant_description_ar: response.data.restaurant_description_ar || '',
          restaurant_description_he: response.data.restaurant_description_he || '',
          restaurant_address_en: response.data.restaurant_address_en || '',
          restaurant_address_ar: response.data.restaurant_address_ar || '',
          restaurant_address_he: response.data.restaurant_address_he || '',
          theme_primary: response.data.theme_primary || '#16a34a',
          theme_primary_foreground: response.data.theme_primary_foreground || '#ffffff',
          theme_background: response.data.theme_background || '#f9fafb',
          theme_foreground: response.data.theme_foreground || '#111827',
          theme_accent: response.data.theme_accent || '#22c55e',
          theme_accent_foreground: response.data.theme_accent_foreground || '#ffffff',
          theme_radius: response.data.theme_radius || '0.5rem'
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Continue with default settings if load fails
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const loadingToast = toast.loading('Saving settings...');
    
    try {
      await api.post('/settings', settings);
      toast.success('Settings saved successfully', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save settings', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Save Button - Sticky */}
        <div className="sticky top-0 z-10 bg-gray-50 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/30 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Store className="inline-block mr-2 h-4 w-4" />
                Restaurant Info
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'delivery'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Truck className="inline-block mr-2 h-4 w-4" />
                Delivery & Hours
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'payments'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign className="inline-block mr-2 h-4 w-4" />
                Payments & Tax
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'theme'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Globe className="inline-block mr-2 h-4 w-4" />
                Appearance
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Restaurant Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Language Tabs for Multilingual Fields */}
                <div className="flex border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => setLanguageTab('en')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      languageTab === 'en'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguageTab('ar')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      languageTab === 'ar'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguageTab('he')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      languageTab === 'he'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    עברית
                  </button>
                </div>

                {/* Default Name (always visible) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Default Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={settings.restaurant_name}
                    onChange={(e) => updateSetting('restaurant_name', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                {/* English Tab */}
                {languageTab === 'en' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        English Name
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_name_en || ''}
                        onChange={(e) => updateSetting('restaurant_name_en', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="Restaurant name in English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        English Description
                      </label>
                      <textarea
                        value={settings.restaurant_description_en || ''}
                        onChange={(e) => updateSetting('restaurant_description_en', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        rows={3}
                        placeholder="Description in English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        English Address
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_address_en || ''}
                        onChange={(e) => updateSetting('restaurant_address_en', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="Address in English"
                      />
                    </div>
                  </>
                )}

                {/* Arabic Tab */}
                {languageTab === 'ar' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Arabic Name
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_name_ar || ''}
                        onChange={(e) => updateSetting('restaurant_name_ar', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="الاسم بالعربية"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Arabic Description
                      </label>
                      <textarea
                        value={settings.restaurant_description_ar || ''}
                        onChange={(e) => updateSetting('restaurant_description_ar', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        rows={3}
                        placeholder="الوصف بالعربية"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Arabic Address
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_address_ar || ''}
                        onChange={(e) => updateSetting('restaurant_address_ar', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="العنوان بالعربية"
                        dir="rtl"
                      />
                    </div>
                  </>
                )}

                {/* Hebrew Tab */}
                {languageTab === 'he' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Hebrew Name
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_name_he || ''}
                        onChange={(e) => updateSetting('restaurant_name_he', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="שם בעברית"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Hebrew Description
                      </label>
                      <textarea
                        value={settings.restaurant_description_he || ''}
                        onChange={(e) => updateSetting('restaurant_description_he', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        rows={3}
                        placeholder="תיאור בעברית"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Hebrew Address
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_address_he || ''}
                        onChange={(e) => updateSetting('restaurant_address_he', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="כתובת בעברית"
                        dir="rtl"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <Phone className="inline-block mr-1 h-4 w-4" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.restaurant_phone}
                      onChange={(e) => updateSetting('restaurant_phone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <Mail className="inline-block mr-1 h-4 w-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.restaurant_email}
                      onChange={(e) => updateSetting('restaurant_email', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Delivery & Hours Tab */}
            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <Clock className="inline-block mr-1 h-4 w-4" />
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={settings.opening_time}
                      onChange={(e) => updateSetting('opening_time', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <Clock className="inline-block mr-1 h-4 w-4" />
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={settings.closing_time}
                      onChange={(e) => updateSetting('closing_time', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Delivery Fee ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.delivery_fee || 0}
                      onChange={(e) => updateSetting('delivery_fee', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Minimum Order Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.minimum_order_amount || 0}
                      onChange={(e) => updateSetting('minimum_order_amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      value={settings.delivery_radius_km || 0}
                      onChange={(e) => updateSetting('delivery_radius_km', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Estimated Delivery Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.estimated_delivery_time || 0}
                      onChange={(e) => updateSetting('estimated_delivery_time', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex items-center p-4 bg-green-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="accepting_orders"
                    checked={settings.is_accepting_orders}
                    onChange={(e) => updateSetting('is_accepting_orders', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="accepting_orders" className="ml-3 text-sm font-medium text-gray-900">
                    Currently Accepting Orders
                  </label>
                </div>
              </div>
            )}

            {/* Payments & Tax Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={(settings.tax_rate || 0) * 100}
                      onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value) / 100)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    />
                    <p className="mt-1 text-sm text-gray-500">Enter as percentage (e.g., 15 for 15%)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="ILS">ILS (₪)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Accepted Payment Methods
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center p-4 border border-gray-300 rounded-xl">
                      <input
                        type="checkbox"
                        id="accept_cash"
                        checked={settings.accept_cash}
                        onChange={(e) => updateSetting('accept_cash', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="accept_cash" className="ml-3 flex-1">
                        <span className="text-sm font-medium text-gray-900">Cash</span>
                        <p className="text-xs text-gray-500">Accept cash on delivery</p>
                      </label>
                    </div>
                    <div className="flex items-center p-4 border border-gray-300 rounded-xl">
                      <input
                        type="checkbox"
                        id="accept_card"
                        checked={settings.accept_card}
                        onChange={(e) => updateSetting('accept_card', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="accept_card" className="ml-3 flex-1">
                        <span className="text-sm font-medium text-gray-900">Credit/Debit Card</span>
                        <p className="text-xs text-gray-500">Accept card payments</p>
                      </label>
                    </div>
                    <div className="flex items-center p-4 border border-gray-300 rounded-xl">
                      <input
                        type="checkbox"
                        id="accept_mobile_money"
                        checked={settings.accept_mobile_money}
                        onChange={(e) => updateSetting('accept_mobile_money', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="accept_mobile_money" className="ml-3 flex-1">
                        <span className="text-sm font-medium text-gray-900">Mobile Money</span>
                        <p className="text-xs text-gray-500">Accept mobile wallet payments</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance / Theme Tab */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={(settings as any).theme_primary || '#16a34a'} onChange={(e) => updateSetting('theme_primary' as keyof Settings, e.target.value)} />
                      <input
                        type="text"
                        value={(settings as any).theme_primary || ''}
                        onChange={(e) => updateSetting('theme_primary' as keyof Settings, e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="#16a34a"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Primary Text</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={(settings as any).theme_primary_foreground || '#ffffff'} onChange={(e) => updateSetting('theme_primary_foreground' as keyof Settings, e.target.value)} />
                      <input
                        type="text"
                        value={(settings as any).theme_primary_foreground || ''}
                        onChange={(e) => updateSetting('theme_primary_foreground' as keyof Settings, e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Background</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={(settings as any).theme_background || '#f9fafb'} onChange={(e) => updateSetting('theme_background' as keyof Settings, e.target.value)} />
                      <input
                        type="text"
                        value={(settings as any).theme_background || ''}
                        onChange={(e) => updateSetting('theme_background' as keyof Settings, e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="#f9fafb"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Text Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={(settings as any).theme_foreground || '#111827'} onChange={(e) => updateSetting('theme_foreground' as keyof Settings, e.target.value)} />
                      <input
                        type="text"
                        value={(settings as any).theme_foreground || ''}
                        onChange={(e) => updateSetting('theme_foreground' as keyof Settings, e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="#111827"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Accent</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={(settings as any).theme_accent || '#22c55e'} onChange={(e) => updateSetting('theme_accent' as keyof Settings, e.target.value)} />
                      <input
                        type="text"
                        value={(settings as any).theme_accent || ''}
                        onChange={(e) => updateSetting('theme_accent' as keyof Settings, e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="#22c55e"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Accent Text</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={(settings as any).theme_accent_foreground || '#ffffff'} onChange={(e) => updateSetting('theme_accent_foreground' as keyof Settings, e.target.value)} />
                      <input
                        type="text"
                        value={(settings as any).theme_accent_foreground || ''}
                        onChange={(e) => updateSetting('theme_accent_foreground' as keyof Settings, e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Corner Radius</label>
                    <input
                      type="text"
                      value={(settings as any).theme_radius || '0.5rem'}
                      onChange={(e) => updateSetting('theme_radius' as keyof Settings, e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                      placeholder="0.5rem"
                    />
                  </div>
                </div>
                <div className="p-4 rounded-xl border bg-gradient-to-r from-white to-gray-50">
                  <p className="text-sm text-gray-600">These colors control the public website appearance. Changes apply after saving and refresh.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Store Status</p>
                <p className={`text-lg font-semibold ${settings.is_accepting_orders ? 'text-green-600' : 'text-red-600'}`}>
                  {settings.is_accepting_orders ? 'Open' : 'Closed'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Business Hours</p>
                <p className="text-lg font-semibold text-gray-900">
                  {settings.opening_time} - {settings.closing_time}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Minimum Order</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${(settings.minimum_order_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
