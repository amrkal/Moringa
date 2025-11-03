'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { formatCurrency } from '@/lib/format';
import { getLocalizedText } from '@/lib/i18n';

interface Ingredient {
  id: string;
  name: string | { en?: string; ar?: string; he?: string };
  name_en?: string;
  name_ar?: string;
  name_he?: string;
  description?: string | { en?: string; ar?: string; he?: string };
  description_en?: string;
  description_ar?: string;
  description_he?: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

export default function IngredientsPage() {
  const { language } = useLanguage();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [activeTab, setActiveTab] = useState<'en' | 'ar' | 'he'>('en');
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    name_ar: '',
    name_he: '',
    description: '',
    description_en: '',
    description_ar: '',
    description_he: '',
    price: '',
    is_active: true
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients?active_only=false');
      setIngredients(response.data);
    } catch (error) {
      toast.error(getTranslation('admin', 'failedFetchIngredients', language));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    // Map name and description to objects as required by backend
    const ingredientData = {
      name: {
        en: formData.name,
        ar: formData.name_ar || '',
        he: formData.name_he || ''
      },
      description: {
        en: formData.description,
        ar: formData.description_ar || '',
        he: formData.description_he || ''
      },
      price: parseFloat(formData.price),
      is_active: formData.is_active
    };

    try {
      if (editingIngredient) {
        await api.put(`/ingredients/${editingIngredient.id}`, ingredientData);
        toast.success(getTranslation('admin', 'ingredientUpdated', language));
      } else {
        await api.post('/ingredients', ingredientData);
        toast.success(getTranslation('admin', 'ingredientCreated', language));
      }
      fetchIngredients();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedSaveIngredient', language));
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(getTranslation('admin', 'confirmDeleteIngredient', language))) return;

    try {
      await api.delete(`/ingredients/${id}`);
      toast.success(getTranslation('admin', 'ingredientDeleted', language));
      fetchIngredients();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedDeleteIngredient', language));
      console.error(error);
    }
  };

  const toggleActive = async (ingredient: Ingredient) => {
    try {
      await api.put(`/ingredients/${ingredient.id}`, { is_active: !ingredient.is_active });
      toast.success(
        !ingredient.is_active
          ? getTranslation('admin', 'ingredientActivated', language)
          : getTranslation('admin', 'ingredientDeactivated', language)
      );
      fetchIngredients();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedUpdateIngredient', language));
      console.error(error);
    }
  };

  const openModal = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      const name = typeof ingredient.name === 'string' 
        ? ingredient.name 
        : getLocalizedText({ en: ingredient.name?.en ?? '', ar: ingredient.name?.ar ?? '', he: ingredient.name?.he ?? '' }, language);
      const description = typeof ingredient.description === 'string'
        ? ingredient.description ?? ''
        : getLocalizedText({ en: ingredient.description?.en ?? '', ar: ingredient.description?.ar ?? '', he: ingredient.description?.he ?? '' }, language);
      setFormData({
        name,
        name_en: ingredient.name_en || (typeof ingredient.name === 'object' ? ingredient.name?.en : '') || '',
        name_ar: ingredient.name_ar || (typeof ingredient.name === 'object' ? ingredient.name?.ar : '') || '',
        name_he: ingredient.name_he || (typeof ingredient.name === 'object' ? ingredient.name?.he : '') || '',
        description,
        description_en: ingredient.description_en || (typeof ingredient.description === 'object' ? ingredient.description?.en : '') || '',
        description_ar: ingredient.description_ar || (typeof ingredient.description === 'object' ? ingredient.description?.ar : '') || '',
        description_he: ingredient.description_he || (typeof ingredient.description === 'object' ? ingredient.description?.he : '') || '',
        price: ingredient.price.toString(),
        is_active: ingredient.is_active
      });
    } else {
      setEditingIngredient(null);
      setFormData({
        name: '',
        name_en: '',
        name_ar: '',
        name_he: '',
        description: '',
        description_en: '',
        description_ar: '',
        description_he: '',
        price: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIngredient(null);
    setFormData({
      name: '',
      name_en: '',
      name_ar: '',
      name_he: '',
      description: '',
      description_en: '',
      description_ar: '',
      description_he: '',
      price: '',
      is_active: true
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{getTranslation('admin', 'loading', language)}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">{getTranslation('admin', 'ingredientsManagement', language)}</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus size={20} />
            {getTranslation('admin', 'addIngredient', language)}
          </button>
        </div>

        <div className="bg-card rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('common', 'name', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('common', 'price', language)}
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
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {typeof ingredient.name === 'string' ? ingredient.name : getLocalizedText({ en: ingredient.name?.en ?? '', ar: ingredient.name?.ar ?? '', he: ingredient.name?.he ?? '' }, language)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatCurrency(ingredient.price, language)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ingredient.is_active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {ingredient.is_active
                        ? getTranslation('admin', 'active', language)
                        : getTranslation('admin', 'inactive', language)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(ingredient)}
                        className={`p-2 rounded ${
                          ingredient.is_active ? 'text-accent hover:bg-accent/10' : 'text-primary hover:bg-primary/10'
                        }`}
                        title={ingredient.is_active ? getTranslation('admin', 'deactivate', language) : getTranslation('admin', 'activate', language)}
                      >
                        {ingredient.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => openModal(ingredient)}
                        className="text-primary hover:bg-primary/10 p-2 rounded"
                        title={getTranslation('common', 'edit', language)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient.id)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded"
                        title={getTranslation('admin', 'delete', language)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-2xl animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">
                {editingIngredient
                  ? getTranslation('admin', 'editIngredient', language)
                  : getTranslation('admin', 'newIngredient', language)}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Language Tabs */}
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'en'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ar')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'ar'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('he')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'he'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  עברית
                </button>
              </div>

              {/* English Tab */}
              {activeTab === 'en' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {getTranslation('admin', 'englishName', language)} *
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card text-foreground placeholder:text-muted-foreground"
                      placeholder="Ingredient name in English"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {getTranslation('admin', 'englishDescription', language)}
                    </label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-card text-foreground placeholder:text-muted-foreground"
                      placeholder="Description in English..."
                      rows={2}
                    />
                  </div>
                </>
              )}

              {/* Arabic Tab */}
              {activeTab === 'ar' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {getTranslation('admin', 'arabicName', language)}
                    </label>
                    <input
                      type="text"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card text-foreground placeholder:text-muted-foreground"
                      placeholder="الاسم بالعربية"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {getTranslation('admin', 'arabicDescription', language)}
                    </label>
                    <textarea
                      value={formData.description_ar}
                      onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-card text-foreground placeholder:text-muted-foreground"
                      placeholder="الوصف بالعربية..."
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                </>
              )}

              {/* Hebrew Tab */}
              {activeTab === 'he' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {getTranslation('admin', 'hebrewName', language)}
                    </label>
                    <input
                      type="text"
                      value={formData.name_he}
                      onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card text-foreground placeholder:text-muted-foreground"
                      placeholder="שם בעברית"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {getTranslation('admin', 'hebrewDescription', language)}
                    </label>
                    <textarea
                      value={formData.description_he}
                      onChange={(e) => setFormData({ ...formData, description_he: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-card text-foreground placeholder:text-muted-foreground"
                      placeholder="תיאור בעברית..."
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {getTranslation('common', 'price', language)}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card text-foreground placeholder:text-muted-foreground"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                <div>
                  <label htmlFor="is_active" className="font-medium text-foreground">
                    {getTranslation('admin', 'activeStatus', language)}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {getTranslation('admin', 'activeStatusHelp', language)}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[hsl(var(--background))] after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl text-foreground hover:bg-muted transition-all font-medium"
                >
                  {getTranslation('admin', 'cancel', language)}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-medium shadow-sm hover:shadow"
                >
                  {editingIngredient
                    ? getTranslation('admin', 'updateIngredient', language)
                    : getTranslation('admin', 'createIngredient', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
