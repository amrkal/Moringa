 'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
}

interface MealIngredientLink {
  ingredient_id: string;
  is_optional: boolean;
  is_default: boolean;
}

interface Meal {
  id: string;
  name: string;
  name_en?: string;
  name_ar?: string;
  name_he?: string;
  description: string;
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
  name: string;
  price: number;
  is_active: boolean;
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
      toast.error('Failed to fetch meals');
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
      toast.error('Failed to fetch categories');
      console.error(error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients?active_only=true');
      setAllIngredients(response.data);
    } catch (error) {
      toast.error('Failed to fetch ingredients');
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

    const mealData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      category_id: formData.category_id,
      is_active: formData.is_active,
      ingredients
    };

    try {
      if (editingMeal) {
        await api.put(`/meals/${editingMeal.id}`, mealData);
        toast.success('Meal updated successfully');
      } else {
        await api.post('/meals', mealData);
        toast.success('Meal created successfully');
      }
      fetchMeals();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save meal');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      await api.delete(`/meals/${id}`);
      toast.success('Meal deleted successfully');
      fetchMeals();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete meal');
      console.error(error);
    }
  };

  const toggleActive = async (meal: Meal) => {
    try {
      await api.put(`/meals/${meal.id}`, { is_active: !meal.is_active });
      toast.success(`Meal ${!meal.is_active ? 'activated' : 'deactivated'} successfully`);
      fetchMeals();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update meal');
      console.error(error);
    }
  };

  const openModal = (meal?: Meal) => {
    if (meal) {
      setEditingMeal(meal);
      setFormData({
        name: meal.name,
        name_en: meal.name_en || '',
        name_ar: meal.name_ar || '',
        name_he: meal.name_he || '',
        description: meal.description,
        description_en: meal.description_en || '',
        description_ar: meal.description_ar || '',
        description_he: meal.description_he || '',
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

  const filteredIngredients = allIngredients.filter(ing =>
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Meals Management</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={20} />
            Add Meal
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {meals.map((meal) => (
                <tr key={meal.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={meal.image || '/placeholder.png'} 
                      alt={meal.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{meal.name}</div>
                    <div className="text-sm text-gray-500">{meal.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCategoryName(meal.category_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${meal.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      meal.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {meal.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(meal)}
                        className={`p-2 rounded ${
                          meal.is_active ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={meal.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {meal.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => openModal(meal)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded"
                        title="Delete"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingMeal ? 'Edit Meal' : 'Add New Meal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Language Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'en'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ar')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'ar'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('he')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'he'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  עברית
                </button>
              </div>

              {/* Default Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Default Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              {/* English Tab */}
              {activeTab === 'en' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      English Name
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                      placeholder="Meal name in English"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      English Description
                    </label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                      placeholder="Description in English..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Arabic Tab */}
              {activeTab === 'ar' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Arabic Name
                    </label>
                    <input
                      type="text"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                      placeholder="الاسم بالعربية"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Arabic Description
                    </label>
                    <textarea
                      value={formData.description_ar}
                      onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
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
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Hebrew Name
                    </label>
                    <input
                      type="text"
                      value={formData.name_he}
                      onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                      placeholder="שם בעברית"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Hebrew Description
                    </label>
                    <textarea
                      value={formData.description_he}
                      onChange={(e) => setFormData({ ...formData, description_he: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                      placeholder="תיאור בעברית..."
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              {/* Ingredients Section */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Ingredients Configuration
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Configure which ingredients users can add or remove for this meal.
                </p>
                
                <input
                  type="text"
                  placeholder="Search ingredients..."
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                />

                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredIngredients.map((ingredient) => {
                    const config = ingredientSelection[ingredient.id] || { mode: 'none', removable: false };
                    return (
                      <div
                        key={ingredient.id}
                        className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{ingredient.name}</p>
                          <p className="text-xs text-gray-500">+${ingredient.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleIngredientMode(ingredient.id)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              config.mode === 'none'
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : config.mode === 'default'
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {config.mode === 'none' && 'Not included'}
                            {config.mode === 'default' && 'Included by default'}
                            {config.mode === 'extra' && 'Available as extra'}
                          </button>
                          {config.mode === 'default' && (
                            <button
                              type="button"
                              onClick={() => toggleRemovable(ingredient.id)}
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                config.removable
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title={config.removable ? 'User can remove' : 'Required (cannot remove)'}
                            >
                              {config.removable ? '✓ Removable' : '🔒 Required'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click ingredient status to cycle: Not included → Included by default → Available as extra → Not included
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingMeal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
