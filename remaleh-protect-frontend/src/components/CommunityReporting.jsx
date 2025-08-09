import React, { useState } from 'react'
import { Users, Flag, MessageSquare, TrendingUp, Award, Share2, Eye, ThumbsUp, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'

export default function CommunityReporting() {
  const [activeTab, setActiveTab] = useState('reports')
  const [reportForm, setReportForm] = useState({
    threatType: '',
    description: '',
    location: '',
    urgency: 'MEDIUM'
  })

  const [communityReports, setCommunityReports] = useState([
    {
      id: 1,
      user: 'Sarah M.',
      threatType: 'Delivery Scam',
      description: 'Received SMS claiming package held at customs. Asked for $50 fee via suspicious link.',
      location: 'Sydney, NSW',
      urgency: 'HIGH',
      votes: 23,
      comments: 8,
      verified: true,
      time: '2 hours ago'
    },
    {
      id: 2,
      user: 'Mike R.',
      threatType: 'Bank Impersonation',
      description: 'Call from "Commonwealth Bank" asking to verify account details. Number was spoofed.',
      location: 'Melbourne, VIC',
      urgency: 'CRITICAL',
      votes: 45,
      comments: 12,
      verified: true,
      time: '4 hours ago'
    },
    {
      id: 3,
      user: 'Lisa K.',
      threatType: 'Tech Support Fraud',
      description: 'Pop-up claiming computer infected. Called number and they asked for remote access.',
      location: 'Brisbane, QLD',
      urgency: 'MEDIUM',
      votes: 18,
      comments: 5,
      verified: false,
      time: '6 hours ago'
    }
  ])

  const [userStats, setUserStats] = useState({
    reportsSubmitted: 7,
    reportsVerified: 5,
    communityPoints: 1250,
    rank: 'Guardian',
    contributionLevel: 'Gold'
  })

  const getUrgencyColor = (urgency) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800'
    }
    return colors[urgency] || colors['MEDIUM']
  }

  const getContributionColor = (level) => {
    const colors = {
      'Bronze': 'bg-amber-100 text-amber-800',
      'Silver': 'bg-gray-100 text-gray-800',
      'Gold': 'bg-yellow-100 text-yellow-800',
      'Platinum': 'bg-blue-100 text-blue-800'
    }
    return colors[level] || colors['Bronze']
  }

  const handleReportSubmit = (e) => {
    e.preventDefault()
    const newReport = {
      id: Date.now(),
      user: 'You',
      ...reportForm,
      votes: 0,
      comments: 0,
      verified: false,
      time: 'Just now'
    }
    setCommunityReports([newReport, ...communityReports])
    setReportForm({ threatType: '', description: '', location: '', urgency: 'MEDIUM' })
  }

  const handleVote = (reportId, increment) => {
    setCommunityReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, votes: report.votes + increment }
          : report
      )
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Threat Reporting</h1>
        <p className="text-gray-600">Report threats, share experiences, and help protect others</p>
      </div>

      {/* User Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Flag className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.reportsSubmitted}</p>
              <p className="text-sm text-gray-600">Reports Submitted</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.reportsVerified}</p>
              <p className="text-sm text-gray-600">Reports Verified</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.communityPoints}</p>
              <p className="text-sm text-gray-600">Community Points</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.rank}</p>
              <p className="text-sm text-gray-600">Your Rank</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <Badge className={`text-lg px-3 py-1 ${getContributionColor(userStats.contributionLevel)}`}>
                {userStats.contributionLevel}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">Contribution Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'reports'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Community Reports
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'submit'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Submit Report
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'trending'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Trending Threats
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {communityReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{report.user}</h3>
                      <Badge className={getUrgencyColor(report.urgency)}>
                        {report.urgency}
                      </Badge>
                      {report.verified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Verified
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">{report.time}</span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{report.threatType}</h4>
                    <p className="text-gray-700 mb-3">{report.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📍 {report.location}</span>
                      <span>💬 {report.comments} comments</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(report.id, 1)}
                      className="flex flex-col items-center"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs">{report.votes}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">Comment</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs">Share</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'submit' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Submit Threat Report</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threat Type
                </label>
                <select
                  value={reportForm.threatType}
                  onChange={(e) => setReportForm({...reportForm, threatType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select threat type</option>
                  <option value="Delivery Scam">Delivery Scam</option>
                  <option value="Bank Impersonation">Bank Impersonation</option>
                  <option value="Tech Support Fraud">Tech Support Fraud</option>
                  <option value="Romance Scam">Romance Scam</option>
                  <option value="Investment Fraud">Investment Fraud</option>
                  <option value="Phishing">Phishing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  placeholder="Describe what happened, including any suspicious links, phone numbers, or other details..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (City, State)
                  </label>
                  <Input
                    value={reportForm.location}
                    onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                    placeholder="e.g., Sydney, NSW"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={reportForm.urgency}
                    onChange={(e) => setReportForm({...reportForm, urgency: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Low - Informational</option>
                    <option value="MEDIUM">Medium - Caution</option>
                    <option value="HIGH">High - Warning</option>
                    <option value="CRITICAL">Critical - Immediate Action</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Privacy & Safety</p>
                  <p>Your report will be shared with the community to help protect others. Personal information will be kept private.</p>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                <Flag className="w-4 h-4 mr-2" />
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'trending' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Most Reported Threats</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Delivery Scams', 'Bank Impersonation', 'Tech Support Fraud', 'Romance Scams'].map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium text-gray-900">{threat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${80 - (index * 15)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{80 - (index * 15)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Community Alerts</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-900">New Phishing Campaign</span>
                  </div>
                  <p className="text-sm text-red-700">Targeting Medicare users with fake login pages</p>
                  <p className="text-xs text-red-600 mt-1">Reported 15 times in the last 24 hours</p>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Fake Australia Post SMS</span>
                  </div>
                  <p className="text-sm text-yellow-700">SMS claiming package delivery issues</p>
                  <p className="text-xs text-yellow-600 mt-1">Reported 8 times in the last 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
