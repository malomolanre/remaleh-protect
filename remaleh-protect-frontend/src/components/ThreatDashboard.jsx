import React, { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, Users, Clock, BarChart3, Globe, Shield, Plus, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useThreatIntelligence } from '../hooks/useThreatIntelligence'

export default function ThreatDashboard() {
  const {
    dashboardData,
    threats,
    alerts,
    trends,
    isLoading,
    error,
    loadAllData,
    clearError
  } = useThreatIntelligence()

  const [showNewThreatForm, setShowNewThreatForm] = useState(false)
  const [newThreat, setNewThreat] = useState({
    title: '',
    description: '',
    threat_type: '',
    severity: 'MEDIUM',
    region: 'Global'
  })

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  const getSeverityColor = (severity) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800'
    }
    return colors[severity] || colors['LOW']
  }

  const getTrendColor = (trend) => {
    return trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
  }

  const handleNewThreatSubmit = async (e) => {
    e.preventDefault()
    // This would integrate with the createThreat function from the hook
    setShowNewThreatForm(false)
    setNewThreat({ title: '', description: '', threat_type: '', severity: 'MEDIUM', region: 'Global' })
  }

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading threat intelligence...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error loading data</span>
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
  const stats = dashboardData?.stats || {
    totalReports: 0,
    activeUsers: 0,
    threatsBlocked: 0,
    avgResponseTime: '0s'
  }

  const trendingThreats = trends?.slice(0, 4) || []
  const recentAlerts = alerts?.slice(0, 3) || []

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Threat Intelligence Dashboard</h1>
          <p className="text-gray-600">Real-time insights into emerging scams and community protection</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadAllData()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowNewThreatForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Threat
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Threats Blocked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.threatsBlocked.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Threats */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Trending Threats</h2>
          </div>
        </CardHeader>
        <CardContent>
          {trendingThreats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingThreats.map((threat, index) => (
                <div key={threat.id || index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{threat.title || threat.threat_type}</h3>
                    <Badge className={getSeverityColor(threat.severity)}>
                      {threat.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{threat.report_count || 0} reports</span>
                    <span className={`font-medium ${getTrendColor(threat.trend || '+0%')}`}>
                      {threat.trend || '+0%'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Globe className="w-3 h-3" />
                    <span>{threat.region || 'Global'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No trending threats available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Community Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Community Alerts</h2>
          </div>
        </CardHeader>
        <CardContent>
          {recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message || alert.description}</p>
                    <p className="text-xs text-gray-500">{alert.created_at || 'Recently'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent alerts</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threat Map Preview */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Global Threat Distribution</h2>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-red-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-600">
              <Globe className="w-16 h-16 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Interactive threat map coming soon</p>
              <p className="text-xs">Real-time visualization of global scam patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Threat Form Modal */}
      {showNewThreatForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Report New Threat</h3>
            <form onSubmit={handleNewThreatSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newThreat.title}
                  onChange={(e) => setNewThreat({...newThreat, title: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newThreat.description}
                  onChange={(e) => setNewThreat({...newThreat, description: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newThreat.threat_type}
                    onChange={(e) => setNewThreat({...newThreat, threat_type: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="phishing">Phishing</option>
                    <option value="scam">Scam</option>
                    <option value="malware">Malware</option>
                    <option value="fraud">Fraud</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={newThreat.severity}
                    onChange={(e) => setNewThreat({...newThreat, severity: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Submit Report</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewThreatForm(false)}
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
