import React, { useState, useEffect } from 'react'
import { User, Target, TrendingUp, BookOpen, Award, Shield, AlertTriangle, CheckCircle, RefreshCw, Plus, Lock } from 'lucide-react'
import { MobileCard } from './ui/mobile-card'
import { MobileButton } from './ui/mobile-button'
import { MobileInput } from './ui/mobile-input'
import MobileModal from './MobileModal'
import { MobileGrid, MobileGridItem, MobileStatsGrid } from './ui/mobile-grid'
import { MobileList, MobileListItemWithBadge } from './ui/mobile-list'
import { useRiskProfile } from '../hooks/useRiskProfile'
import { useAuth } from '../hooks/useAuth'

export default function RiskProfile() {
  const { isAuthenticated } = useAuth()
  const {
    profile,
    scans,
    learningModules,
    recommendations,
    isLoading,
    error,
    loadAllData,
    startLearningModule,
    completeLearningModule,
    clearError
  } = useRiskProfile()

  const [showNewModuleForm, setShowNewModuleForm] = useState(false)
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'BEGINNER'
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData()
    }
  }, [loadAllData, isAuthenticated])

  const getRiskColor = (risk) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800'
    }
    return colors[risk] || colors['MEDIUM']
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const calculateRiskScore = () => {
    if (!profile) return 0
    
    const highRiskCount = profile.risk_factors?.filter(f => f.risk_level === 'HIGH').length || 0
    const mediumRiskCount = profile.risk_factors?.filter(f => f.risk_level === 'MEDIUM').length || 0
    return Math.min(100, (highRiskCount * 30) + (mediumRiskCount * 15))
  }

  const handleModuleAction = async (moduleId, action) => {
    if (action === 'start') {
      await startLearningModule(moduleId)
    } else if (action === 'complete') {
      await completeLearningModule(moduleId)
    }
  }

  const handleNewModuleSubmit = async (e) => {
    e.preventDefault()
    // This would integrate with the createLearningModule function from the hook
    setShowNewModuleForm(false)
    setNewModule({ title: '', description: '', category: '', difficulty: 'BEGINNER' })
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">Login required to access Risk Profile</p>
          <p className="text-gray-500 text-sm">Please log in to view your security profile and recommendations</p>
        </div>
      </div>
    )
  }

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading your risk profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    // Check if it's an authentication error
    const isAuthError = error.includes('Token is missing') || error.includes('401') || error.includes('Unauthorized')
    
    return (
      <div className="p-4">
        <MobileCard className="bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">
              {isAuthError ? 'Authentication Required' : 'Error loading profile'}
            </span>
          </div>
          <p className="text-red-700 text-sm mb-3">
            {isAuthError 
              ? 'Please log in to access your risk profile. Your session may have expired.'
              : error
            }
          </p>
          <div className="flex gap-2">
            {isAuthError ? (
              <MobileButton 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm" 
                className="flex-1"
              >
                Go to Login
              </MobileButton>
            ) : (
              <MobileButton onClick={clearError} variant="outline" size="sm" className="flex-1">
                Try Again
              </MobileButton>
            )}
          </div>
        </MobileCard>
      </div>
    )
  }

  // Use real data or fallback to empty states
  const userProfile = profile || {
    risk_level: 'MEDIUM',
    total_scans: 0,
    threats_detected: 0,
    learning_progress: 0,
    risk_factors: []
  }

  const riskScore = calculateRiskScore()

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Security Profile</h1>
        <p className="text-gray-600 text-sm">Track your progress and learn from experiences</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <MobileButton onClick={() => loadAllData()} variant="outline" size="sm" className="flex-1">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </MobileButton>
        <MobileButton onClick={() => setShowNewModuleForm(true)} size="sm" className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          New Module
        </MobileButton>
      </div>

      {/* Profile Overview */}
      <MobileStatsGrid>
        <MobileGridItem>
          <MobileCard>
            <div className="p-4 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Risk Level</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(userProfile.risk_level)}`}>
                {userProfile.risk_level}
              </span>
              <p className="text-xs text-gray-600 mt-2">Based on recent activity</p>
            </div>
          </MobileCard>
        </MobileGridItem>

        <MobileGridItem>
          <MobileCard>
            <div className="p-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Threats Detected</h3>
              <p className="text-2xl font-bold text-green-600">{userProfile.threats_detected}</p>
              <p className="text-xs text-gray-600">Out of {userProfile.total_scans} scans</p>
            </div>
          </MobileCard>
        </MobileGridItem>

        <MobileGridItem>
          <MobileCard>
            <div className="p-4 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Learning Progress</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className={`text-2xl font-bold ${getProgressColor(userProfile.learning_progress)}`}>
                  {userProfile.learning_progress}%
                </p>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-600">Security education completed</p>
            </div>
          </MobileCard>
        </MobileGridItem>
      </MobileStatsGrid>

      {/* Risk Analysis */}
      <MobileCard>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Risk Analysis</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Risk Score</span>
              <span className="text-sm font-medium text-gray-900">{riskScore}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${riskScore}%`,
                  backgroundColor: riskScore > 70 ? '#dc2626' : riskScore > 40 ? '#ea580c' : '#16a34a'
                }}
              />
            </div>
          </div>
          
          {userProfile.risk_factors && userProfile.risk_factors.length > 0 ? (
            <MobileList>
              {userProfile.risk_factors.map((factor, index) => (
                <MobileListItemWithBadge
                  key={index}
                  title={factor.factor_name}
                  subtitle={`Encountered ${factor.frequency} times`}
                  badge={factor.risk_level}
                  badgeColor={factor.risk_level === 'CRITICAL' ? 'red' : 
                             factor.risk_level === 'HIGH' ? 'orange' : 
                             factor.risk_level === 'MEDIUM' ? 'yellow' : 'green'}
                  icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
                />
              ))}
            </MobileList>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No risk factors identified yet</p>
            </div>
          )}
        </div>
      </MobileCard>

      {/* Recent Scans */}
      <MobileCard>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Scam Analysis</h2>
          
          {scans && scans.length > 0 ? (
            <MobileList>
              {scans.slice(0, 4).map((scan) => (
                <MobileListItemWithBadge
                  key={scan.id}
                  title={scan.message || scan.description}
                  subtitle={scan.created_at || 'Recently'}
                  badge={scan.risk_level}
                  badgeColor={scan.risk_level === 'CRITICAL' ? 'red' : 
                             scan.risk_level === 'HIGH' ? 'orange' : 
                             scan.risk_level === 'MEDIUM' ? 'yellow' : 'green'}
                  icon={<Target className="w-4 h-4 text-green-400" />}
                  rightContent={
                    <div className="flex items-center gap-2">
                      {scan.learned ? (
                        <CheckCircle className="w-4 h-4 text-green-600" title="Lesson learned" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" title="Review recommended" />
                      )}
                    </div>
                  }
                />
              ))}
            </MobileList>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Target className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recent scans available</p>
            </div>
          )}
        </div>
      </MobileCard>

      {/* Learning Modules */}
      <MobileCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Learning Modules</h2>
            <MobileButton variant="outline" size="sm">
              View All
            </MobileButton>
          </div>
          
          {learningModules && learningModules.length > 0 ? (
            <MobileList>
              {learningModules.map((module) => (
                <MobileListItemWithBadge
                  key={module.id}
                  title={module.title}
                  subtitle={module.description || 'Learn to recognize and avoid this type of scam'}
                  badge={module.status === 'completed' ? 'Completed' : 
                         module.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  badgeColor={module.status === 'completed' ? 'green' : 
                             module.status === 'in_progress' ? 'blue' : 'gray'}
                  icon={<BookOpen className="w-4 h-4 text-purple-400" />}
                  rightContent={
                    <MobileButton 
                      variant={module.status === 'completed' ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleModuleAction(module.id, module.status === 'completed' ? 'review' : module.status === 'in_progress' ? 'complete' : 'start')}
                    >
                      {module.status === 'completed' ? 'Review' : module.status === 'in_progress' ? 'Complete' : 'Start'}
                    </MobileButton>
                  }
                />
              ))}
            </MobileList>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No learning modules available</p>
            </div>
          )}
        </div>
      </MobileCard>

      {/* Recommendations */}
      <MobileCard>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
          </div>
          
          {recommendations && recommendations.length > 0 ? (
            <MobileList>
              {recommendations.map((rec, index) => (
                <MobileListItemWithBadge
                  key={index}
                  title={rec.title}
                  subtitle={rec.description}
                  badge={rec.priority}
                  badgeColor={rec.priority === 'high' ? 'red' : 
                             rec.priority === 'medium' ? 'yellow' : 'green'}
                  icon={<Shield className="w-4 h-4 text-blue-400" />}
                />
              ))}
            </MobileList>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Shield className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recommendations available yet</p>
            </div>
          )}
        </div>
      </MobileCard>

      {/* New Module Form Modal */}
      <MobileModal
        isOpen={showNewModuleForm}
        onClose={() => setShowNewModuleForm(false)}
        title="Create Learning Module"
        size="full"
      >
        <form onSubmit={handleNewModuleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <MobileInput
              type="text"
              value={newModule.title}
              onChange={(e) => setNewModule({...newModule, title: e.target.value})}
              placeholder="Enter module title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newModule.description}
              onChange={(e) => setNewModule({...newModule, description: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              placeholder="Describe the learning module"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newModule.category}
                onChange={(e) => setNewModule({...newModule, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                <option value="phishing">Phishing</option>
                <option value="scam">Scam</option>
                <option value="malware">Malware</option>
                <option value="fraud">Fraud</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={newModule.difficulty}
                onChange={(e) => setNewModule({...newModule, difficulty: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <MobileButton type="submit" className="flex-1">
              Create Module
            </MobileButton>
            <MobileButton 
              type="button" 
              variant="outline" 
              onClick={() => setShowNewModuleForm(false)}
              className="flex-1"
            >
              Cancel
            </MobileButton>
          </div>
        </form>
      </MobileModal>
    </div>
  )
}
