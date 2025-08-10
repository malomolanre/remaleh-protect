import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import CommunityReports from './admin/CommunityReports';
import LearningModuleManagement from './admin/LearningModuleManagement';
import SystemMaintenance from './admin/SystemMaintenance';
import MobileHeader from './MobileHeader';
import MobileNavigation from './MobileNavigation';

const AdminPanel = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (isAuthenticated && user) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Redirect if not admin
  if (!isLoading && (!isAuthenticated || !user?.is_admin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this panel.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <CommunityReports />;
      case 'learning':
        return <LearningModuleManagement />;
      case 'maintenance':
        return <SystemMaintenance />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Admin Panel" />
      
      {/* Admin Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </div>

      <MobileNavigation />
    </div>
  );
};

export default AdminPanel;
