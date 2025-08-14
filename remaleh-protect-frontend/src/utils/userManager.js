/**
 * User Management Utility for Remaleh Protect Admin Dashboard
 * Handles all user-related API calls and operations
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api'

// Backend API endpoints for user management
const USER_ENDPOINTS = {
  USERS: '/api/admin/users',
  USER: (id) => `/api/admin/users/${id}`,
  UPDATE_STATUS: (id) => `/api/admin/users/${id}/status`,
  UPDATE_ROLE: (id) => `/api/admin/users/${id}/role`,
  DELETE_USER: (id) => `/api/admin/users/${id}`,
}

// Get all users with optional filtering
export const getAllUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()
    
    if (filters.page) queryParams.append('page', filters.page)
    if (filters.per_page) queryParams.append('per_page', filters.per_page)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.role) queryParams.append('role', filters.role)
    
    const url = `${USER_ENDPOINTS.USERS}?${queryParams.toString()}`
    const response = await apiGet(url)
    
    if (response.ok) {
      const data = await response.json()
      return {
        users: data.users || [],
        pagination: data.pagination || {},
        success: true
      }
    } else {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      users: [],
      pagination: {},
      success: false,
      error: error.message
    }
  }
}

// Get specific user by ID
export const getUserById = async (userId) => {
  try {
    const response = await apiGet(USER_ENDPOINTS.USER(userId))
    
    if (response.ok) {
      const userData = await response.json()
      return {
        user: userData,
        success: true
      }
    } else {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return {
      user: null,
      success: false,
      error: error.message
    }
  }
}

// Update user status
export const updateUserStatus = async (userId, newStatus) => {
  try {
    console.log('🔄 userManager.updateUserStatus called with:', { userId, newStatus })
    console.log('🔄 API endpoint:', USER_ENDPOINTS.UPDATE_STATUS(userId))
    
    const response = await apiPut(USER_ENDPOINTS.UPDATE_STATUS(userId), {
      status: newStatus
    })
    console.log('🔄 API response received:', response)
    console.log('🔄 Response status:', response.status)
    console.log('🔄 Response ok:', response.ok)
    
    if (response.ok) {
      const data = await response.json()
      console.log('🔄 Response data:', data)
      return {
        success: true,
        message: data.message || 'User status updated successfully',
        user: data.user
      }
    } else {
      console.log('❌ Response not ok, status:', response.status)
      const errorData = await response.json()
      console.log('❌ Error response body:', errorData)
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Error in updateUserStatus:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update user role
export const updateUserRole = async (userId, newRole) => {
  try {
    console.log('🔄 userManager.updateUserRole called with:', { userId, newRole })
    console.log('🔄 API endpoint:', USER_ENDPOINTS.UPDATE_ROLE(userId))
    
    const response = await apiPut(USER_ENDPOINTS.UPDATE_ROLE(userId), {
      role: newRole
    })
    console.log('🔄 API response received:', response)
    console.log('🔄 Response status:', response.status)
    console.log('🔄 Response ok:', response.ok)
    
    if (response.ok) {
      const data = await response.json()
      console.log('🔄 Response data:', data)
      return {
        success: true,
        message: data.message || 'User role updated successfully',
        user: data.user
      }
    } else {
      console.log('❌ Response not ok, status:', response.status)
      const errorData = await response.json()
      console.log('❌ Error response body:', errorData)
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Error in updateUserRole:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update user information (first name, last name, email)
export const updateUserInfo = async (userId, userData) => {
  try {
    const response = await apiPut(USER_ENDPOINTS.USER(userId), userData)
    
    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: data.message || 'User information updated successfully',
        user: data.user
      }
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error updating user information:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update user password
export const updateUserPassword = async (userId, newPassword) => {
  try {
    const response = await apiPut(`${USER_ENDPOINTS.USER(userId)}/password`, {
      password: newPassword
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: data.message || 'User password updated successfully'
      }
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error updating user password:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Delete user (soft delete)
export const deleteUser = async (userId) => {
  try {
    const response = await apiDelete(USER_ENDPOINTS.DELETE_USER(userId))
    
    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: data.message || 'User deleted successfully'
      }
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Create new user (if endpoint exists)
export const createUser = async (userData) => {
  try {
    const response = await apiPost(USER_ENDPOINTS.USERS, userData)
    
    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: data.message || 'User created successfully',
        user: data.user
      }
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get user statistics
export const getUserStats = async () => {
  try {
    const response = await apiGet(USER_ENDPOINTS.USERS)
    
    if (response.ok) {
      const data = await response.json()
      const users = data.users || []
      
      const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'ACTIVE').length,
        suspended: users.filter(u => u.status === 'SUSPENDED').length,
        banned: users.filter(u => u.status === 'BANNED').length,
        admins: users.filter(u => u.is_admin || u.role === 'ADMIN').length,
        moderators: users.filter(u => u.role === 'MODERATOR').length,
        regular: users.filter(u => u.role === 'USER').length
      }
      
      return {
        stats,
        success: true
      }
    } else {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      stats: {
        total: 0,
        active: 0,
        suspended: 0,
        banned: 0,
        admins: 0,
        moderators: 0,
        regular: 0
      },
      success: false,
      error: error.message
    }
  }
}

// Search users
export const searchUsers = async (searchTerm, filters = {}) => {
  try {
    // For now, we'll filter on the frontend since the backend doesn't have search
    // In the future, this could be enhanced with backend search
    const allUsers = await getAllUsers(filters)
    
    if (!allUsers.success) {
      return allUsers
    }
    
    const searchLower = searchTerm.toLowerCase()
    const filteredUsers = allUsers.users.filter(user => 
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    )
    
    return {
      users: filteredUsers,
      pagination: allUsers.pagination,
      success: true
    }
  } catch (error) {
    console.error('Error searching users:', error)
    return {
      users: [],
      pagination: {},
      success: false,
      error: error.message
    }
  }
}
