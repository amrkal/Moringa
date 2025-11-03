'use client';

import { useState, useEffect } from 'react';
import { Save, Store, DollarSign, Truck, Clock, MapPin, Phone, Mail, Globe, Utensils } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

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
  
  // Order Types
  accept_delivery: boolean;
  accept_dine_in: boolean;
  accept_takeaway: boolean;
  
  // Other
  is_accepting_orders: boolean;
}

export default function SettingsPage() {
  const { language } = useLanguage();
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
    accept_delivery: true,
    accept_dine_in: true,
    accept_takeaway: true,
    is_accepting_orders: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'delivery' | 'payments' | 'operations'>('info');
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
          restaurant_address_he: response.data.restaurant_address_he || ''
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
    const loadingToast = toast.loading(getTranslation('admin', 'savingSettings', language));
    
    try {
      await api.post('/settings', settings);
      toast.success(getTranslation('admin', 'settingsSaved', language), { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedSaveSettings', language), { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title={getTranslation('admin', 'settings', language)}>
          <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={getTranslation('admin', 'settings', language)}>
      <div className="max-w-5xl mx-auto space-y-6" dir="ltr">
        {/* Save Button - Sticky */}
        <div className="sticky top-0 z-10 bg-background pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {saving ? getTranslation('admin', 'saving', language) : getTranslation('admin', 'saveSettings', language)}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-2xl shadow-sm border border-border">
          <div className="border-b border-border">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                <Store className="inline-block mr-2 h-4 w-4" />
                {getTranslation('admin', 'restaurantInfo', language)}
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'delivery'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                <Truck className="inline-block mr-2 h-4 w-4" />
                {getTranslation('admin', 'deliveryHours', language)}
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'payments'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                <DollarSign className="inline-block mr-2 h-4 w-4" />
                {getTranslation('admin', 'paymentsTax', language)}
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'operations'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                <Utensils className="inline-block mr-2 h-4 w-4" />
                {getTranslation('admin', 'operations', language)}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Restaurant Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Language Tabs for Multilingual Fields */}
                <div className="flex border-b border-border">
                  <button
                    type="button"
                    onClick={() => setLanguageTab('en')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      languageTab === 'en'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguageTab('ar')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      languageTab === 'ar'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguageTab('he')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      languageTab === 'he'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    עברית
                  </button>
                </div>

                {/* Default Name (always visible) */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                    {getTranslation('admin', 'defaultRestaurantName', language)} *
                  </label>
                  <input
                    type="text"
                    value={settings.restaurant_name}
                    onChange={(e) => updateSetting('restaurant_name', e.target.value)}
                    className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                  />
                </div>

                {/* English Tab */}
                {languageTab === 'en' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        {getTranslation('admin', 'settingsEnglishName', language)}
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_name_en || ''}
                        onChange={(e) => updateSetting('restaurant_name_en', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                        placeholder={getTranslation('admin', 'restaurantNameInEnglish', language)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        {getTranslation('admin', 'settingsEnglishDescription', language)}
                      </label>
                      <textarea
                        value={settings.restaurant_description_en || ''}
                        onChange={(e) => updateSetting('restaurant_description_en', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                        rows={3}
                        placeholder={getTranslation('admin', 'descriptionInEnglish', language)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        {getTranslation('admin', 'settingsEnglishAddress', language)}
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_address_en || ''}
                        onChange={(e) => updateSetting('restaurant_address_en', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                        placeholder={getTranslation('admin', 'addressInEnglish', language)}
                      />
                    </div>
                  </>
                )}

                {/* Arabic Tab */}
                {languageTab === 'ar' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        {getTranslation('admin', 'settingsArabicName', language)}
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_name_ar || ''}
                        onChange={(e) => updateSetting('restaurant_name_ar', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                        placeholder="الاسم بالعربية"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        {getTranslation('admin', 'settingsArabicDescription', language)}
                      </label>
                      <textarea
                        value={settings.restaurant_description_ar || ''}
                        onChange={(e) => updateSetting('restaurant_description_ar', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                        rows={3}
                        placeholder="الوصف بالعربية"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        {getTranslation('admin', 'settingsArabicAddress', language)}
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_address_ar || ''}
                        onChange={(e) => updateSetting('restaurant_address_ar', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
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
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        {getTranslation('admin', 'settingsHebrewName', language)}
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_name_he || ''}
                        onChange={(e) => updateSetting('restaurant_name_he', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                        placeholder="שם בעברית"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        {getTranslation('admin', 'settingsHebrewDescription', language)}
                      </label>
                      <textarea
                        value={settings.restaurant_description_he || ''}
                        onChange={(e) => updateSetting('restaurant_description_he', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                        rows={3}
                        placeholder="תיאור בעברית"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        {getTranslation('admin', 'settingsHebrewAddress', language)}
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_address_he || ''}
                        onChange={(e) => updateSetting('restaurant_address_he', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                        placeholder="כתובת בעברית"
                        dir="rtl"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[hsl(var(--border))]">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      <Phone className="inline-block mr-1 h-4 w-4" />
                      {getTranslation('admin', 'phoneNumber', language)}
                    </label>
                    <input
                      type="tel"
                      value={settings.restaurant_phone}
                      onChange={(e) => updateSetting('restaurant_phone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      <Mail className="inline-block mr-1 h-4 w-4" />
                      {getTranslation('admin', 'email', language)}
                    </label>
                    <input
                      type="email"
                      value={settings.restaurant_email}
                      onChange={(e) => updateSetting('restaurant_email', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
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
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      <Clock className="inline-block mr-1 h-4 w-4" />
                      {getTranslation('admin', 'openingTime', language)}
                    </label>
                    <input
                      type="time"
                      value={settings.opening_time}
                      onChange={(e) => updateSetting('opening_time', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      <Clock className="inline-block mr-1 h-4 w-4" />
                      {getTranslation('admin', 'closingTime', language)}
                    </label>
                    <input
                      type="time"
                      value={settings.closing_time}
                      onChange={(e) => updateSetting('closing_time', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      {getTranslation('admin', 'deliveryFee', language)}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.delivery_fee || 0}
                      onChange={(e) => updateSetting('delivery_fee', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      {getTranslation('admin', 'minimumOrder', language)}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.minimum_order_amount || 0}
                      onChange={(e) => updateSetting('minimum_order_amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      {getTranslation('admin', 'deliveryRadius', language)}
                    </label>
                    <input
                      type="number"
                      value={settings.delivery_radius_km || 0}
                      onChange={(e) => updateSetting('delivery_radius_km', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      {getTranslation('admin', 'estimatedDeliveryTime', language)}
                    </label>
                    <input
                      type="number"
                      value={settings.estimated_delivery_time || 0}
                      onChange={(e) => updateSetting('estimated_delivery_time', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    />
                  </div>
                </div>

                <div className="flex items-center p-4 bg-success-soft rounded-xl">
                  <input
                    type="checkbox"
                    id="accepting_orders"
                    checked={settings.is_accepting_orders}
                    onChange={(e) => updateSetting('is_accepting_orders', e.target.checked)}
                    className="h-4 w-4 text-success focus:ring-[hsl(var(--ring))] border-[hsl(var(--input))] rounded"
                  />
                  <label htmlFor="accepting_orders" className="ml-3 text-sm font-medium text-[hsl(var(--foreground))]">
                    {getTranslation('admin', 'currentlyAcceptingOrders', language)}
                  </label>
                </div>
              </div>
            )}

            {/* Payments & Tax Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      {getTranslation('admin', 'taxRate', language)}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={(settings.tax_rate || 0) * 100}
                      onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value) / 100)}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    />
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'taxRateHelp', language)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      {getTranslation('admin', 'currency', language)}
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
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
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-3">
                    {getTranslation('admin', 'acceptedPaymentMethods', language)}
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center p-4 border border-[hsl(var(--border))] rounded-xl">
                      <input
                        type="checkbox"
                        id="accept_cash"
                        checked={settings.accept_cash}
                        onChange={(e) => updateSetting('accept_cash', e.target.checked)}
                        className="h-4 w-4 text-success focus:ring-[hsl(var(--ring))] border-[hsl(var(--input))] rounded"
                      />
                      <label htmlFor="accept_cash" className="ml-3 flex-1">
                        <span className="text-sm font-medium text-[hsl(var(--foreground))]">{getTranslation('admin', 'cash', language)}</span>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'acceptCashOnDelivery', language)}</p>
                      </label>
                    </div>
                    <div className="flex items-center p-4 border border-[hsl(var(--border))] rounded-xl">
                      <input
                        type="checkbox"
                        id="accept_card"
                        checked={settings.accept_card}
                        onChange={(e) => updateSetting('accept_card', e.target.checked)}
                        className="h-4 w-4 text-success focus:ring-[hsl(var(--ring))] border-[hsl(var(--input))] rounded"
                      />
                      <label htmlFor="accept_card" className="ml-3 flex-1">
                        <span className="text-sm font-medium text-[hsl(var(--foreground))]">{getTranslation('admin', 'creditDebitCard', language)}</span>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'acceptCardPayments', language)}</p>
                      </label>
                    </div>
                    <div className="flex items-center p-4 border border-[hsl(var(--border))] rounded-xl">
                      <input
                        type="checkbox"
                        id="accept_mobile_money"
                        checked={settings.accept_mobile_money}
                        onChange={(e) => updateSetting('accept_mobile_money', e.target.checked)}
                        className="h-4 w-4 text-success focus:ring-[hsl(var(--ring))] border-[hsl(var(--input))] rounded"
                      />
                      <label htmlFor="accept_mobile_money" className="ml-3 flex-1">
                        <span className="text-sm font-medium text-[hsl(var(--foreground))]">{getTranslation('admin', 'mobileMoney', language)}</span>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'acceptMobileWallet', language)}</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Operations Tab */}
            {activeTab === 'operations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">{getTranslation('admin', 'orderTypes', language)}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                    {getTranslation('admin', 'orderTypesHelp', language)}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center p-4 border border-[hsl(var(--border))] rounded-xl">
                      <input
                        type="checkbox"
                        id="accept_delivery"
                        checked={settings.accept_delivery}
                        onChange={(e) => updateSetting('accept_delivery', e.target.checked)}
                        className="h-4 w-4 text-success focus:ring-[hsl(var(--ring))] border-[hsl(var(--input))] rounded"
                      />
                      <label htmlFor="accept_delivery" className="ml-3 flex-1">
                        <span className="text-sm font-medium text-[hsl(var(--foreground))]">🚚 {getTranslation('admin', 'delivery', language)}</span>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'deliveryDescription', language)}</p>
                      </label>
                    </div>
                    <div className="flex items-center p-4 border border-[hsl(var(--border))] rounded-xl">
                      <input
                        type="checkbox"
                        id="accept_dine_in"
                        checked={settings.accept_dine_in}
                        onChange={(e) => updateSetting('accept_dine_in', e.target.checked)}
                        className="h-4 w-4 text-success focus:ring-[hsl(var(--ring))] border-[hsl(var(--input))] rounded"
                      />
                      <label htmlFor="accept_dine_in" className="ml-3 flex-1">
                        <span className="text-sm font-medium text-[hsl(var(--foreground))]">🍽️ {getTranslation('admin', 'dineIn', language)}</span>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'dineInDescription', language)}</p>
                      </label>
                    </div>
                    <div className="flex items-center p-4 border border-[hsl(var(--border))] rounded-xl">
                      <input
                        type="checkbox"
                        id="accept_takeaway"
                        checked={settings.accept_takeaway}
                        onChange={(e) => updateSetting('accept_takeaway', e.target.checked)}
                        className="h-4 w-4 text-success focus:ring-[hsl(var(--ring))] border-[hsl(var(--input))] rounded"
                      />
                      <label htmlFor="accept_takeaway" className="ml-3 flex-1">
                        <span className="text-sm font-medium text-[hsl(var(--foreground))]">🥡 {getTranslation('admin', 'takeaway', language)}</span>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'takeawayDescription', language)}</p>
                      </label>
                    </div>
                  </div>
                  
                  {!settings.accept_delivery && !settings.accept_dine_in && !settings.accept_takeaway && (
                    <div className="mt-4 p-4 bg-warning-soft border border-warning rounded-xl">
                      <p className="text-sm text-warning font-medium">⚠️ {getTranslation('admin', 'orderTypeWarning', language)}</p>
                      <p className="text-xs text-warning mt-1">{getTranslation('admin', 'orderTypeWarningDetail', language)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-[hsl(var(--border))]">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-success-soft rounded-lg p-3">
                <Store className="h-6 w-6 text-success" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'storeStatus', language)}</p>
                <p className={`text-lg font-semibold ${settings.is_accepting_orders ? 'text-success' : 'text-destructive'}`}>
                  {settings.is_accepting_orders ? getTranslation('admin', 'open', language) : getTranslation('admin', 'closed', language)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-[hsl(var(--border))]">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-info-soft rounded-lg p-3">
                <Clock className="h-6 w-6 text-info" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'businessHours', language)}</p>
                <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  {settings.opening_time} - {settings.closing_time}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-[hsl(var(--border))]">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-soft rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'minimumOrder', language)}</p>
                <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
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
