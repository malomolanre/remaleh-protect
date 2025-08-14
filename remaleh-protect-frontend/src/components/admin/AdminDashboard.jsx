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
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { MobileCard } from '../ui/mobile-card'
import { MobileButton } from '../ui/mobile-button'
import { MobileInput } from '../ui/mobile-input'
import { Textarea } from '../ui/textarea'
import { createModule, getAllModules, updateModule, addLesson, updateLesson, deleteLesson } from '../../utils/contentManager'
import { getAllUsers, updateUserStatus, updateUserRole, deleteUser, getUserStats, createUser, updateUserInfo, updateUserPassword } from '../../utils/userManager'

export default function AdminDashboard({ setActiveTab }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [activeSection, setActiveSection] = useState('overview')
  const [showAddModule, setShowAddModule] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  // Form state for new module
  const [newModuleData, setNewModuleData] = useState({
    title: '',
    description: '',
    difficulty: 'BEGINNER',
    estimated_time: 10
  })
  
  // Form state for new user
  const [newUserData, setNewUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'USER',
    password: ''
  })
  
  // Real data state
  const [modules, setModules] = useState([])
  const [users, setUsers] = useState([])
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    admins: 0,
    moderators: 0,
    regular: 0
  })
  
  // Error state
  const [error, setError] = useState(null)
  const [dbConnectionStatus, setDbConnectionStatus] = useState('checking')
  
  // Mock data for reports (can be enhanced later)
  const [reports] = useState([
    { id: 1, type: 'scam', description: 'Suspicious email', status: 'pending', reporter: 'user@example.com' },
    { id: 2, type: 'phishing', description: 'Fake login page', status: 'investigating', reporter: 'admin@example.com' }
  ])
  
  // Lesson management state
  const [selectedModuleForLessons, setSelectedModuleForLessons] = useState(null)
  const [newLessonData, setNewLessonData] = useState({
    title: '',
    type: 'info',
    content: '',
    contentType: 'info',
    contentStyle: 'default',
    duration: 5
  })
  const [editingLesson, setEditingLesson] = useState(null)
  
  // Lesson operation loading states
  const [lessonActionLoading, setLessonActionLoading] = useState(false)
  const [lessonSuccessMessage, setLessonSuccessMessage] = useState('')
  
  // Auto-hide success messages
  React.useEffect(() => {
    if (lessonSuccessMessage) {
      const timer = setTimeout(() => {
        setLessonSuccessMessage('')
      }, 3000) // Hide after 3 seconds
      
      return () => clearTimeout(timer)
    }
  }, [lessonSuccessMessage])
  
  // Load modules from backend
  const loadModules = async () => {
    try {
      setError(null)
      const modulesData = await getAllModules()
      setModules(modulesData)
    } catch (error) {
      console.error('Failed to load modules:', error)
      setError(`Failed to load modules: ${error.message}`)
      // Check if it's a connection issue
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setDbConnectionStatus('disconnected')
      }
    }
  }
  
  // Load users from backend
  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      setError(null)
      const usersData = await getAllUsers()
      if (usersData.success) {
        setUsers(usersData.users)
      } else {
        console.error('Failed to load users:', usersData.error)
        setError(`Failed to load users: ${usersData.error}`)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      setError(`Failed to load users: ${error.message}`)
      // Check if it's a connection issue
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setDbConnectionStatus('disconnected')
      }
    } finally {
      setLoadingUsers(false)
    }
  }
  
  // Load user statistics
  const loadUserStats = async () => {
    try {
      setError(null)
      const statsData = await getUserStats()
      if (statsData.success) {
        setUserStats(statsData.stats)
      } else {
        console.error('Failed to load user stats:', statsData.error)
        setError(`Failed to load user stats: ${statsData.error}`)
      }
    } catch (error) {
      console.error('Failed to load user stats:', error)
      setError(`Failed to load user stats: ${error.message}`)
      // Check if it's a connection issue
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setDbConnectionStatus('disconnected')
      }
    }
  }
  
  // Handle module creation
  const handleCreateModule = async () => {
    if (!newModuleData.title.trim() || !newModuleData.description.trim()) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      setActionLoading(true)
      
      // Prepare module data with content structure
      const moduleData = {
        ...newModuleData,
        content: {
          lessons: []
        }
      }
      
      await createModule(moduleData)
      
      // Reset form and close modal
      setNewModuleData({
        title: '',
        description: '',
        difficulty: 'BEGINNER',
        estimated_time: 10
      })
      setShowAddModule(false)
      
      // Reload modules
      await loadModules()
      
      alert('Module created successfully!')
    } catch (error) {
      console.error('Failed to create module:', error)
      alert(`Failed to create module: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }
  
  // Handle user status update
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      setActionLoading(true)
      const result = await updateUserStatus(userId, newStatus)
      
      if (result.success) {
        alert('User status updated successfully!')
        await loadUsers() // Reload users
        await loadUserStats() // Reload stats
      } else {
        alert(`Failed to update user status: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
      alert(`Failed to update user status: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }
  
  // Handle user role update
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      setActionLoading(true)
      const result = await updateUserRole(userId, newRole)
      
      if (result.success) {
        alert('User role updated successfully!')
        await loadUsers() // Reload users
        await loadUserStats() // Reload stats
      } else {
        alert(`Failed to update user role: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to update user role:', error)
      alert(`Failed to update user role: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }
  
  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    try {
      setActionLoading(true)
      const result = await deleteUser(userId)
      
      if (result.success) {
        alert('User deleted successfully!')
        await loadUsers() // Reload users
        await loadUserStats() // Reload stats
      } else {
        alert(`Failed to delete user: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert(`Failed to delete user: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }
  
  // Handle user creation
  const handleCreateUser = async () => {
    if (!newUserData.first_name.trim() || !newUserData.last_name.trim() || !newUserData.email.trim() || !newUserData.password.trim()) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      setActionLoading(true)
      setError(null)
      
      const result = await createUser(newUserData)
      
      if (result.success) {
        alert('User created successfully!')
        
        // Reset form and close modal
        setNewUserData({
          first_name: '',
          last_name: '',
          email: '',
          role: 'USER',
          password: ''
        })
        setShowAddUser(false)
        
        // Reload users and stats
        await loadUsers()
        await loadUserStats()
      } else {
        setError(result.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      setError(error.message || 'Failed to create user')
    } finally {
      setActionLoading(false)
    }
  }
  
  // Handle user update
  const handleUpdateUser = async (userId) => {
    try {
      setActionLoading(true)
      setError(null)
      
      // Find the user being edited
      const userToUpdate = editingUser
      
      // Update user information
      const updatePromises = []
      
      // Update basic user info if changed
      const basicInfoChanged = 
        userToUpdate.first_name !== users.find(u => u.id === userId)?.first_name ||
        userToUpdate.last_name !== users.find(u => u.id === userId)?.last_name ||
        userToUpdate.email !== users.find(u => u.id === userId)?.email
      
      if (basicInfoChanged) {
        const basicInfo = {
          first_name: userToUpdate.first_name,
          last_name: userToUpdate.last_name,
          email: userToUpdate.email
        }
        updatePromises.push(updateUserInfo(userId, basicInfo))
      }
      
      // Update role if changed
      if (userToUpdate.role && userToUpdate.role !== users.find(u => u.id === userId)?.role) {
        updatePromises.push(updateUserRole(userId, userToUpdate.role))
      }
      
      // Update status if changed
      if (userToUpdate.status && userToUpdate.status !== users.find(u => u.id === userId)?.status) {
        updatePromises.push(updateUserStatus(userId, userToUpdate.status))
      }
      
      // Update password if changed
      if (userToUpdate.newPassword) {
        updatePromises.push(updateUserPassword(userId, userToUpdate.newPassword))
      }
      
      // Execute all updates
      if (updatePromises.length > 0) {
        const results = await Promise.all(updatePromises)
        const hasErrors = results.some(result => !result.success)
        
        if (hasErrors) {
          const errors = results.filter(r => !r.success).map(r => r.error).join(', ')
          setError(`Failed to update user: ${errors}`)
          return
        }
      }
      
      alert('User updated successfully!')
      
      // Close modal and reload data
      setEditingUser(null)
      await loadUsers()
      await loadUserStats()
      
    } catch (error) {
      console.error('Failed to update user:', error)
      setError(error.message || 'Failed to update user')
    } finally {
      setActionLoading(false)
    }
  }
  
  // Handle module update
  const handleUpdateModule = async (moduleId) => {
    try {
      console.log('🔄 handleUpdateModule called with moduleId:', moduleId)
      console.log('🔄 editingModule state:', editingModule)
      
      setActionLoading(true)
      setError(null)
      
      // Find the module being edited
      const moduleToUpdate = editingModule
      console.log('🔄 moduleToUpdate:', moduleToUpdate)
      
      // Prepare module data
      const moduleData = {
        title: moduleToUpdate.title,
        description: moduleToUpdate.description,
        difficulty: moduleToUpdate.difficulty,
        estimated_time: moduleToUpdate.estimated_time
      }
      console.log('🔄 moduleData to send:', moduleData)
      
      // Update module using contentManager
      console.log('🔄 Calling updateModule from contentManager...')
      await updateModule(moduleId, moduleData)
      
      alert('Module updated successfully!')
      
      // Close modal and reload data
      setEditingModule(null)
      await loadModules()
      
    } catch (error) {
      console.error('❌ Failed to update module:', error)
      setError(error.message || 'Failed to update module')
    } finally {
      setActionLoading(false)
    }
  }

  // Lesson management functions
  const handleAddLesson = async (moduleId) => {
    try {
      setLessonActionLoading(true)
      setLessonSuccessMessage('')
      const response = await addLesson(moduleId, newLessonData)
      
      if (response.success) {
        setNewLessonData({
          title: '',
          type: 'info',
          content: '',
          contentType: 'info',
          contentStyle: 'default',
          duration: 5
        })
        
        // Refresh both the modules list and the selected module data
        await loadModules()
        
        // Update the selected module with fresh data
        const updatedModules = await getAllModules()
        const updatedModule = updatedModules.find(m => m.id === moduleId)
        if (updatedModule) {
          setSelectedModuleForLessons(updatedModule)
        }
        
        setLessonSuccessMessage('Lesson added successfully!')
      } else {
        setError(response.error || 'Failed to add lesson')
      }
    } catch (error) {
      console.error('Error adding lesson:', error)
      setError('Failed to add lesson')
    } finally {
      setLessonActionLoading(false)
    }
  }

  const handleUpdateLesson = async (moduleId, lessonId, lessonData) => {
    try {
      setLessonActionLoading(true)
      setLessonSuccessMessage('')
      const response = await updateLesson(moduleId, lessonId, lessonData)
      
      if (response.success) {
        setEditingLesson(null)
        
        // Refresh both the modules list and the selected module data
        await loadModules()
        
        // Update the selected module with fresh data
        const updatedModules = await getAllModules()
        const updatedModule = updatedModules.find(m => m.id === moduleId)
        if (updatedModule) {
          setSelectedModuleForLessons(updatedModule)
        }
        
        setLessonSuccessMessage('Lesson updated successfully!')
      } else {
        setError(response.error || 'Failed to update lesson')
      }
    } catch (error) {
      console.error('Error updating lesson:', error)
      setError('Failed to update lesson')
    } finally {
      setLessonActionLoading(false)
    }
  }

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return
    }
    
    try {
      setLessonActionLoading(true)
      setLessonSuccessMessage('')
      const response = await deleteLesson(moduleId, lessonId)
      
      if (response.success) {
        // Refresh both the modules list and the selected module data
        await loadModules()
        
        // Update the selected module with fresh data
        const updatedModules = await getAllModules()
        const updatedModule = updatedModules.find(m => m.id === moduleId)
        if (updatedModule) {
          setSelectedModuleForLessons(updatedModule)
        }
        
        setLessonSuccessMessage('Lesson deleted successfully!')
      } else {
        setError(response.error || 'Failed to delete lesson')
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      setError('Failed to delete lesson')
    } finally {
      setLessonActionLoading(false)
    }
  }
  
  // Check database connectivity
  const checkDatabaseConnection = async () => {
    try {
      setDbConnectionStatus('checking')
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:10000'
      const response = await fetch(`${apiBase}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout for the request
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Health check response:', data)
        setDbConnectionStatus(data.database === 'healthy' ? 'connected' : 'disconnected')
        
        if (data.database !== 'healthy') {
          setError(`Database status: ${data.database}`)
        } else {
          setError(null)
        }
      } else {
        console.error('Health check failed with status:', response.status)
        setDbConnectionStatus('disconnected')
        setError(`Backend health check failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Database connection check failed:', error)
      setDbConnectionStatus('disconnected')
      
      if (error.name === 'AbortError') {
        setError('Backend connection timeout - service may be unavailable')
      } else if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to backend - check if service is running')
      } else {
        setError(`Connection error: ${error.message}`)
      }
    }
  }
  
  // Load data on component mount
  React.useEffect(() => {
    loadModules()
    loadUsers()
    loadUserStats()
    checkDatabaseConnection() // Check DB connection on mount
  }, [])
  
  // Authentication check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#21a1ce] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="space-y-6 p-4">
        <div className="bg-gradient-to-r from-[#21a1ce] to-[#1a8bb8] rounded-2xl p-6 text-white shadow-lg">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Authentication Required</h1>
            <p className="text-white text-lg">Please log in to access the Admin Dashboard.</p>
          </div>
        </div>
        <MobileCard>
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You must be logged in to access the admin panel.</p>
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
      <div className="space-y-6 p-4">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
            <p className="text-white text-lg">You don't have permission to access the Admin Dashboard.</p>
          </div>
        </div>
        <MobileCard>
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Privileges</h2>
            <p className="text-gray-600 mb-6">Only administrators can access this panel.</p>
            <MobileButton
              onClick={() => setActiveTab('home')}
              className="bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
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
      {/* Database Connection Status */}
      <MobileCard>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Database Status</h3>
            <div className={`flex items-center space-x-2 ${
              dbConnectionStatus === 'connected' ? 'text-green-600' : 
              dbConnectionStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                dbConnectionStatus === 'connected' ? 'bg-green-500' : 
                dbConnectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm font-medium capitalize">
                {dbConnectionStatus === 'connected' ? 'Connected' : 
                 dbConnectionStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
              </span>
            </div>
          </div>
          {dbConnectionStatus === 'disconnected' && (
            <div className="mt-2">
              <p className="text-sm text-red-600 mb-2">
                Warning: Database connection failed. Some features may not work properly.
              </p>
              {error && (
                <p className="text-xs text-red-500 bg-red-50 p-2 rounded">
                  Error: {error}
                </p>
              )}
            </div>
          )}
          <button
            onClick={checkDatabaseConnection}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Check Connection
          </button>
        </div>
      </MobileCard>

      <MobileCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MobileCard>
              <div className="text-center p-4">
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">{modules.length}</h3>
                <p className="text-sm text-gray-600">Learning Modules</p>
              </div>
            </MobileCard>
            <MobileCard>
              <div className="text-center p-4">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">{userStats.total}</h3>
                <p className="text-sm text-gray-600">Total Users</p>
                <div className="text-xs text-gray-500 mt-1">
                  {userStats.active} active, {userStats.admins} admins
                </div>
              </div>
            </MobileCard>
            <MobileCard>
              <div className="text-center p-4">
                <MessageSquare className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">{reports.length}</h3>
                <p className="text-sm text-gray-600">Community Reports</p>
              </div>
            </MobileCard>
            <MobileCard>
              <div className="text-center p-4">
                <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Active</h3>
                <p className="text-sm text-gray-600">System Status</p>
              </div>
            </MobileCard>
          </div>
          
          <div className="mt-6 space-y-3">
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
        {modules.length === 0 ? (
          <MobileCard>
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Modules Yet</h3>
              <p className="text-gray-600 mb-4">Create your first learning module to get started.</p>
              <MobileButton
                onClick={() => setShowAddModule(true)}
                className="bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Module
              </MobileButton>
            </div>
          </MobileCard>
        ) : (
          modules.map((module) => (
            <MobileCard key={module.id}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{module.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedModuleForLessons(module)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Manage Lessons"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingModule(module)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Module"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {/* Handle delete */}}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{module.content?.lessons?.length || 0} lessons</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {module.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {module.estimated_time} min
                  </span>
                </div>
              </div>
            </MobileCard>
          ))
        )}
      </div>
    </div>
  )

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <div className="flex space-x-2">
          <MobileButton
            onClick={loadUsers}
            disabled={actionLoading}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${actionLoading ? 'animate-spin' : ''}`} />
            Refresh
          </MobileButton>
          <MobileButton
            onClick={() => setShowAddUser(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </MobileButton>
        </div>
      </div>

      {loadingUsers ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#21a1ce] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <MobileCard>
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600 mb-4">There are no users in the system yet.</p>
          </div>
        </MobileCard>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <MobileCard key={user.id}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user.email?.split('@')[0] || 'Unknown User'
                      }
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.created_at && (
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={actionLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.is_admin || user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.role === 'MODERATOR'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role || 'USER'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : user.status === 'SUSPENDED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : user.status === 'BANNED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status || 'UNKNOWN'}
                  </span>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {/* Status Update */}
                  <select
                    value={user.status || 'ACTIVE'}
                    onChange={(e) => handleUpdateUserStatus(user.id, e.target.value)}
                    disabled={actionLoading}
                    className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BANNED">Banned</option>
                  </select>
                  
                  {/* Role Update */}
                  <select
                    value={user.role || 'USER'}
                    onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                    disabled={actionLoading}
                    className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="USER">User</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>
      )}
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
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-500">Backend:</span>
            <div className={`flex items-center space-x-1 ${
              dbConnectionStatus === 'connected' ? 'text-green-600' : 
              dbConnectionStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                dbConnectionStatus === 'connected' ? 'bg-green-500' : 
                dbConnectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-xs font-medium capitalize">
                {dbConnectionStatus === 'connected' ? 'Connected' : 
                 dbConnectionStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
              </span>
            </div>
          </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module Title *</label>
                  <MobileInput
                    type="text"
                    value={newModuleData.title}
                    onChange={(e) => setNewModuleData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter module title"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <Textarea
                    value={newModuleData.description}
                    onChange={(e) => setNewModuleData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter module description"
                    className="w-full"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={newModuleData.difficulty}
                    onChange={(e) => setNewModuleData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (minutes)</label>
                  <MobileInput
                    type="number"
                    value={newModuleData.estimated_time}
                    onChange={(e) => setNewModuleData(prev => ({ ...prev, estimated_time: parseInt(e.target.value) || 10 }))}
                    placeholder="10"
                    min="1"
                    max="120"
                    className="w-full"
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
                    onClick={handleCreateModule}
                    disabled={actionLoading}
                    className="flex-1 bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
                  >
                    {actionLoading ? 'Creating...' : 'Create Module'}
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
                    value={newUserData.first_name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <MobileInput
                    type="email"
                    placeholder="Enter email address"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select 
                    value={newUserData.role}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent"
                  >
                    <option value="USER">User</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <MobileInput
                    type="password"
                    placeholder="Enter password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <MobileButton
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Cancel
                  </MobileButton>
                  <MobileButton
                    onClick={handleCreateUser}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading ? 'Creating...' : 'Create User'}
                  </MobileButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <MobileInput
                    type="text"
                    placeholder="Enter first name"
                    value={editingUser.first_name || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <MobileInput
                    type="text"
                    placeholder="Enter last name"
                    value={editingUser.last_name || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <MobileInput
                    type="email"
                    placeholder="Enter email address"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select 
                    value={editingUser.role || 'USER'}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent"
                  >
                    <option value="USER">User</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    value={editingUser.status || 'ACTIVE'}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BANNED">Banned</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password (leave blank to keep current)</label>
                  <MobileInput
                    type="password"
                    placeholder="Enter new password"
                    value={editingUser.newPassword || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <MobileButton
                    onClick={() => setEditingUser(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Cancel
                  </MobileButton>
                  <MobileButton
                    onClick={() => handleUpdateUser(editingUser.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {actionLoading ? 'Updating...' : 'Update User'}
                  </MobileButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {editingModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Module</h2>
                <button 
                  onClick={() => setEditingModule(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <MobileInput
                    type="text"
                    placeholder="Enter module title"
                    value={editingModule.title || ''}
                    onChange={(e) => setEditingModule(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    placeholder="Enter module description"
                    value={editingModule.description || ''}
                    onChange={(e) => setEditingModule(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={editingModule.difficulty || 'BEGINNER'}
                    onChange={(e) => setEditingModule(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (minutes)</label>
                  <MobileInput
                    type="number"
                    placeholder="10"
                    value={editingModule.estimated_time || 10}
                    onChange={(e) => setEditingModule(prev => ({ ...prev, estimated_time: parseInt(e.target.value) || 10 }))}
                    min="1"
                    max="120"
                    className="w-full"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <MobileButton
                    onClick={() => setEditingModule(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Cancel
                  </MobileButton>
                  <MobileButton
                    onClick={() => handleUpdateModule(editingModule.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {actionLoading ? 'Updating...' : 'Update Module'}
                  </MobileButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Management Modal */}
      {selectedModuleForLessons && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Manage Lessons: {selectedModuleForLessons.title}
                </h2>
                <button 
                  onClick={() => setSelectedModuleForLessons(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Add New Lesson Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Lesson</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <MobileInput
                      type="text"
                      placeholder="Enter lesson title"
                      value={newLessonData.title}
                      onChange={(e) => setNewLessonData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newLessonData.type}
                      onChange={(e) => setNewLessonData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent"
                    >
                      <option value="info">Information</option>
                      <option value="quiz">Quiz</option>
                      <option value="video">Video</option>
                      <option value="interactive">Interactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                    <select
                      value={newLessonData.contentType}
                      onChange={(e) => setNewLessonData(prev => ({ ...prev, contentType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent"
                    >
                      <option value="info">Text</option>
                      <option value="html">HTML</option>
                      <option value="markdown">Markdown</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <MobileInput
                      type="number"
                      placeholder="5"
                      value={newLessonData.duration}
                      onChange={(e) => setNewLessonData(prev => ({ ...prev, duration: parseInt(e.target.value) || 5 }))}
                      min="1"
                      max="60"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <Textarea
                      placeholder="Enter lesson content"
                      value={newLessonData.content}
                      onChange={(e) => setNewLessonData(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full"
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <MobileButton
                    onClick={() => handleAddLesson(selectedModuleForLessons.id)}
                    disabled={lessonActionLoading}
                    className="bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
                  >
                    {lessonActionLoading ? 'Adding...' : 'Add Lesson'}
                  </MobileButton>
                  {lessonSuccessMessage && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-green-800 font-medium">{lessonSuccessMessage}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Lessons List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Lessons</h3>
                {lessonActionLoading && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 text-blue-600 mr-2 animate-spin" />
                      <span className="text-sm text-blue-800">Updating lessons...</span>
                    </div>
                  </div>
                )}
                {selectedModuleForLessons.content?.lessons?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedModuleForLessons.content.lessons.map((lesson) => (
                      <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingLesson(lesson)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Lesson"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(selectedModuleForLessons.id, lesson.id)}
                              disabled={lessonActionLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete Lesson"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mr-2">
                            {lesson.type}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mr-2">
                            {lesson.duration} min
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            {lesson.contentType}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-2">{lesson.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>No lessons yet. Add your first lesson above!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Lesson</h2>
                <button 
                  onClick={() => setEditingLesson(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <MobileInput
                    type="text"
                    placeholder="Enter lesson title"
                    value={editingLesson.title || ''}
                    onChange={(e) => setEditingLesson(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={editingLesson.type || 'info'}
                      onChange={(e) => setEditingLesson(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent"
                    >
                      <option value="info">Information</option>
                      <option value="quiz">Quiz</option>
                      <option value="video">Video</option>
                      <option value="interactive">Interactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <MobileInput
                      type="number"
                      placeholder="5"
                      value={editingLesson.duration || 5}
                      onChange={(e) => setEditingLesson(prev => ({ ...prev, duration: parseInt(e.target.value) || 5 }))}
                      min="1"
                      max="60"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <Textarea
                    placeholder="Enter lesson content"
                    value={editingLesson.content || ''}
                    onChange={(e) => setEditingLesson(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full"
                    rows={6}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <MobileButton
                    onClick={() => setEditingLesson(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Cancel
                  </MobileButton>
                  <MobileButton
                    onClick={() => handleUpdateLesson(selectedModuleForLessons.id, editingLesson.id, editingLesson)}
                    disabled={lessonActionLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {lessonActionLoading ? 'Updating...' : 'Update Lesson'}
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
