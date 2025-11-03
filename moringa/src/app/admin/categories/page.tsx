'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, X, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getLocalizedText } from '@/lib/i18n';

interface Category {
  id: string;
  name: string | { en?: string; ar?: string; he?: string };
  name_en?: string;
  name_ar?: string;
  name_he?: string;
  description?: string | { en?: string; ar?: string; he?: string };
  description_en?: string;
  description_ar?: string;
  description_he?: string;
  image?: string;
  is_active: boolean;
  created_at: string;
}

export default function CategoriesPage() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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
    image: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories?active_only=false');
      setCategories(response.data || []);
    } catch (error) {
      toast.error(getTranslation('admin', 'failedFetchCategories', language));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingCategory ? getTranslation('admin', 'updatingCategory', language) : getTranslation('admin', 'creatingCategory', language));
    
    try {
      // Map name and description to objects as required by backend
      const payload = {
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
        image: formData.image || undefined,
        is_active: formData.is_active,
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
        toast.success(getTranslation('admin', 'categoryUpdated', language), { id: loadingToast });
      } else {
        await api.post('/categories', payload);
        toast.success(getTranslation('admin', 'categoryCreated', language), { id: loadingToast });
      }
      
      closeModal();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedSaveCategory', language), { id: loadingToast });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    const name = typeof category.name === 'string' 
      ? category.name 
      : getLocalizedText({ en: category.name?.en ?? '', ar: category.name?.ar ?? '', he: category.name?.he ?? '' }, language);
    const description = typeof category.description === 'string'
      ? category.description ?? ''
      : getLocalizedText({ en: category.description?.en ?? '', ar: category.description?.ar ?? '', he: category.description?.he ?? '' }, language);
    setFormData({
      name,
      name_en: category.name_en || (typeof category.name === 'object' ? category.name?.en : '') || '',
      name_ar: category.name_ar || (typeof category.name === 'object' ? category.name?.ar : '') || '',
      name_he: category.name_he || (typeof category.name === 'object' ? category.name?.he : '') || '',
      description,
      description_en: category.description_en || (typeof category.description === 'object' ? category.description?.en : '') || '',
      description_ar: category.description_ar || (typeof category.description === 'object' ? category.description?.ar : '') || '',
      description_he: category.description_he || (typeof category.description === 'object' ? category.description?.he : '') || '',
      image: category.image || '',
      is_active: category.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(getTranslation('admin', 'confirmDeleteCategory', language))) return;
    
    const loadingToast = toast.loading(getTranslation('admin', 'deletingCategory', language));
    try {
      await api.delete(`/categories/${id}`);
      toast.success(getTranslation('admin', 'categoryDeleted', language), { id: loadingToast });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedDeleteCategory', language), { id: loadingToast });
    }
  };

  const toggleActive = async (category: Category) => {
    const loadingToast = toast.loading(getTranslation('admin', 'updatingStatus', language));
    try {
      await api.put(`/categories/${category.id}`, { 
        is_active: !category.is_active 
      });
      toast.success(!category.is_active ? getTranslation('admin', 'categoryActivated', language) : getTranslation('admin', 'categoryDeactivated', language), { id: loadingToast });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedUpdateCategory', language), { id: loadingToast });
    }
  };

  const openModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', name_en: '', name_ar: '', name_he: '', description: '', description_en: '', description_ar: '', description_he: '', image: '', is_active: true });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', name_en: '', name_ar: '', name_he: '', description: '', description_en: '', description_ar: '', description_he: '', image: '', is_active: true });
  };

  const filteredCategories = categories.filter(category => {
    const name = typeof category.name === 'string' 
      ? category.name 
      : getLocalizedText({ en: category.name?.en ?? '', ar: category.name?.ar ?? '', he: category.name?.he ?? '' }, language);
    const description = typeof category.description === 'string'
      ? category.description
      : getLocalizedText({ en: category.description?.en ?? '', ar: category.description?.ar ?? '', he: category.description?.he ?? '' }, language);
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (description && description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">{getTranslation('admin', 'categories', language)}</h1>
        <p className="mt-2 text-muted-foreground">{getTranslation('admin', 'manageCategoriesSubtitle', language)} • {categories.length} {categories.length === 1 ? 'category' : 'categories'}</p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder={getTranslation('admin', 'searchCategories', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-card text-foreground placeholder:text-muted-foreground shadow-sm"
          />
          {searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {filteredCategories.length} found
              </span>
            </div>
          )}
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 hover:scale-105 transition-all shadow-lg hover:shadow-xl font-medium"
        >
          <Plus size={20} strokeWidth={2.5} />
          {getTranslation('admin', 'addCategory', language)}
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="h-48 bg-muted animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                <div className="flex gap-2 pt-2">
                  <div className="h-9 bg-muted rounded flex-1 animate-pulse" />
                  <div className="h-9 bg-muted rounded flex-1 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 bg-muted rounded-full">
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </p>
              <p className="text-muted-foreground">
                {searchTerm ? `No results for "${searchTerm}"` : 'Get started by adding your first category'}
              </p>
            </div>
            {!searchTerm && (
              <button
                onClick={openModal}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 hover:scale-105 transition-all shadow-lg font-medium"
              >
                <Plus size={20} />
                {getTranslation('admin', 'addCategory', language)}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={typeof category.name === 'string' ? category.name : getLocalizedText({ en: category.name?.en ?? '', ar: category.name?.ar ?? '', he: category.name?.he ?? '' }, language)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md transition-all ${
                    category.is_active
                      ? 'bg-green-500/90 text-white'
                      : 'bg-gray-500/90 text-white'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                  {typeof category.name === 'string' ? category.name : getLocalizedText({ en: category.name?.en ?? '', ar: category.name?.ar ?? '', he: category.name?.he ?? '' }, language)}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {category.description 
                    ? (typeof category.description === 'string' ? category.description : getLocalizedText({ en: category.description?.en ?? '', ar: category.description?.ar ?? '', he: category.description?.he ?? '' }, language))
                    : 'No description provided'
                  }
                </p>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-500/20 transition-all font-medium hover:scale-105"
                  >
                    <Edit size={16} />
                    {getTranslation('common', 'edit', language)}
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 transition-all font-medium hover:scale-105"
                  >
                    <Trash2 size={16} />
                    {getTranslation('admin', 'delete', language)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div 
            className="bg-card rounded-3xl max-w-2xl w-full shadow-2xl border border-border animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  {editingCategory ? getTranslation('admin', 'editCategory', language) : getTranslation('admin', 'newCategory', language)}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingCategory ? 'Update category information' : 'Add a new category to your menu'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2.5 hover:bg-muted rounded-xl transition-all hover:scale-110"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Language Tabs */}
              <div className="flex gap-1 p-1 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'en'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ar')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'ar'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('he')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'he'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
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
                      placeholder="Category name in English"
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
                  {getTranslation('admin', 'imageUrl', language)}
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-card text-foreground placeholder:text-muted-foreground"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-4 p-2 bg-muted/30 rounded-xl">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = '';
                        toast.error(getTranslation('admin', 'invalidImageUrl', language));
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-5 w-5 text-primary focus:ring-2 focus:ring-primary/50 border-border rounded-md cursor-pointer"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-foreground cursor-pointer flex-1">
                  {getTranslation('admin', 'activeVisibleCustomers', language)}
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-border mt-6 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border-2 border-border rounded-xl text-foreground hover:bg-muted/50 transition-all font-medium hover:scale-105"
                >
                  {getTranslation('admin', 'cancel', language)}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:shadow-xl transition-all font-medium hover:scale-105"
                >
                  {editingCategory ? getTranslation('admin', 'update', language) : getTranslation('admin', 'create', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
