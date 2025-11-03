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

interface Category {
  id: string;
  name: string | { en?: string; ar?: string; he?: string };
}

interface MealIngredientLink {
  ingredient_id: string;
  is_optional: boolean;
  is_default: boolean;
}

interface Meal {
  id: string;
  name: string | { en?: string; ar?: string; he?: string };
  name_en?: string;
  name_ar?: string;
  name_he?: string;
  description: string | { en?: string; ar?: string; he?: string };
  description_en?: string;
  description_ar?: string;
  description_he?: string;
  price: number;
  image: string;
  category_id: string;
  is_active: boolean;
  created_at: string;
  ingredients?: MealIngredientLink[];
}

interface Ingredient {
  id: string;
  name: string | { en?: string; ar?: string; he?: string };
  price: number;
  is_active: boolean;
}

export default function MealsPage() {
  const { language } = useLanguage();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name'|'price'|'created_at'|'status'>('name');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
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
    image: '',
    category_id: '',
    is_active: true
  });
  // selection per ingredient: mode (none|default|extra), removable applies only to default
  const [ingredientSelection, setIngredientSelection] = useState<Record<string, { mode: 'none'|'default'|'extra'; removable: boolean }>>({});

  useEffect(() => {
    fetchMeals();
    fetchCategories();
    fetchIngredients();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await api.get('/meals?active_only=false');
      setMeals(response.data);
    } catch (error) {
      toast.error(getTranslation('admin', 'failedFetchMeals', language));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?active_only=false');
      setCategories(response.data);
    } catch (error) {
      toast.error(getTranslation('admin', 'failedFetchCategories', language));
      console.error(error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients?active_only=true');
      setAllIngredients(response.data);
    } catch (error) {
      toast.error(getTranslation('admin', 'failedFetchIngredients', language));
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    // Build ingredients array from selection state
    const ingredients = Object.entries(ingredientSelection)
      .filter(([_, config]) => config.mode !== 'none')
      .map(([ingredientId, config]) => ({
        ingredient_id: ingredientId,
        is_default: config.mode === 'default',
        is_optional: config.mode === 'default' ? config.removable : true
      }));

    // Map name and description to objects as required by backend
    const mealData = {
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
      image: formData.image,
      category_id: formData.category_id,
      is_active: formData.is_active,
      ingredients
    };

    try {
      if (editingMeal) {
        await api.put(`/meals/${editingMeal.id}`, mealData);
        toast.success(getTranslation('admin', 'mealUpdated', language));
      } else {
        await api.post('/meals', mealData);
        toast.success(getTranslation('admin', 'mealCreated', language));
      }
      fetchMeals();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedSaveMeal', language));
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(getTranslation('admin', 'confirmDeleteMeal', language))) return;

    try {
      await api.delete(`/meals/${id}`);
      toast.success(getTranslation('admin', 'mealDeleted', language));
      fetchMeals();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedDeleteMeal', language));
      console.error(error);
    }
  };

  const toggleActive = async (meal: Meal) => {
    try {
      await api.put(`/meals/${meal.id}`, { is_active: !meal.is_active });
      toast.success(
        !meal.is_active
          ? getTranslation('admin', 'mealActivated', language)
          : getTranslation('admin', 'mealDeactivated', language)
      );
      fetchMeals();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedUpdateMeal', language));
      console.error(error);
    }
  };

  const openModal = (meal?: Meal) => {
    if (meal) {
      setEditingMeal(meal);
      const name = typeof meal.name === 'string' 
        ? meal.name 
        : getLocalizedText({ en: meal.name?.en ?? '', ar: meal.name?.ar ?? '', he: meal.name?.he ?? '' }, language);
      const description = typeof meal.description === 'string'
        ? meal.description
        : getLocalizedText({ en: meal.description?.en ?? '', ar: meal.description?.ar ?? '', he: meal.description?.he ?? '' }, language);
      setFormData({
        name,
        name_en: meal.name_en || (typeof meal.name === 'object' ? meal.name?.en : '') || '',
        name_ar: meal.name_ar || (typeof meal.name === 'object' ? meal.name?.ar : '') || '',
        name_he: meal.name_he || (typeof meal.name === 'object' ? meal.name?.he : '') || '',
        description,
        description_en: meal.description_en || (typeof meal.description === 'object' ? meal.description?.en : '') || '',
        description_ar: meal.description_ar || (typeof meal.description === 'object' ? meal.description?.ar : '') || '',
        description_he: meal.description_he || (typeof meal.description === 'object' ? meal.description?.he : '') || '',
        price: meal.price.toString(),
        image: meal.image,
        category_id: meal.category_id,
        is_active: meal.is_active
      });
      // Load existing ingredient config
      const selection: Record<string, { mode: 'none'|'default'|'extra'; removable: boolean }> = {};
      (meal.ingredients || []).forEach(link => {
        selection[link.ingredient_id] = {
          mode: link.is_default ? 'default' : 'extra',
          removable: link.is_optional
        };
      });
      setIngredientSelection(selection);
    } else {
      setEditingMeal(null);
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
        image: '',
        category_id: '',
        is_active: true
      });
      setIngredientSelection({});
    }
    setIngredientSearch('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMeal(null);
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
      image: '',
      category_id: '',
      is_active: true
    });
    setIngredientSelection({});
    setIngredientSearch('');
  };

  const toggleIngredientMode = (ingredientId: string) => {
    setIngredientSelection(prev => {
      const current = prev[ingredientId];
      if (!current || current.mode === 'none') {
        return { ...prev, [ingredientId]: { mode: 'default', removable: false } };
      } else if (current.mode === 'default') {
        return { ...prev, [ingredientId]: { mode: 'extra', removable: true } };
      } else {
        const { [ingredientId]: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const toggleRemovable = (ingredientId: string) => {
    setIngredientSelection(prev => {
      const current = prev[ingredientId];
      if (!current || current.mode !== 'default') return prev;
      return { ...prev, [ingredientId]: { ...current, removable: !current.removable } };
    });
  };

  const filteredIngredients = allIngredients.filter(ing => {
    const name = typeof ing.name === 'string' 
      ? ing.name 
      : getLocalizedText({ en: ing.name?.en ?? '', ar: ing.name?.ar ?? '', he: ing.name?.he ?? '' }, language);
    return name.toLowerCase().includes(ingredientSearch.toLowerCase());
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return getTranslation('admin', 'unknown', language);
    return typeof category.name === 'string' 
      ? category.name 
      : getLocalizedText({ en: category.name?.en ?? '', ar: category.name?.ar ?? '', he: category.name?.he ?? '' }, language);
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

  // Derived list with client-side filter + sort for now
  const displayedMeals = [...meals]
    .filter((m) => selectedCategory === 'all' || m.category_id === selectedCategory)
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'name') {
        const an = typeof a.name === 'string' ? a.name : (a.name?.en || a.name_en || '');
        const bn = typeof b.name === 'string' ? b.name : (b.name?.en || b.name_en || '');
        return an.localeCompare(bn) * dir;
      }
      if (sortBy === 'price') {
        return (a.price - b.price) * dir;
      }
      if (sortBy === 'created_at') {
        const at = a.created_at ? Date.parse(a.created_at) : 0;
        const bt = b.created_at ? Date.parse(b.created_at) : 0;
        return (at - bt) * dir;
      }
      if (sortBy === 'status') {
        // active first when asc; inactive first when desc
        const av = a.is_active ? 1 : 0;
        const bv = b.is_active ? 1 : 0;
        return (av - bv) * dir;
      }
      return 0;
    });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{getTranslation('admin', 'mealsManagement', language)}</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus size={20} />
            {getTranslation('admin', 'addMeal', language)}
          </button>
        </div>
        {/* Filters and sorting */}
        <div className="flex flex-wrap gap-3 items-center bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-card text-foreground"
            >
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {typeof c.name === 'string' ? c.name : getLocalizedText({ en: c.name?.en ?? '', ar: c.name?.ar ?? '', he: c.name?.he ?? '' }, language)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-md bg-card text-foreground"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="created_at">Created</option>
              <option value="status">Status</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-md bg-card text-foreground"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
          <div className="text-xs text-muted-foreground ml-auto">
            Showing {displayedMeals.length} of {meals.length}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('admin', 'image', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('common', 'name', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTranslation('admin', 'category', language)}
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
              {displayedMeals.map((meal) => (
                <tr key={meal.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={meal.image || '/placeholder.png'} 
                      alt={typeof meal.name === 'string' ? meal.name : getLocalizedText({ en: meal.name?.en ?? '', ar: meal.name?.ar ?? '', he: meal.name?.he ?? '' }, language)}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground">
                      {typeof meal.name === 'string' ? meal.name : getLocalizedText({ en: meal.name?.en ?? '', ar: meal.name?.ar ?? '', he: meal.name?.he ?? '' }, language)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {typeof meal.description === 'string' ? meal.description : getLocalizedText({ en: meal.description?.en ?? '', ar: meal.description?.ar ?? '', he: meal.description?.he ?? '' }, language)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {getCategoryName(meal.category_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatCurrency(meal.price, language)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      meal.is_active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {meal.is_active
                        ? getTranslation('admin', 'active', language)
                        : getTranslation('admin', 'inactive', language)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(meal)}
                        className={`p-2 rounded ${
                          meal.is_active ? 'text-accent hover:bg-accent/10' : 'text-primary hover:bg-primary/10'
                        }`}
                        title={meal.is_active ? getTranslation('admin', 'deactivate', language) : getTranslation('admin', 'activate', language)}
                      >
                        {meal.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => openModal(meal)}
                        className="text-primary hover:bg-primary/10 p-2 rounded"
                        title={getTranslation('common', 'edit', language)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(meal.id)}
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-card rounded-2xl max-w-2xl w-full shadow-2xl animate-slideUp my-8 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <h2 className="text-2xl font-bold text-foreground">
                {editingMeal ? getTranslation('admin', 'editMeal', language) : getTranslation('admin', 'newMeal', language)}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
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
                      placeholder="Meal name in English"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {getTranslation('admin', 'englishDescription', language)} *
                    </label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-card text-foreground placeholder:text-muted-foreground"
                      placeholder="Description in English..."
                      rows={3}
                      required
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
                      rows={3}
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
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {getTranslation('admin', 'category', language)}
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card text-foreground"
                  required
                >
                  <option value="">{getTranslation('admin', 'selectCategory', language)}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {typeof category.name === 'string' ? category.name : getLocalizedText({ en: category.name?.en ?? '', ar: category.name?.ar ?? '', he: category.name?.he ?? '' }, language)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {getTranslation('common', 'price', language)}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {getTranslation('admin', 'imageUrl', language)}
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              {/* Ingredients Section */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {getTranslation('admin', 'ingredientsConfiguration', language)}
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  {getTranslation('admin', 'ingredientsConfigHelp', language)}
                </p>
                
                <input
                  type="text"
                  placeholder={getTranslation('admin', 'searchIngredients', language)}
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="w-full px-3 py-2 mb-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-foreground placeholder:text-muted-foreground"
                />

                <div className="max-h-60 overflow-y-auto border border-border rounded-lg">
                  {filteredIngredients.map((ingredient) => {
                    const config = ingredientSelection[ingredient.id] || { mode: 'none', removable: false };
                    return (
                      <div
                        key={ingredient.id}
                        className="flex items-center justify-between p-3 border-b border-border hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {typeof ingredient.name === 'string' ? ingredient.name : getLocalizedText({ en: ingredient.name?.en ?? '', ar: ingredient.name?.ar ?? '', he: ingredient.name?.he ?? '' }, language)}
                          </p>
                          <p className="text-xs text-muted-foreground">+{formatCurrency(ingredient.price, language)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleIngredientMode(ingredient.id)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              config.mode === 'none'
                                ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                                : config.mode === 'default'
                                ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                          >
                            {config.mode === 'none' && getTranslation('admin', 'notIncluded', language)}
                            {config.mode === 'default' && getTranslation('common', 'includedByDefault', language)}
                            {config.mode === 'extra' && getTranslation('admin', 'availableAsExtra', language)}
                          </button>
                          {config.mode === 'default' && (
                            <button
                              type="button"
                              onClick={() => toggleRemovable(ingredient.id)}
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                config.removable
                                  ? 'bg-accent/20 text-accent hover:bg-accent/30'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                              title={config.removable ? getTranslation('admin', 'userCanRemove', language) : getTranslation('admin', 'requiredCannotRemove', language)}
                            >
                              {config.removable ? `✓ ${getTranslation('admin', 'removable', language)}` : `🔒 ${getTranslation('admin', 'required', language)}`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {getTranslation('admin', 'ingredientsCycleHint', language)}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                <div>
                  <label htmlFor="is_active" className="font-medium text-foreground">
                    {getTranslation('admin', 'activeStatus', language)}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {getTranslation('admin', 'activeStatusMealHelp', language)}
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
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border flex gap-3 flex-shrink-0">
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
                  {editingMeal ? getTranslation('admin', 'updateMeal', language) : getTranslation('admin', 'createMeal', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

