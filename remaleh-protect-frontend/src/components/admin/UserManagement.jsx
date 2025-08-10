import React, { useState, useEffect } from 'react';
import { api, API_ENDPOINTS } from '../../lib/api';
import MobileModal from '../MobileModal';

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
      console.log('Users response:', response);
      
      if (response.data && response.data.users) {
        setUsers(response.data.users);
        setPagination(response.data.pagination || {});
        setError(null);
      } else {
        console.error('Unexpected response format:', response);
        setError('Invalid response format from server');
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
          endpoint = `/admin/users/${userId}/suspend`;
          break;
        case 'activate':
          endpoint = `/admin/users/${userId}/activate`;
          break;
        case 'delete':
          endpoint = `/admin/users/${userId}/delete`;
          method = 'DELETE';
          break;
        default:
          return;
      }

      await api.request({
        method,
        url: endpoint
      });

      // Refresh users list
      fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      console.error('User action error:', err);
      alert(`Failed to ${action} user: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    try {
      await api.post('/admin/users/bulk-action', {
        user_ids: selectedUsers,
        action: bulkAction
      });

      // Refresh users list
      fetchUsers();
      setSelectedUsers([]);
      setShowBulkModal(false);
      setBulkAction('');
    } catch (err) {
      console.error('Bulk action error:', err);
      alert(`Failed to perform bulk action: ${err.response?.data?.error || err.message}`);
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
              onChange={(e) => handleUserAction(user.id, e.target.value)}
              className="text-sm border rounded px-2 py-1"
              defaultValue=""
            >
              <option value="" disabled>Actions</option>
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
    <MobileModal
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
    </MobileModal>
  );

  const BulkActionModal = () => (
    <MobileModal
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
            <option value="suspend">Suspend</option>
            <option value="activate">Activate</option>
            <option value="delete">Delete</option>
          </select>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Apply Action
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
    </MobileModal>
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
            {selectedUsers.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Bulk Actions ({selectedUsers.length})
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
    </div>
  );
};

export default UserManagement;
