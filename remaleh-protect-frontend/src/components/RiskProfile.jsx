import React, { useState, useEffect } from 'react'
import { User, Target, TrendingUp, BookOpen, Award, Shield, AlertTriangle, CheckCircle, RefreshCw, Plus } from 'lucide-react'
import { Card, CardHeader, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useRiskProfile } from '../hooks/useRiskProfile'

export default function RiskProfile() {
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
    loadAllData()
  }, [loadAllData])

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
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error loading profile</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <Button onClick={clearError} className="mt-2" variant="outline" size="sm">
            Try Again
          </Button>
        </div>
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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Security Profile</h1>
          <p className="text-gray-600">Track your progress and learn from your experiences</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadAllData()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowNewModuleForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Module
          </Button>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Level</h3>
            <Badge className={`text-lg px-4 py-2 ${getRiskColor(userProfile.risk_level)}`}>
              {userProfile.risk_level}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">Based on your recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Threats Detected</h3>
            <p className="text-3xl font-bold text-green-600">{userProfile.threats_detected}</p>
            <p className="text-sm text-gray-600">Out of {userProfile.total_scans} scans</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Progress</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className={`text-3xl font-bold ${getProgressColor(userProfile.learning_progress)}`}>
                {userProfile.learning_progress}%
              </p>
              <Award className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600">Security education completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Your Risk Analysis</h2>
          </div>
        </CardHeader>
        <CardContent>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProfile.risk_factors.map((factor, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{factor.factor_name}</h3>
                    <Badge className={getRiskColor(factor.risk_level)}>
                      {factor.risk_level}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Encountered {factor.frequency} times</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No risk factors identified yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Recent Scam Analysis</h2>
        </CardHeader>
        <CardContent>
          {scans && scans.length > 0 ? (
            <div className="space-y-3">
              {scans.slice(0, 4).map((scan) => (
                <div key={scan.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Badge className={getRiskColor(scan.risk_level)}>
                    {scan.risk_level}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 line-clamp-1">{scan.message || scan.description}</p>
                    <p className="text-xs text-gray-500">{scan.created_at || 'Recently'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {scan.learned ? (
                      <CheckCircle className="w-4 h-4 text-green-600" title="Lesson learned" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" title="Review recommended" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent scans available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Modules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Security Learning Modules</h2>
            <Button variant="outline" size="sm">
              View All Modules
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {learningModules && learningModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningModules.map((module) => (
                <div key={module.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{module.title}</h3>
                    {module.status === 'completed' ? (
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    ) : module.status === 'in_progress' ? (
                      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>
                    )}
                  </div>
                  
                  {module.status === 'completed' ? (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-600">Score:</span>
                      <span className="text-lg font-bold text-green-600">{module.score || 0}%</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 mb-3">{module.description || 'Learn to recognize and avoid this type of scam'}</p>
                  )}
                  
                  <Button 
                    variant={module.status === 'completed' ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleModuleAction(module.id, module.status === 'completed' ? 'review' : module.status === 'in_progress' ? 'complete' : 'start')}
                  >
                    {module.status === 'completed' ? 'Review Module' : module.status === 'in_progress' ? 'Complete Module' : 'Start Learning'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No learning modules available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Personalized Recommendations</h2>
          </div>
        </CardHeader>
        <CardContent>
          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  rec.priority === 'high' ? 'bg-red-50' : 
                  rec.priority === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <h3 className={`font-medium mb-2 ${
                    rec.priority === 'high' ? 'text-red-900' : 
                    rec.priority === 'medium' ? 'text-yellow-900' : 'text-green-900'
                  }`}>{rec.title}</h3>
                  <p className={`text-sm ${
                    rec.priority === 'high' ? 'text-red-700' : 
                    rec.priority === 'medium' ? 'text-yellow-700' : 'text-green-700'
                  }`}>{rec.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recommendations available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Module Form Modal */}
      {showNewModuleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Learning Module</h3>
            <form onSubmit={handleNewModuleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newModule.title}
                  onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newModule.category}
                    onChange={(e) => setNewModule({...newModule, category: e.target.value})}
                    className="w-full p-2 border rounded-md"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={newModule.difficulty}
                    onChange={(e) => setNewModule({...newModule, difficulty: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Create Module</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewModuleForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
