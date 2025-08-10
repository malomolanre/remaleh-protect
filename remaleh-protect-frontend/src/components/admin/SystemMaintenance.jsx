import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import MobileModal from '../MobileModal';

const SystemMaintenance = () => {
  const [systemStats, setSystemStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [learningModules, setLearningModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showThreatModal, setShowThreatModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [maintenanceLog, setMaintenanceLog] = useState([]);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, threatsRes, modulesRes] = await Promise.all([
        api.get('/api/admin/system-stats'),
        api.get('/api/admin/threats'),
        api.get('/api/admin/learning-modules')
      ]);
      
      setSystemStats(statsRes.data);
      setThreats(threatsRes.data.threats || []);
      setLearningModules(modulesRes.data.modules || []);
      setError(null);
    } catch (err) {
      setError('Failed to load system data');
      console.error('System data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const performSystemCleanup = async () => {
    try {
      const response = await api.post('/api/admin/maintenance/cleanup');
      setMaintenanceLog(prev => [{
        action: 'System Cleanup',
        timestamp: new Date().toISOString(),
        details: response.data.message,
        deleted_scans: response.data.deleted_scans,
        deleted_reports: response.data.deleted_reports
      }, ...prev]);
      
      // Refresh system stats
      fetchSystemData();
    } catch (err) {
      console.error('Cleanup error:', err);
      alert('Failed to perform system cleanup');
    }
  };

  const handleThreatAction = async (threatId, action) => {
    try {
      let endpoint = '';
      let method = 'POST';

      switch (action) {
        case 'deactivate':
          endpoint = `/api/admin/threats/${threatId}/deactivate`;
          break;
        case 'activate':
          endpoint = `/api/admin/threats/${threatId}/activate`;
          break;
        case 'delete':
          endpoint = `/api/admin/threats/${threatId}`;
          method = 'DELETE';
          break;
        default:
          return;
      }

      await api.request({
        method,
        url: endpoint
      });

      // Refresh threats list
      const response = await api.get('/api/admin/threats');
      setThreats(response.data.threats || []);
    } catch (err) {
      console.error('Threat action error:', err);
      alert(`Failed to ${action} threat: ${err.response?.data?.error || err.message}`);
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
      const response = await api.get('/admin/learning-modules');
      setLearningModules(response.data.modules || []);
    } catch (err) {
      console.error('Module action error:', err);
      alert(`Failed to ${action} module: ${err.response?.data?.error || err.message}`);
    }
  };

  const ThreatRow = ({ threat }) => (
    <div className="bg-white border rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 text-xs rounded-full ${
              threat.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' :
              threat.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {threat.risk_level}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              threat.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {threat.status}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 mt-2">{threat.type}</h4>
          <p className="text-sm text-gray-600 mt-1">{threat.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>Region: {threat.region || 'Global'}</span>
            <span>Impact: {threat.impact_score || 'N/A'}</span>
            <span>Affected: {threat.affected_users || 0}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedThreat(threat);
              setShowThreatModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
          <div className="relative">
            <select
              onChange={(e) => handleThreatAction(threat.id, e.target.value)}
              className="text-sm border rounded px-2 py-1"
              defaultValue=""
            >
              <option value="" disabled>Actions</option>
              {threat.status === 'ACTIVE' && (
                <option value="deactivate">Deactivate</option>
              )}
              {threat.status === 'INACTIVE' && (
                <option value="activate">Activate</option>
              )}
              <option value="delete">Delete</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const ModuleRow = ({ module }) => (
    <div className="bg-white border rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
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
          <h4 className="font-medium text-gray-900 mt-2">{module.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>Time: {module.estimated_time || 'N/A'} min</span>
            <span>Created: {new Date(module.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedModule(module);
              setShowModuleModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
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

  const ThreatDetailModal = () => (
    <MobileModal
      isOpen={showThreatModal}
      onClose={() => setShowThreatModal(false)}
      title="Threat Details"
    >
      {selectedThreat && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="text-gray-900">{selectedThreat.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Risk Level</label>
              <p className="text-gray-900">{selectedThreat.risk_level}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="text-gray-900">{selectedThreat.status}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Region</label>
              <p className="text-gray-900">{selectedThreat.region || 'Global'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Impact Score</label>
              <p className="text-gray-900">{selectedThreat.impact_score || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Affected Users</label>
              <p className="text-gray-900">{selectedThreat.affected_users || 0}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="text-gray-900">{selectedThreat.description}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Reported At</label>
            <p className="text-gray-900">
              {new Date(selectedThreat.reported_at).toLocaleString()}
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
            <div className="flex space-x-2">
              {selectedThreat.status === 'ACTIVE' && (
                <button
                  onClick={() => {
                    handleThreatAction(selectedThreat.id, 'deactivate');
                    setShowThreatModal(false);
                  }}
                  className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
                >
                  Deactivate
                </button>
              )}
              {selectedThreat.status === 'INACTIVE' && (
                <button
                  onClick={() => {
                    handleThreatAction(selectedThreat.id, 'activate');
                    setShowThreatModal(false);
                  }}
                  className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => {
                  handleThreatAction(selectedThreat.id, 'delete');
                  setShowThreatModal(false);
                }}
                className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileModal>
  );

  const ModuleDetailModal = () => (
    <MobileModal
      isOpen={showModuleModal}
      onClose={() => setShowModuleModal(false)}
      title="Learning Module Details"
    >
      {selectedModule && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <p className="text-gray-900">{selectedModule.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <p className="text-gray-900">{selectedModule.difficulty}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="text-gray-900">{selectedModule.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
              <p className="text-gray-900">{selectedModule.estimated_time || 'N/A'} minutes</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="text-gray-900">
                {new Date(selectedModule.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="text-gray-900">{selectedModule.description}</p>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
            <div className="flex space-x-2">
              {selectedModule.is_active && (
                <button
                  onClick={() => {
                    handleModuleAction(selectedModule.id, 'deactivate');
                    setShowModuleModal(false);
                  }}
                  className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
                >
                  Deactivate
                </button>
              )}
              {!selectedModule.is_active && (
                <button
                  onClick={() => {
                    handleModuleAction(selectedModule.id, 'activate');
                    setShowModuleModal(false);
                  }}
                  className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => {
                  handleModuleAction(selectedModule.id, 'delete');
                  setShowModuleModal(false);
                }}
                className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
          onClick={fetchSystemData}
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">System Maintenance</h1>
        <p className="text-gray-600">Monitor and maintain system health and security</p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <span className="text-2xl">💾</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Database Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStats?.database_size || 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStats?.system_status || 'Healthy'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStats?.performance_score || 'N/A'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={performSystemCleanup}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🧹 Perform System Cleanup
          </button>
          <button
            onClick={fetchSystemData}
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            🔄 Refresh System Data
          </button>
        </div>
      </div>

      {/* Active Threats */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Threats ({threats.filter(t => t.status === 'ACTIVE').length})
          </h3>
        </div>
        <div className="p-6">
          {threats.filter(t => t.status === 'ACTIVE').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active threats detected
            </div>
          ) : (
            <div>
              {threats.filter(t => t.status === 'ACTIVE').map(threat => (
                <ThreatRow key={threat.id} threat={threat} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Learning Modules */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Learning Modules ({learningModules.length})
          </h3>
        </div>
        <div className="p-6">
          {learningModules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No learning modules found
            </div>
          ) : (
            <div>
              {learningModules.map(module => (
                <ModuleRow key={module.id} module={module} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Log */}
      {maintenanceLog.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Maintenance Log</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {maintenanceLog.map((log, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-600">{log.details}</p>
                      {log.deleted_scans && (
                        <p className="text-xs text-gray-500">
                          Deleted {log.deleted_scans} old scans, {log.deleted_reports} old reports
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ThreatDetailModal />
      <ModuleDetailModal />
    </div>
  );
};

export default SystemMaintenance;
