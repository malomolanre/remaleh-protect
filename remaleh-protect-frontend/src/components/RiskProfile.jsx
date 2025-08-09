import React, { useState, useEffect } from 'react'
import { User, Target, TrendingUp, BookOpen, Award, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export default function RiskProfile() {
  const [userProfile, setUserProfile] = useState({
    riskLevel: 'MEDIUM',
    totalScans: 23,
    threatsDetected: 8,
    learningProgress: 65,
    recentScans: [
      { id: 1, message: 'URGENT: Package held at customs...', risk: 'HIGH', date: '2024-08-09', learned: true },
      { id: 2, message: 'You won $1,000,000! Click here...', risk: 'CRITICAL', date: '2024-08-08', learned: true },
      { id: 3, message: 'Your bank account is suspended...', risk: 'HIGH', date: '2024-08-07', learned: false },
      { id: 4, message: 'Hello from your bank...', risk: 'LOW', date: '2024-08-06', learned: true }
    ],
    riskFactors: [
      { factor: 'Delivery Scams', frequency: 3, risk: 'HIGH' },
      { factor: 'Financial Fraud', frequency: 2, risk: 'MEDIUM' },
      { factor: 'Bank Impersonation', frequency: 2, risk: 'HIGH' },
      { factor: 'Tech Support', frequency: 1, risk: 'LOW' }
    ],
    learningModules: [
      { id: 1, title: 'Delivery Scam Recognition', completed: true, score: 95 },
      { id: 2, title: 'Financial Fraud Prevention', completed: true, score: 88 },
      { id: 3, title: 'Bank Impersonation Detection', completed: false, score: 0 },
      { id: 4, title: 'Social Engineering Awareness', completed: false, score: 0 }
    ]
  })

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
    const highRiskCount = userProfile.riskFactors.filter(f => f.risk === 'HIGH').length
    const mediumRiskCount = userProfile.riskFactors.filter(f => f.risk === 'MEDIUM').length
    return Math.min(100, (highRiskCount * 30) + (mediumRiskCount * 15))
  }

  const riskScore = calculateRiskScore()

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Security Profile</h1>
        <p className="text-gray-600">Track your progress and learn from your experiences</p>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Level</h3>
            <Badge className={`text-lg px-4 py-2 ${getRiskColor(userProfile.riskLevel)}`}>
              {userProfile.riskLevel}
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
            <p className="text-3xl font-bold text-green-600">{userProfile.threatsDetected}</p>
            <p className="text-sm text-gray-600">Out of {userProfile.totalScans} scans</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Progress</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className={`text-3xl font-bold ${getProgressColor(userProfile.learningProgress)}`}>
                {userProfile.learningProgress}%
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProfile.riskFactors.map((factor, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{factor.factor}</h3>
                  <Badge className={getRiskColor(factor.risk)}>
                    {factor.risk}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Encountered {factor.frequency} times</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Recent Scam Analysis</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userProfile.recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge className={getRiskColor(scan.risk)}>
                  {scan.risk}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 line-clamp-1">{scan.message}</p>
                  <p className="text-xs text-gray-500">{scan.date}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProfile.learningModules.map((module) => (
              <div key={module.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{module.title}</h3>
                  {module.completed ? (
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>
                  )}
                </div>
                
                {module.completed ? (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">Score:</span>
                    <span className="text-lg font-bold text-green-600">{module.score}%</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-3">Learn to recognize and avoid this type of scam</p>
                )}
                
                <Button 
                  variant={module.completed ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                >
                  {module.completed ? 'Review Module' : 'Start Learning'}
                </Button>
              </div>
            ))}
          </div>
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
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Complete Bank Impersonation Module</h3>
              <p className="text-sm text-blue-700">You've encountered bank impersonation scams twice. Complete this module to better protect yourself.</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Review Recent High-Risk Scan</h3>
              <p className="text-sm text-yellow-700">Your recent "bank account suspended" message needs review. Learn from this experience.</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Great Progress!</h3>
              <p className="text-sm text-green-700">You've learned from 3 out of 4 recent scam encounters. Keep up the good work!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
