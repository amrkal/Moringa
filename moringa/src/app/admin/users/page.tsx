'use client';

import { useState, useEffect } from 'react';
import { User, Plus, Edit, Trash2, Search, Filter, UserPlus, Shield, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { formatDateShort } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'ADMIN' | 'CUSTOMER';
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'CUSTOMER' as 'ADMIN' | 'CUSTOMER',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
  const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (error) {
      toast.error(getTranslation('admin', 'failedLoadUsers', language));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingUser ? getTranslation('admin', 'updatingUser', language) : getTranslation('admin', 'creatingUser', language));

    try {
      if (editingUser) {
  await api.put(`/users/${editingUser.id}`, formData);
        toast.success(getTranslation('admin', 'userUpdated', language), { id: loadingToast });
      } else {
  await api.post('/users', formData);
        toast.success(getTranslation('admin', 'userCreated', language), { id: loadingToast });
      }

      closeModal();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedSaveUser', language), { id: loadingToast });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      role: user.role || 'CUSTOMER',
      is_active: user.is_active ?? true
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(getTranslation('admin', 'confirmDeleteUser', language))) return;

    const loadingToast = toast.loading(getTranslation('admin', 'deletingUser', language));
    try {
  await api.delete(`/users/${id}`);
      toast.success(getTranslation('admin', 'userDeleted', language), { id: loadingToast });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedDeleteUser', language), { id: loadingToast });
    }
  };

  const toggleActive = async (user: User) => {
    const loadingToast = toast.loading(getTranslation('admin', 'updatingUserStatus', language));
    try {
      await api.put(`/users/${user.id}`, {
        is_active: !user.is_active
      });
      toast.success(!user.is_active ? getTranslation('admin', 'userActivated', language) : getTranslation('admin', 'userDeactivated', language), { id: loadingToast });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('admin', 'failedUpdateUser', language), { id: loadingToast });
    }
  };

  const openModal = () => {
    setEditingUser(null);
    setFormData({ name: '', phone: '', email: '', role: 'CUSTOMER', is_active: true });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', phone: '', email: '', role: 'CUSTOMER', is_active: true });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').includes(searchTerm) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout title={getTranslation('admin', 'usersManagement', language)}>
      <div className="space-y-6" dir="ltr">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-1 gap-4 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder={getTranslation('admin', 'searchUsersByNamePhoneEmail', language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-foreground"
            >
              <option value="all">{getTranslation('admin', 'allRoles', language)}</option>
              <option value="CUSTOMER">{getTranslation('admin', 'customers', language)}</option>
              <option value="ADMIN">{getTranslation('admin', 'admins', language)}</option>
            </select>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg font-medium"
          >
            <UserPlus size={20} />
            {getTranslation('admin', 'addUser', language)}
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <User className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">{getTranslation('admin', 'noUsersFound', language)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm || roleFilter !== 'all' 
                  ? getTranslation('admin', 'tryAdjustingFilters', language)
                  : getTranslation('admin', 'getStartedCreatingUser', language)
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {getTranslation('admin', 'user', language)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {getTranslation('admin', 'contact', language)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {getTranslation('admin', 'role', language)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {getTranslation('admin', 'status', language)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {getTranslation('admin', 'joined', language)}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {getTranslation('admin', 'actions', language)}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">{user.phone}</div>
                        {user.email && (
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-primary-soft text-primary' 
                            : 'bg-info-soft text-info'
                        }`}>
                          {user.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(user)}
                          className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                            user.is_active
                              ? 'bg-success-soft text-success'
                              : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                          }`}
                        >
                          {user.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                          {user.is_active ? getTranslation('admin', 'active', language) : getTranslation('admin', 'inactive', language)}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[hsl(var(--muted-foreground))]">
                        {formatDateShort(new Date(user.created_at), language)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-primary hover:bg-primary-soft p-2 rounded-lg transition-colors is-link"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-destructive hover:bg-destructive-soft p-2 rounded-lg transition-colors is-link"
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
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-[hsl(var(--border))]">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-info-soft rounded-lg p-3">
                <User className="h-6 w-6 text-info" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'totalCustomers', language)}</p>
                <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                  {users.filter(u => u.role === 'CUSTOMER').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-[hsl(var(--border))]">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-soft rounded-lg p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'admins', language)}</p>
                <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-[hsl(var(--border))]">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-success-soft rounded-lg p-3">
                <Eye className="h-6 w-6 text-success" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'activeUsers', language)}</p>
                <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[hsl(var(--foreground))/0.5] backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[hsl(var(--card))] rounded-2xl max-w-md w-full shadow-2xl animate-slideUp border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                {editingUser ? getTranslation('admin', 'editUser', language) : getTranslation('admin', 'newUser', language)}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  {getTranslation('admin', 'userName', language)} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  {getTranslation('common', 'phone', language)} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                  placeholder="+1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  {getTranslation('admin', 'email', language)}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  {getTranslation('admin', 'roleLabel', language)} *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'CUSTOMER' })}
                  className="w-full px-4 py-2.5 border border-[hsl(var(--input))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                  required
                >
                  <option value="CUSTOMER">{getTranslation('admin', 'customerRole', language)}</option>
                  <option value="ADMIN">{getTranslation('admin', 'adminRole', language)}</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-[hsl(var(--ring))] border-[hsl(var(--input))] rounded"
                />
                <label htmlFor="is_active" className="ml-3 text-sm font-medium text-[hsl(var(--foreground))]">
                  {getTranslation('admin', 'activeUserCanLogin', language)}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-2.5 border border-[hsl(var(--input))] rounded-xl text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors font-medium"
                >
                  {getTranslation('common', 'cancel', language)}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2.5 bg-success text-primary-foreground rounded-xl transition-all shadow-lg font-medium"
                >
                  {editingUser ? getTranslation('common', 'update', language) : getTranslation('common', 'create', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
