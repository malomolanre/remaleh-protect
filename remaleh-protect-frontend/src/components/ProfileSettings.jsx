import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { User, Mail, Shield, ArrowLeft, Save, Key } from 'lucide-react'
import { MobileCard } from './ui/mobile-card'
import { MobileButton } from './ui/mobile-button'
import { MobileInput } from './ui/mobile-input'
import { Textarea } from './ui/textarea'

export default function ProfileSettings({ setActiveTab }) {
  const { user, updateProfile, changePassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    email: user?.email || '',
    bio: user?.bio || '',
    risk_level: user?.risk_level || 'MEDIUM'
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      setIsChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Failed to change password:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <MobileCard>
          <div className="text-center py-8">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">Please log in to access your profile.</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('home')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <MobileCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            <MobileButton
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'secondary' : 'primary'}
              className="bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </MobileButton>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <MobileInput
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <MobileInput
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email changes are not supported from here.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                <select
                  name="risk_level"
                  value={formData.risk_level}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <MobileButton
                onClick={handleSaveProfile}
                disabled={loading}
                loading={loading}
                className="w-full bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </MobileButton>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{user.name || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              
              {user.bio && (
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="font-medium text-gray-900">{user.bio}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </MobileCard>

      {/* Security Settings */}
      <MobileCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <MobileButton
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              variant={isChangingPassword ? 'secondary' : 'primary'}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </MobileButton>
          </div>

          {isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <MobileInput
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <MobileInput
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <MobileInput
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className="w-full"
                />
              </div>
              
              <MobileButton
                onClick={handleChangePassword}
                disabled={loading}
                loading={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Key className="w-4 h-4 mr-2" />
                Update Password
              </MobileButton>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Password</p>
                <p className="font-medium text-gray-900">••••••••</p>
              </div>
            </div>
          )}
        </div>
      </MobileCard>

      {/* Account Status */}
      <MobileCard>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Account Type</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.is_admin || user.role === 'ADMIN' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.is_admin || user.role === 'ADMIN' ? 'Admin' : 'User'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Member Since</span>
              <span className="text-sm font-medium text-gray-900">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </MobileCard>
    </div>
  )
}
