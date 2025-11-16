'use client';

import { useState, useEffect } from 'react';
import { User, Plus, Edit, Trash2, Search, Filter, UserPlus, Shield, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { formatDateShort } from '@/lib/utils';
import { buttonStyles, modalStyles, inputStyles } from '@/lib/styles';

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Users Management</h1>
          <p className="mt-2 text-muted-foreground">Manage user accounts and permissions • {users.length} total users</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-card text-foreground placeholder:text-muted-foreground shadow-sm"
              />
              {searchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {filteredUsers.length} found
                  </span>
                </div>
              )}
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary bg-card text-foreground shadow-sm font-medium"
            >
              <option value="all">All Roles</option>
              <option value="CUSTOMER">Customers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
          <button
            onClick={openModal}
            className={buttonStyles.add}
          >
            <UserPlus size={20} strokeWidth={2.5} />
            Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="w-20 h-8 bg-muted rounded-full" />
                  <div className="flex gap-2">
                    <div className="w-9 h-9 bg-muted rounded-lg" />
                    <div className="w-9 h-9 bg-muted rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-muted rounded-full">
                  <User className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-foreground">
                    {searchTerm || roleFilter !== 'all' ? 'No users found' : 'No users yet'}
                  </p>
                  <p className="text-muted-foreground">
                    {searchTerm || roleFilter !== 'all' 
                      ? 'Try adjusting your filters or search term'
                      : 'Get started by adding your first user'
                    }
                  </p>
                </div>
                {!searchTerm && roleFilter === 'all' && (
                  <button
                    onClick={openModal}
                    className={`mt-4 ${buttonStyles.add}`}
                  >
                    <UserPlus size={20} />
                    Add User
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gradient-to-r from-muted/50 to-muted/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-all group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10">
                            <span className="text-sm font-bold text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">{user.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {user.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{user.phone}</div>
                        {user.email && (
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-500/10 text-purple-700' 
                            : 'bg-blue-500/10 text-blue-700'
                        }`}>
                          {user.role === 'ADMIN' ? <Shield size={14} /> : <User size={14} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(user)}
                          className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border-2 transition-all hover:scale-105 ${
                            user.is_active
                              ? 'border-green-500/30 bg-green-500/10 text-green-700 hover:bg-green-500/20'
                              : 'border-gray-400/30 bg-gray-500/10 text-gray-700 hover:bg-gray-500/20'
                          }`}
                        >
                          {user.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                          {user.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDateShort(new Date(user.created_at), language)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2.5 rounded-xl border-2 border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all hover:scale-110"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
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
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500/10 rounded-xl p-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role === 'CUSTOMER').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500/10 rounded-xl p-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500/10 rounded-xl p-3">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className={modalStyles.backdrop}
          onClick={closeModal}
        >
          <div 
            className={modalStyles.card}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.header}>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  {editingUser ? 'Edit User' : 'New User'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingUser ? 'Update user information' : 'Add a new user to the system'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className={modalStyles.closeButton}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className={modalStyles.body}>
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
                  className={inputStyles.select}
                  required
                >
                  <option value="CUSTOMER">{getTranslation('admin', 'customerRole', language)}</option>
                  <option value="ADMIN">{getTranslation('admin', 'adminRole', language)}</option>
                </select>
              </div>
              </div>

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
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
