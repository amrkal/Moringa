'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, X, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getLocalizedText } from '@/lib/i18n';
import { buttonStyles, modalStyles, tabStyles, inputStyles } from '@/lib/styles';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ButtonSpinner } from '@/components/ui/spinner';

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
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories/?active_only=false');
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Convert to base64
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
      <div className="mb-8 pb-5 relative">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">{getTranslation('admin', 'categories', language)}</h1>
        <p className="mt-2 text-muted-foreground">{getTranslation('admin', 'manageCategoriesSubtitle', language)} • {categories.length} {categories.length === 1 ? 'category' : 'categories'}</p>
        {/* Gradient accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="search-categories" className="sr-only">
            {getTranslation('admin', 'searchCategories', language)}
          </label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} aria-hidden="true" />
          <input
            id="search-categories"
            type="text"
            placeholder={getTranslation('admin', 'searchCategories', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={getTranslation('admin', 'searchCategories', language)}
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
          className={buttonStyles.add}
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
                className={`mt-4 ${buttonStyles.add}`}
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-blue-500/30 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-500/20 transition-all font-medium hover:scale-105"
                  >
                    <Edit size={16} />
                    {getTranslation('common', 'edit', language)}
                  </button>
                  <button
                    onClick={() => toggleActive(category)}
                    className={category.is_active ? buttonStyles.tableToggleActive : buttonStyles.tableToggleInactive}
                    title={category.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {category.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-500/30 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 transition-all font-medium hover:scale-105"
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
        <div 
          className={modalStyles.backdrop}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
        >
          <div 
            className={modalStyles.card}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={modalStyles.header}>
              <div>
                <h2 
                  id="category-modal-title"
                  className="text-2xl font-bold text-foreground tracking-tight"
                >
                  {editingCategory ? getTranslation('admin', 'editCategory', language) : getTranslation('admin', 'newCategory', language)}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingCategory ? 'Update category information' : 'Add a new category to your menu'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className={modalStyles.closeButton}
                type="button"
                aria-label="Close modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className={modalStyles.body}>
              {/* Language Tabs */}
              <div className={tabStyles.container} role="tablist" aria-label="Language selection">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  role="tab"
                  aria-selected={activeTab === 'en'}
                  aria-controls="language-panel-en"
                  className={activeTab === 'en' ? tabStyles.active : tabStyles.inactive}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ar')}
                  role="tab"
                  aria-selected={activeTab === 'ar'}
                  aria-controls="language-panel-ar"
                  className={activeTab === 'ar' ? tabStyles.active : tabStyles.inactive}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('he')}
                  role="tab"
                  aria-selected={activeTab === 'he'}
                  aria-controls="language-panel-he"
                  className={activeTab === 'he' ? tabStyles.active : tabStyles.inactive}
                >
                  עברית
                </button>
              </div>

              {/* English Tab */}
              {activeTab === 'en' && (
                <div role="tabpanel" id="language-panel-en" aria-labelledby="tab-en">
                  <div>
                    <label htmlFor="category-name-en" className="block text-sm font-medium text-foreground mb-2">
                      {getTranslation('admin', 'englishName', language)} *
                    </label>
                    <input
                      id="category-name-en"
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                      placeholder="Category name in English"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label htmlFor="category-description-en" className="block text-sm font-medium text-foreground mb-2">
                      {getTranslation('admin', 'englishDescription', language)} *
                    </label>
                    <textarea
                      id="category-description-en"
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all resize-none bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                      placeholder="Description in English..."
                      rows={3}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
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
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
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
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all resize-none bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
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
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
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
                      className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all resize-none bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                      placeholder="תיאור בעברית..."
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {getTranslation('admin', 'imageUrl', language)} or Upload
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={formData.image && !formData.image.startsWith('data:') ? formData.image : ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-card text-foreground placeholder:text-muted-foreground"
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="category-image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="category-image-upload"
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
                </div>
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
