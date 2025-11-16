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
    image: '',
    is_active: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients', { params: { active_only: false } });
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
      image: formData.image || undefined,
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
        image: (ingredient as any).image || '',
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
        image: '',
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
      image: '',
      is_active: true
    });
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
            className={buttonStyles.add}
          >
            <Plus size={20} />
            {getTranslation('admin', 'addIngredient', language)}
          </button>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {ingredients.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-muted rounded-full">
                  <Plus className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-foreground">No ingredients yet</p>
                  <p className="text-muted-foreground">Get started by adding your first ingredient</p>
                </div>
                <button
                  onClick={() => openModal()}
                  className={`mt-4 ${buttonStyles.add}`}
                >
                  <Plus size={20} />
                  Add Ingredient
                </button>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gradient-to-r from-muted/50 to-muted/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {ingredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-muted/30 transition-all group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-foreground">
                        {typeof ingredient.name === 'string' ? ingredient.name : getLocalizedText({ en: ingredient.name?.en ?? '', ar: ingredient.name?.ar ?? '', he: ingredient.name?.he ?? '' }, language)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {ingredient.description 
                          ? (typeof ingredient.description === 'string' 
                              ? ingredient.description 
                              : getLocalizedText({ en: ingredient.description?.en ?? '', ar: ingredient.description?.ar ?? '', he: ingredient.description?.he ?? '' }, language))
                          : 'No description'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-foreground">
                        {formatCurrency(ingredient.price, language)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(ingredient)}
                        className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border-2 transition-all hover:scale-105 ${
                          ingredient.is_active 
                            ? 'border-green-500/30 bg-green-500/10 text-green-700 hover:bg-green-500/20' 
                            : 'border-gray-400/30 bg-gray-500/10 text-gray-700 hover:bg-gray-500/20'
                        }`}
                      >
                        {ingredient.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        {ingredient.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openModal(ingredient)}
                          className="p-2.5 rounded-xl border-2 border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all hover:scale-110"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ingredient.id)}
                          className="p-2.5 rounded-xl border-2 border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div 
          className={modalStyles.backdrop}
          onClick={closeModal}
        >
          <div 
            className={modalStyles.card}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={modalStyles.header}>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  {editingIngredient ? 'Edit Ingredient' : 'New Ingredient'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingIngredient ? 'Update ingredient information' : 'Add a new ingredient to the menu'}
                </p>
              </div>
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
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-card text-foreground placeholder:text-muted-foreground font-medium"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Image URL or Upload
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
                      id="ingredient-image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="ingredient-image-upload"
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
              </div>

              {/* Modal Footer - Fixed at bottom */}
              <div className={modalStyles.footer}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={`${buttonStyles.secondary} flex-1`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${buttonStyles.primary} flex-1`}
                >
                  {editingIngredient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
