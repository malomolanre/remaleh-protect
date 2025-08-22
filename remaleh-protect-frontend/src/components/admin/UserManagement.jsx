import React, { useState, useEffect } from 'react';
import MobileModal from '../MobileModal';
import Modal from '../Modal';
import { api } from '../../lib/api';
import { API_ENDPOINTS } from '../../lib/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetForm, setPasswordResetForm] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'USER',
    risk_level: 'MEDIUM',
    account_status: 'ACTIVE',
    is_active: true,
    is_admin: false
  });

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
    role: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`${API_ENDPOINTS.ADMIN.USERS}?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.users) {
          setUsers(data.users);
          setPagination(data.pagination || {});
          setError(null);
        } else {
          console.error('Unexpected response format:', data);
          setError('Invalid response format from server');
        }
      } else {
        console.error('Response not ok:', response.status, response.statusText);
        setError(`Server error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Users error:', err);
      setError(`Failed to load users: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      let endpoint = '';
      let method = 'POST';

      switch (action) {
        case 'suspend':
          endpoint = `${API_ENDPOINTS.ADMIN.USER_SUSPEND}/${userId}/suspend`;
          break;
        case 'activate':
          endpoint = `${API_ENDPOINTS.ADMIN.USER_ACTIVATE}/${userId}/activate`;
          break;
        case 'delete':
          endpoint = `${API_ENDPOINTS.ADMIN.USER_DELETE}/${userId}`;
          method = 'DELETE';
          break;
        default:
          return;
      }

      const response = await api.request({
        method,
        url: endpoint
      });

      if (response.ok) {
        // Refresh users list
        fetchUsers();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Action failed');
      }
    } catch (err) {
      console.error('Action error:', err);
      setError(`Failed to perform action: ${err.message || 'Unknown error'}`);
    }
  };

  const handlePasswordReset = async () => {
    try {
      if (passwordResetForm.new_password !== passwordResetForm.confirm_password) {
        setError('Passwords do not match');
        return;
      }

      if (passwordResetForm.new_password.length < 12) {
        setError('Password must be at least 12 characters long');
        return;
      }

      const response = await api.post(
        `${API_ENDPOINTS.ADMIN.USER_RESET_PASSWORD}/${selectedUser.id}/reset-password`,
        { new_password: passwordResetForm.new_password }
      );

      if (response.ok) {
        setShowPasswordResetModal(false);
        setPasswordResetForm({ new_password: '', confirm_password: '' });
        setError(null);
        // Show success message or refresh users list
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Password reset failed');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError(`Failed to reset password: ${err.message || 'Unknown error'}`);
    }
  };

  const handleBulkAction = async () => {
    try {
      if (!bulkAction) return;

      const response = await api.post(API_ENDPOINTS.ADMIN.BULK_ACTION, {
        user_ids: selectedUsers,
        action: bulkAction
      });

      if (response.ok) {
        setShowBulkModal(false);
        setBulkAction('');
        setSelectedUsers([]);
        fetchUsers();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Bulk action failed');
      }
    } catch (err) {
      console.error('Bulk action error:', err);
      setError(`Failed to perform bulk action: ${err.message || 'Unknown error'}`);
    }
  };

  const handleBulkPasswordReset = async () => {
    try {
      if (passwordResetForm.new_password !== passwordResetForm.confirm_password) {
        setError('Passwords do not match');
        return;
      }

      if (passwordResetForm.new_password.length < 12) {
        setError('Password must be at least 12 characters long');
        return;
      }

      const response = await api.post(API_ENDPOINTS.ADMIN.BULK_RESET_PASSWORD, {
        user_ids: selectedUsers,
        new_password: passwordResetForm.new_password
      });

      if (response.ok) {
        setShowPasswordResetModal(false);
        setPasswordResetForm({ new_password: '', confirm_password: '' });
        setSelectedUsers([]);
        fetchUsers();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Bulk password reset failed');
      }
    } catch (err) {
      console.error('Bulk password reset error:', err);
      setError(`Failed to reset passwords: ${err.message || 'Unknown error'}`);
    }
  };

  const createUser = async () => {
    try {
      // Validate required fields
      if (!createUserForm.email || !createUserForm.password || !createUserForm.first_name || !createUserForm.last_name) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await api.post(API_ENDPOINTS.ADMIN.CREATE_USER, createUserForm);

      if (response.ok) {
        const data = await response.json();
        alert(`User created successfully: ${data.user.email}`);
        
        // Reset form and close modal
        setCreateUserForm({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'USER',
          risk_level: 'MEDIUM',
          account_status: 'ACTIVE',
          is_active: true,
          is_admin: false
        });
        setShowCreateUserModal(false);
        
        // Refresh users list
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(`Failed to create user: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Create user error:', err);
      alert(`Failed to create user: ${err.message || 'Unknown error'}`);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const UserRow = ({ user }) => (
    <div className="bg-white border rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedUsers.includes(user.id)}
            onChange={() => handleUserSelect(user.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
            user.role === 'MODERATOR' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {user.role}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            user.account_status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            user.account_status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
            user.account_status === 'BANNED' ? 'bg-red-200 text-red-900' :
            'bg-gray-100 text-gray-800'
          }`}>
            {user.account_status}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value === 'reset-password') {
                  setSelectedUser(user);
                  setShowPasswordResetModal(true);
                } else {
                  handleUserAction(user.id, e.target.value);
                }
              }}
              className="text-sm border rounded px-2 py-1"
              defaultValue=""
            >
              <option value="" disabled>Actions</option>
              <option value="reset-password">Reset Password</option>
              {user.account_status === 'ACTIVE' && (
                <option value="suspend">Suspend</option>
              )}
              {user.account_status === 'SUSPENDED' && (
                <option value="activate">Activate</option>
              )}
              <option value="delete">Delete</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const UserDetailModal = () => (
    <Modal
      isOpen={showUserModal}
      onClose={() => setShowUserModal(false)}
      title="User Details"
    >
      {selectedUser && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{selectedUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="text-gray-900">{selectedUser.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="text-gray-900">{selectedUser.account_status}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Risk Level</label>
              <p className="text-gray-900">{selectedUser.risk_level}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="text-gray-900">
                {new Date(selectedUser.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowPasswordResetModal(true);
                }}
                className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
              >
                Reset Password
              </button>
              {selectedUser.account_status === 'ACTIVE' && (
                <button
                  onClick={() => {
                    handleUserAction(selectedUser.id, 'suspend');
                    setShowUserModal(false);
                  }}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                >
                  Suspend
                </button>
              )}
              {selectedUser.account_status === 'SUSPENDED' && (
                <button
                  onClick={() => {
                    handleUserAction(selectedUser.id, 'activate');
                    setShowUserModal(false);
                  }}
                  className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => {
                  handleUserAction(selectedUser.id, 'delete');
                  setShowUserModal(false);
                }}
                className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );

  const BulkActionModal = () => (
    <Modal
      isOpen={showBulkModal}
      onClose={() => setShowBulkModal(false)}
      title="Bulk Actions"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action for {selectedUsers.length} selected users
          </label>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select action...</option>
            <option value="reset-passwords">Reset Passwords</option>
            <option value="suspend">Suspend</option>
            <option value="activate">Activate</option>
            <option value="delete">Delete</option>
          </select>
        </div>
        
        {bulkAction === 'reset-passwords' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordResetForm.new_password}
                onChange={(e) => setPasswordResetForm({...passwordResetForm, new_password: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordResetForm.confirm_password}
                onChange={(e) => setPasswordResetForm({...passwordResetForm, confirm_password: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={bulkAction === 'reset-passwords' ? handleBulkPasswordReset : handleBulkAction}
              disabled={!bulkAction || (bulkAction === 'reset-passwords' && (!passwordResetForm.new_password || !passwordResetForm.confirm_password))}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {bulkAction === 'reset-passwords' ? 'Reset Passwords' : 'Apply Action'}
            </button>
            <button
              onClick={() => setShowBulkModal(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );

  const PasswordResetModal = () => (
    <Modal
      isOpen={showPasswordResetModal}
      onClose={() => {
        setShowPasswordResetModal(false);
        setPasswordResetForm({ new_password: '', confirm_password: '' });
      }}
      title={`Reset Password${selectedUsers.length > 1 ? 's' : ''}`}
    >
      <div className="space-y-4">
        {selectedUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              {selectedUsers.length > 1 
                ? `Resetting password for ${selectedUsers.length} selected users`
                : `Resetting password for ${selectedUser.email}`
              }
            </p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={passwordResetForm.new_password}
            onChange={(e) => setPasswordResetForm({...passwordResetForm, new_password: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Enter new password"
          />
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 12 characters long
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={passwordResetForm.confirm_password}
            onChange={(e) => setPasswordResetForm({...passwordResetForm, confirm_password: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Confirm new password"
          />
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={selectedUsers.length > 1 ? handleBulkPasswordReset : handlePasswordReset}
              disabled={!passwordResetForm.new_password || !passwordResetForm.confirm_password}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400"
            >
              Reset Password{selectedUsers.length > 1 ? 's' : ''}
            </button>
            <button
              onClick={() => {
                setShowPasswordResetModal(false);
                setPasswordResetForm({ new_password: '', confirm_password: '' });
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={() => {
                setShowCreateUserModal(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Create User
            </button>
            {selectedUsers.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Bulk Actions ({selectedUsers.length})
              </button>
            )}
            {selectedUsers.length > 0 && (
              <button
                onClick={() => setShowPasswordResetModal(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
              >
                Reset Passwords ({selectedUsers.length})
              </button>
            )}
            <button
              onClick={fetchUsers}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Name or email..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => updateFilters({ role: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
              <option value="DELETED">Deleted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
            <select
              value={filters.per_page}
              onChange={(e) => updateFilters({ per_page: parseInt(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Users ({pagination.total || 0})
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length && users.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">⚠️ {error}</div>
              <button
                onClick={fetchUsers}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users found matching your criteria
            </div>
          ) : (
            <div>
              {users.map(user => (
                <UserRow key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
              {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => updateFilters({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="px-3 py-2 border rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => updateFilters({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-2 border rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserDetailModal />
      <BulkActionModal />
      <PasswordResetModal />
      
      {/* Create User Modal */}
      <Modal
        isOpen={showCreateUserModal}
        onClose={() => {
          setShowCreateUserModal(false);
        }}
        title="Create New User"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={createUserForm.password}
                onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter password"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={createUserForm.first_name}
                onChange={(e) => setCreateUserForm({...createUserForm, first_name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={createUserForm.last_name}
                onChange={(e) => setCreateUserForm({...createUserForm, last_name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={createUserForm.role}
                onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="USER">User</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                value={createUserForm.risk_level}
                onChange={(e) => setCreateUserForm({...createUserForm, risk_level: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={createUserForm.account_status}
                onChange={(e) => setCreateUserForm({...createUserForm, account_status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              checked={createUserForm.is_active}
              onChange={(e) => setCreateUserForm({...createUserForm, is_active: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Account is active
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_admin"
              checked={createUserForm.is_admin}
              onChange={(e) => setCreateUserForm({...createUserForm, is_admin: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_admin" className="text-sm font-medium text-gray-700">
              Admin privileges
            </label>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex space-x-2">
              <button
                onClick={createUser}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Create User
              </button>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
