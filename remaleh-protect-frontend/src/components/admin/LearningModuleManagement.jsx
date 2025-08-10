import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import MobileModal from '../MobileModal';

const LearningModuleManagement = () => {
  const [modules, setModules] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    difficulty: 'BEGINNER',
    estimated_time: '',
    is_active: true
  });

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
    difficulty: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchModules();
  }, [filters]);

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/api/admin/learning-modules?${params}`);
      setModules(response.data.modules || []);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load learning modules');
      console.error('Modules error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateModule = async () => {
    try {
      const moduleData = {
        ...formData,
        estimated_time: parseInt(formData.estimated_time) || 0,
        content: JSON.parse(formData.content || '{}')
      };

              await api.post('/api/admin/learning-modules', moduleData);
      
      // Reset form and refresh
      setFormData({
        title: '',
        description: '',
        content: '',
        difficulty: 'BEGINNER',
        estimated_time: '',
        is_active: true
      });
      setShowCreateModal(false);
      fetchModules();
    } catch (err) {
      console.error('Create module error:', err);
      alert('Failed to create module: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateModule = async () => {
    try {
      const moduleData = {
        ...formData,
        estimated_time: parseInt(formData.estimated_time) || 0,
        content: JSON.parse(formData.content || '{}')
      };

              await api.put(`/api/admin/learning-modules/${selectedModule.id}`, moduleData);
      
      // Reset form and refresh
      setShowEditModal(false);
      setSelectedModule(null);
      fetchModules();
    } catch (err) {
      console.error('Update module error:', err);
      alert('Failed to update module: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleModuleAction = async (moduleId, action) => {
    try {
      let endpoint = '';
      let method = 'POST';

      switch (action) {
        case 'deactivate':
          endpoint = `/api/admin/learning-modules/${moduleId}/deactivate`;
          break;
        case 'activate':
          endpoint = `/api/admin/learning-modules/${moduleId}/activate`;
          break;
        case 'delete':
          endpoint = `/api/admin/learning-modules/${moduleId}`;
          method = 'DELETE';
          break;
        default:
          return;
      }

      await api.request({
        method,
        url: endpoint
      });

      // Refresh modules list
      fetchModules();
    } catch (err) {
      console.error('Module action error:', err);
      alert(`Failed to ${action} module: ${err.response?.data?.error || err.message}`);
    }
  };

  const openEditModal = (module) => {
    setSelectedModule(module);
    setFormData({
      title: module.title,
      description: module.description,
      content: JSON.stringify(module.content, null, 2),
      difficulty: module.difficulty,
      estimated_time: module.estimated_time?.toString() || '',
      is_active: module.is_active
    });
    setShowEditModal(true);
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const ModuleRow = ({ module }) => (
    <div className="bg-white border rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              module.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
              module.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {module.difficulty}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              module.is_active ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {module.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h4 className="font-medium text-gray-900">{module.title}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>Time: {module.estimated_time || 'N/A'} min</span>
            <span>Created: {new Date(module.created_at).toLocaleDateString()}</span>
            <span>Updated: {module.updated_at ? new Date(module.updated_at).toLocaleDateString() : 'Never'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(module)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <div className="relative">
            <select
              onChange={(e) => handleModuleAction(module.id, e.target.value)}
              className="text-sm border rounded px-2 py-1"
              defaultValue=""
            >
              <option value="" disabled>Actions</option>
              {module.is_active && (
                <option value="deactivate">Deactivate</option>
              )}
              {!module.is_active && (
                <option value="activate">Activate</option>
              )}
              <option value="delete">Delete</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const CreateModuleModal = () => (
    <MobileModal
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      title="Create Learning Module"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Module title"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Module description"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (min)</label>
            <input
              type="number"
              value={formData.estimated_time}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_time: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="30"
              min="1"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content (JSON)</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            rows={6}
            placeholder='{"sections": [], "quiz": []}'
          />
          <p className="text-xs text-gray-500 mt-1">Enter valid JSON content structure</p>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
            Module is active
          </label>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={handleCreateModule}
              disabled={!formData.title || !formData.description}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Create Module
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </MobileModal>
  );

  const EditModuleModal = () => (
    <MobileModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      title="Edit Learning Module"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Module title"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Module description"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (min)</label>
            <input
              type="number"
              value={formData.estimated_time}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_time: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="30"
              min="1"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content (JSON)</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            rows={6}
            placeholder='{"sections": [], "quiz": []}'
          />
          <p className="text-xs text-gray-500 mt-1">Enter valid JSON content structure</p>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="edit_is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="edit_is_active" className="ml-2 text-sm text-gray-700">
            Module is active
          </label>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={handleUpdateModule}
              disabled={!formData.title || !formData.description}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Update Module
            </button>
            <button
              onClick={() => setShowEditModal(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </MobileModal>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button
          onClick={fetchModules}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learning Module Management</h1>
            <p className="text-gray-600">Create and manage learning content for users</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Create Module
            </button>
            <button
              onClick={fetchModules}
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
              placeholder="Title or description..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => updateFilters({ difficulty: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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

      {/* Modules List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Learning Modules ({pagination.total || 0})
          </h3>
        </div>
        <div className="p-6">
          {modules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No learning modules found matching your criteria
            </div>
          ) : (
            <div>
              {modules.map(module => (
                <ModuleRow key={module.id} module={module} />
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
      <CreateModuleModal />
      <EditModuleModal />
    </div>
  );
};

export default LearningModuleManagement;
