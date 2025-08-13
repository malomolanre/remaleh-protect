import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  Settings, 
  Shield,
  Plus,
  Edit3,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react'
import { MobileCard } from '../ui/mobile-card'
import { MobileButton } from '../ui/mobile-button'
import { MobileInput } from '../ui/mobile-input'
import { Textarea } from '../ui/textarea'

export default function AdminDashboard({ setActiveTab }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [activeSection, setActiveSection] = useState('overview')
  const [showAddModule, setShowAddModule] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Mock data for demonstration
  const [modules] = useState([
    { id: 1, title: 'Cybersecurity Basics', description: 'Learn the fundamentals', status: 'active', lessons: 5 },
    { id: 2, title: 'Password Security', description: 'Master password management', status: 'active', lessons: 3 }
  ])
  
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' }
  ])
  
  const [reports] = useState([
    { id: 1, type: 'scam', description: 'Suspicious email', status: 'pending', reporter: 'user@example.com' },
    { id: 2, type: 'phishing', description: 'Fake website', status: 'investigating', reporter: 'admin@example.com' }
  ])

  // Check if user has admin access
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#21a1ce] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <MobileCard>
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to access the admin panel.</p>
            <MobileButton 
              onClick={() => setActiveTab('login')}
              className="bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
            >
              Go to Login
            </MobileButton>
          </div>
        </MobileCard>
      </div>
    )
  }

  if (!user?.is_admin && user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <MobileCard>
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
            <MobileButton 
              onClick={() => setActiveTab('home')}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Return to Home
            </MobileButton>
          </div>
        </MobileCard>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MobileCard>
          <div className="text-center p-4">
            <BookOpen className="w-8 h-8 text-[#21a1ce] mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">{modules.length}</h3>
            <p className="text-sm text-gray-600">Learning Modules</p>
          </div>
        </MobileCard>
        
        <MobileCard>
          <div className="text-center p-4">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">{users.length}</h3>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
        </MobileCard>
        
        <MobileCard>
          <div className="text-center p-4">
            <MessageSquare className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">{reports.length}</h3>
            <p className="text-sm text-gray-600">Community Reports</p>
          </div>
        </MobileCard>
      </div>

      <MobileCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MobileButton
              onClick={() => setActiveSection('content')}
              className="bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Manage Content
            </MobileButton>
            
            <MobileButton
              onClick={() => setActiveSection('users')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </MobileButton>
            
            <MobileButton
              onClick={() => setActiveSection('reports')}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              View Reports
            </MobileButton>
          </div>
        </div>
      </MobileCard>
    </div>
  )

  const renderContentManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Learning Content Management</h2>
        <MobileButton
          onClick={() => setShowAddModule(true)}
          className="bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Module
        </MobileButton>
      </div>

      <div className="space-y-4">
        {modules.map((module) => (
          <MobileCard key={module.id}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{module.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingModule(module)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {/* Handle delete */}}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{module.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{module.lessons} lessons</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  module.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {module.status}
                </span>
              </div>
            </div>
          </MobileCard>
        ))}
      </div>
    </div>
  )

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <MobileButton
          onClick={() => setShowAddUser(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </MobileButton>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <MobileCard key={user.id}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {/* Handle delete */}}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className={`px-2 py-1 rounded-full ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
                <span className={`px-2 py-1 rounded-full ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </div>
            </div>
          </MobileCard>
        ))}
      </div>
    </div>
  )

  const renderCommunityReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Community Reports</h2>
        <MobileButton
          onClick={() => {/* Refresh reports */}}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Refresh
        </MobileButton>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <MobileCard key={report.id}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 capitalize">{report.type} Report</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{report.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Reported by: {report.reporter}</span>
                <button className="text-[#21a1ce] hover:underline">View Details</button>
              </div>
            </div>
          </MobileCard>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
        </div>
        <button
          onClick={() => setActiveTab('home')}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveSection('overview')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'overview'
              ? 'bg-white text-[#21a1ce] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSection('content')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'content'
              ? 'bg-white text-[#21a1ce] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveSection('users')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'users'
              ? 'bg-white text-[#21a1ce] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveSection('reports')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'reports'
              ? 'bg-white text-[#21a1ce] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reports
        </button>
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'content' && renderContentManagement()}
      {activeSection === 'users' && renderUserManagement()}
      {activeSection === 'reports' && renderCommunityReports()}

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Module</h2>
                <button 
                  onClick={() => setShowAddModule(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module Title</label>
                  <MobileInput
                    type="text"
                    placeholder="Enter module title"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    placeholder="Enter module description"
                    className="w-full"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <MobileButton
                    onClick={() => setShowAddModule(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Cancel
                  </MobileButton>
                  <MobileButton
                    onClick={() => {/* Handle save */}}
                    className="flex-1 bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
                  >
                    Create Module
                  </MobileButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                <button 
                  onClick={() => setShowAddUser(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <MobileInput
                    type="text"
                    placeholder="Enter full name"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <MobileInput
                    type="email"
                    placeholder="Enter email address"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="flex space-x-3">
                  <MobileButton
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Cancel
                  </MobileButton>
                  <MobileButton
                    onClick={() => {/* Handle save */}}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Create User
                  </MobileButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
