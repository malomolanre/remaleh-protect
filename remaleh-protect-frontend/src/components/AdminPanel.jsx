import React, { useState, useEffect } from 'react';
import { Users, Flag, Shield, Settings, UserPlus, UserMinus, Eye, CheckCircle, XCircle } from 'lucide-react';
import { MobileCard } from './ui/mobile-card';
import { MobileButton } from './ui/mobile-button';
import { useAuth } from '../hooks/useAuth';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [scamReports, setScamReports] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const { user } = useAuth();

  // Mock data - in real app this would come from API
  useEffect(() => {
    // Mock users data
    setUsers([
      { id: 1, username: 'john_doe', email: 'john@example.com', role: 'user', status: 'active', reports: 5, joinDate: '2024-01-01' },
      { id: 2, username: 'jane_smith', email: 'jane@example.com', role: 'user', status: 'active', reports: 12, joinDate: '2024-01-05' },
      { id: 3, username: 'bob_wilson', email: 'bob@example.com', role: 'user', status: 'suspended', reports: 0, joinDate: '2024-01-10' },
      { id: 4, username: 'admin_user', email: 'admin@example.com', role: 'admin', status: 'active', reports: 25, joinDate: '2023-12-01' }
    ]);

    // Mock pending scam reports
    setPendingReports([
      { id: 1, title: 'Suspicious Email Campaign', reporter: 'john_doe', description: 'Mass emails asking for personal information', severity: 'high', date: '2024-01-15', status: 'pending' },
      { id: 2, title: 'Fake Website Alert', reporter: 'jane_smith', description: 'Website mimicking bank login page', severity: 'critical', date: '2024-01-14', status: 'pending' },
      { id: 3, title: 'Phone Scam Report', reporter: 'bob_wilson', description: 'Calls claiming to be from tech support', severity: 'medium', date: '2024-01-13', status: 'pending' }
    ]);

    // Mock approved scam reports
    setScamReports([
      { id: 1, title: 'Fake Bank SMS Scam', reporter: 'john_doe', description: 'SMS claiming to be from major banks asking for account verification', severity: 'high', date: '2024-01-15', status: 'approved', reports: 156 },
      { id: 2, title: 'Amazon Prime Renewal Fraud', reporter: 'jane_smith', description: 'Fake emails about Prime membership renewal with suspicious links', severity: 'medium', date: '2024-01-14', status: 'approved', reports: 89 }
    ]);
  }, []);

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'reports', label: 'Report Moderation', icon: Flag },
    { id: 'overview', label: 'System Overview', icon: Shield }
  ];

  const handleUserAction = (userId, action) => {
    // TODO: Implement user actions (suspend, delete, promote)
    console.log(`User action: ${action} on user ${userId}`);
  };

  const handleReportAction = (reportId, action) => {
    // TODO: Implement report moderation (approve, reject, flag)
    console.log(`Report action: ${action} on report ${reportId}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <MobileButton
                onClick={() => {/* TODO: Open user creation form */}}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </MobileButton>
            </div>
            
            <div className="space-y-3">
              {users.map((user) => (
                <MobileCard key={user.id} className="border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role} • {user.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>{user.reports} reports</span>
                      <span>Joined: {user.joinDate}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <MobileButton
                        onClick={() => handleUserAction(user.id, 'view')}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </MobileButton>
                      {user.status === 'active' ? (
                        <MobileButton
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 border-red-300"
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Suspend
                        </MobileButton>
                      ) : (
                        <MobileButton
                          onClick={() => handleUserAction(user.id, 'activate')}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-green-600 border-green-300"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Activate
                        </MobileButton>
                      )}
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Moderation</h3>
              <p className="text-sm text-gray-600">Review and moderate community scam reports</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Pending Reports ({pendingReports.length})</h4>
                <div className="space-y-3">
                  {pendingReports.map((report) => (
                    <MobileCard key={report.id} className="border-yellow-200 bg-yellow-50">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{report.title}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            report.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>By: {report.reporter}</span>
                          <span>{report.date}</span>
                        </div>
                        <div className="flex space-x-2">
                          <MobileButton
                            onClick={() => handleReportAction(report.id, 'approve')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </MobileButton>
                          <MobileButton
                            onClick={() => handleReportAction(report.id, 'reject')}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </MobileButton>
                        </div>
                      </div>
                    </MobileCard>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Approved Reports ({scamReports.length})</h4>
                <div className="space-y-3">
                  {scamReports.map((report) => (
                    <MobileCard key={report.id} className="border-green-200 bg-green-50">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{report.title}</h5>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Approved
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>By: {report.reporter}</span>
                          <span>{report.reports} total reports</span>
                        </div>
                      </div>
                    </MobileCard>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'overview':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Overview</h3>
              <p className="text-sm text-gray-600">Monitor system health and community activity</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <MobileCard className="bg-blue-50 border-blue-200">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </MobileCard>
              
              <MobileCard className="bg-green-50 border-green-200">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{scamReports.length}</div>
                  <div className="text-sm text-gray-600">Approved Reports</div>
                </div>
              </MobileCard>
              
              <MobileCard className="bg-yellow-50 border-yellow-200">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingReports.length}</div>
                  <div className="text-sm text-gray-600">Pending Reports</div>
                </div>
              </MobileCard>
              
              <MobileCard className="bg-purple-50 border-purple-200">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</div>
                  <div className="text-sm text-gray-600">Admin Users</div>
                </div>
              </MobileCard>
            </div>
            
            <MobileCard className="bg-gray-50 border-gray-200">
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• New user registration: jane_smith</div>
                  <div>• Scam report approved: Fake Bank SMS Scam</div>
                  <div>• User suspended: bob_wilson</div>
                  <div>• Community report: 5 new scam reports</div>
                </div>
              </div>
            </MobileCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-purple-100 rounded-full">
            <Settings className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-sm text-gray-600">Manage users, moderate reports, and monitor system</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
