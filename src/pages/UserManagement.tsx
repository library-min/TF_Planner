import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Shield, User as UserIcon } from 'lucide-react';
import Card from '../components/Card';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([
    {
      name: '김철수',
      email: 'kim.cs@company.com',
      password: '********',
      role: 'admin',
      avatar: '',
      department: '개발팀'
    },
    {
      name: '이영희',
      email: 'lee.yh@company.com',
      password: '********',
      role: 'user',
      avatar: '',
      department: 'UX/UI팀'
    },
    {
      name: '박민수',
      email: 'park.ms@company.com',
      password: '********',
      role: 'user',
      avatar: '',
      department: '백엔드팀'
    },
    {
      name: '정수진',
      email: 'jung.sj@company.com',
      password: '********',
      role: 'user',
      avatar: '',
      department: '프론트엔드팀'
    },
    {
      name: '최영수',
      email: 'choi.ys@company.com',
      password: '********',
      role: 'admin',
      avatar: '',
      department: '관리팀'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    department: ''
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    if (formData.name && formData.email && formData.password && formData.department) {
      const newUser: User = {
        ...formData,
        avatar: ''
      };
      setUsers([...users, newUser]);
      setFormData({ name: '', email: '', password: '', role: 'user', department: '' });
      setShowAddModal(false);
    }
  };

  const handleEditUser = () => {
    if (selectedUser && formData.name && formData.email && formData.department) {
      const updatedUsers = users.map(user =>
        user.email === selectedUser.email ? { ...user, ...formData } : user
      );
      setUsers(updatedUsers);
      setFormData({ name: '', email: '', password: '', role: 'user', department: '' });
      setSelectedUser(null);
      setShowEditModal(false);
    }
  };

  const handleDeleteUser = (userEmail: string) => {
    if (window.confirm(t('users.confirmDelete'))) {
      setUsers(users.filter(user => user.email !== userEmail));
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      department: user.department
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'user', department: '' });
    setSelectedUser(null);
  };

  const getRoleText = (role: string) => {
    return role === 'admin' ? t('users.admin') : t('users.user');
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Shield className="w-4 h-4 text-red-600" /> : <UserIcon className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('users.title')}</h1>
          <p className="text-gray-600 mt-2">{t('users.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('users.addUser')}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('users.search')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('users.allRoles')}</option>
            <option value="admin">{t('users.admin')}</option>
            <option value="user">{t('users.user')}</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">{t('users.name')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">{t('users.email')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">{t('users.role')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">{t('users.department')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">{t('users.status')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.email} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {user.name[0]}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className="ml-2 text-sm">{getRoleText(user.role)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.department}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-medium">
                      {t('users.active')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title={t('users.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.email)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title={t('users.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <UserIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900">{t('users.noResults')}</h3>
            <p className="text-gray-500">{t('users.tryDifferent')}</p>
          </div>
        )}
      </Card>

      {/* 사용자 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title={t('users.admin')} className="border-l-4 border-red-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-gray-600">명</div>
          </div>
        </Card>

        <Card title={t('users.user')} className="border-l-4 border-blue-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'user').length}
            </div>
            <div className="text-gray-600">명</div>
          </div>
        </Card>

        <Card title={t('users.active')} className="border-l-4 border-green-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.length}
            </div>
            <div className="text-gray-600">명</div>
          </div>
        </Card>
      </div>

      {/* 사용자 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('addUser.title')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addUser.name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('addUser.namePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addUser.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('addUser.emailPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addUser.password')}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('addUser.passwordPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addUser.role')}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">{t('users.user')}</option>
                  <option value="admin">{t('users.admin')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addUser.department')}</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('addUser.departmentPlaceholder')}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('addUser.cancel')}
              </button>
              <button
                onClick={handleAddUser}
                disabled={!formData.name || !formData.email || !formData.password || !formData.department}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('addUser.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 편집 모달 */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">사용자 편집</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addUser.name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('addUser.namePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addUser.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('addUser.emailPlaceholder')}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addUser.role')}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">{t('users.user')}</option>
                  <option value="admin">{t('users.admin')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addUser.department')}</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('addUser.departmentPlaceholder')}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleEditUser}
                disabled={!formData.name || !formData.email || !formData.department}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;