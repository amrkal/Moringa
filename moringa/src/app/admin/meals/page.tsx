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
import { buttonStyles, modalStyles, tabStyles, inputStyles } from '@/lib/styles';

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
  is_spicy?: boolean;
  is_popular?: boolean;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_available?: boolean;
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
    is_active: true,
    is_available: true,
    is_spicy: false,
    is_popular: false,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false
  });
  // selection per ingredient: mode (none|default|extra), removable applies only to default
  const [ingredientSelection, setIngredientSelection] = useState<Record<string, { mode: 'none'|'default'|'extra'; removable: boolean }>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {

    fetchMeals();
    fetchCategories();
    fetchIngredients();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await api.get('/meals', { params: { active_only: false } });
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
      const response = await api.get('/categories', { params: { active_only: false } });
      setCategories(response.data);
    } catch (error) {
      toast.error(getTranslation('admin', 'failedFetchCategories', language));
      console.error(error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients', { params: { active_only: true } });
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
      is_available: formData.is_available,
      is_spicy: formData.is_spicy,
      is_popular: formData.is_popular,
      is_vegetarian: formData.is_vegetarian,
      is_vegan: formData.is_vegan,
      is_gluten_free: formData.is_gluten_free,
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
        is_active: meal.is_active,
        is_available: meal.is_available ?? true,
        is_spicy: meal.is_spicy ?? false,
        is_popular: meal.is_popular ?? false,
        is_vegetarian: meal.is_vegetarian ?? false,
        is_vegan: meal.is_vegan ?? false,
        is_gluten_free: meal.is_gluten_free ?? false
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
        is_active: true,
        is_available: true,
        is_spicy: false,
        is_popular: false,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false
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
      is_active: true,
      is_available: true,
      is_spicy: false,
      is_popular: false,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false
    });
    setIngredientSelection({});
    setIngredientSearch('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image: base64String });
        setUploadingImage(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
      setUploadingImage(false);
    }
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
        <div className="flex justify-between items-center pb-5 relative">
          <div>
            <h1 className="text-3xl font-bold">{getTranslation('admin', 'mealsManagement', language)}</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your menu items and ingredients</p>
          </div>
          <button
            onClick={() => openModal()}
            className={buttonStyles.add}
          >
            <Plus size={20} />
            {getTranslation('admin', 'addMeal', language)}
          </button>
          {/* Gradient accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
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

        <div className="card-premium overflow-hidden relative">
          {/* Decorative gradient accent positioned above the table to avoid invalid thead children */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
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
                        className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                          meal.is_active 
                            ? 'border-orange-500/30 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' 
                            : 'border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/20'
                        }`}
                        title={meal.is_active ? getTranslation('admin', 'deactivate', language) : getTranslation('admin', 'activate', language)}
                      >
                        {meal.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => openModal(meal)}
                        className="p-2 rounded-lg border-2 border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all hover:scale-105"
                        title={getTranslation('common', 'edit', language)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        className="p-2 rounded-lg border-2 border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all hover:scale-105"
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
        <div 
          className={modalStyles.backdrop}
          onClick={closeModal}
        >
          <div 
            className={modalStyles.cardLarge}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={modalStyles.header}>
              <h2 className="text-2xl font-bold text-foreground">
                {editingMeal ? getTranslation('admin', 'editMeal', language) : getTranslation('admin', 'newMeal', language)}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className={modalStyles.closeButton}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className={modalStyles.body}>
              {/* Language Tabs */}
              <div className={tabStyles.container}>
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={activeTab === 'en' ? tabStyles.active : tabStyles.inactive}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ar')}
                  className={activeTab === 'ar' ? tabStyles.active : tabStyles.inactive}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('he')}
                  className={activeTab === 'he' ? tabStyles.active : tabStyles.inactive}
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
                  className={inputStyles.select}
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
                  {getTranslation('admin', 'imageUrl', language)} or Upload
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={formData.image && !formData.image.startsWith('data:') ? formData.image : ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card text-foreground placeholder:text-muted-foreground"
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="meal-image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="meal-image-upload"
                      className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-border rounded-xl hover:border-primary transition-all cursor-pointer ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm text-muted-foreground">Click to upload image (max 5MB)</span>
                        </>
                      )}
                    </label>
                  </div>
                  {formData.image && (
                    <div className="mt-3 p-2 bg-muted/30 rounded-xl">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
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
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all hover:scale-105 ${
                              config.mode === 'none'
                                ? 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : config.mode === 'default'
                                ? 'border-primary/30 bg-primary/20 text-primary hover:bg-primary/30'
                                : 'border-purple-500/30 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20'
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
                              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border-2 transition-all hover:scale-105 ${
                                config.removable
                                  ? 'border-orange-500/30 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20'
                                  : 'border-gray-400/30 bg-gray-200 text-gray-700 hover:bg-gray-300'
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

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_spicy}
                      onChange={e => setFormData({ ...formData, is_spicy: e.target.checked })}
                      className="accent-red-500 w-5 h-5"
                    />
                    <span className="text-foreground font-medium">Spicy 🌶️</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_popular}
                      onChange={e => setFormData({ ...formData, is_popular: e.target.checked })}
                      className="accent-yellow-400 w-5 h-5"
                    />
                    <span className="text-foreground font-medium">Popular ⭐</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_vegetarian}
                      onChange={e => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                      className="accent-green-600 w-5 h-5"
                    />
                    <span className="text-foreground font-medium">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_vegan}
                      onChange={e => setFormData({ ...formData, is_vegan: e.target.checked })}
                      className="accent-emerald-600 w-5 h-5"
                    />
                    <span className="text-foreground font-medium">Vegan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_gluten_free}
                      onChange={e => setFormData({ ...formData, is_gluten_free: e.target.checked })}
                      className="accent-sky-600 w-5 h-5"
                    />
                    <span className="text-foreground font-medium">Gluten‑free</span>
                  </label>
                </div>
              </div>
              </div>

              {/* Modal Footer - Fixed at bottom */}
              <div className={modalStyles.footer}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={`${buttonStyles.secondary} flex-1`}
                >
                  {getTranslation('admin', 'cancel', language)}
                </button>
                <button
                  type="submit"
                  className={`${buttonStyles.primary} flex-1`}
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

