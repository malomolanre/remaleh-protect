import React, { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, Users, Clock, BarChart3, Globe, Shield, Plus, RefreshCw } from 'lucide-react'
import { MobileCard } from './ui/mobile-card'
import { MobileButton } from './ui/mobile-button'
import { MobileInput } from './ui/mobile-input'
import { MobileModal } from './ui/mobile-modal'
import { MobileGrid, MobileGridItem, MobileStatsGrid } from './ui/mobile-grid'
import { MobileList, MobileListItemWithBadge } from './ui/mobile-list'
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
      <div className="p-4">
        <MobileCard className="bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error loading data</span>
          </div>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <MobileButton onClick={clearError} variant="outline" size="sm" className="w-full">
            Try Again
          </MobileButton>
        </MobileCard>
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
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Threat Intelligence</h1>
        <p className="text-gray-600 text-sm">Real-time insights into emerging scams</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <MobileButton onClick={() => loadAllData()} variant="outline" size="sm" className="flex-1">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </MobileButton>
        <MobileButton onClick={() => setShowNewThreatForm(true)} size="sm" className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          New Threat
        </MobileButton>
      </div>

      {/* Stats Overview */}
      <MobileStatsGrid>
        <MobileGridItem>
          <MobileCard>
            <div className="flex items-center gap-3 p-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Reports</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalReports.toLocaleString()}</p>
              </div>
            </div>
          </MobileCard>
        </MobileGridItem>

        <MobileGridItem>
          <MobileCard>
            <div className="flex items-center gap-3 p-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Active Users</p>
                <p className="text-lg font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
              </div>
            </div>
          </MobileCard>
        </MobileGridItem>

        <MobileGridItem>
          <MobileCard>
            <div className="flex items-center gap-3 p-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Threats Blocked</p>
                <p className="text-lg font-bold text-gray-900">{stats.threatsBlocked.toLocaleString()}</p>
              </div>
            </div>
          </MobileCard>
        </MobileGridItem>

        <MobileGridItem>
          <MobileCard>
            <div className="flex items-center gap-3 p-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg Response</p>
                <p className="text-lg font-bold text-gray-900">{stats.avgResponseTime}</p>
              </div>
            </div>
          </MobileCard>
        </MobileGridItem>
      </MobileStatsGrid>

      {/* Trending Threats */}
      <MobileCard>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Trending Threats</h2>
          </div>
          
          {trendingThreats.length > 0 ? (
            <MobileList>
              {trendingThreats.map((threat, index) => (
                <MobileListItemWithBadge
                  key={threat.id || index}
                  title={threat.title || threat.threat_type}
                  subtitle={`${threat.report_count || 0} reports • ${threat.region || 'Global'}`}
                  badge={threat.severity}
                  badgeColor={threat.severity === 'CRITICAL' ? 'red' : 
                             threat.severity === 'HIGH' ? 'orange' : 
                             threat.severity === 'MEDIUM' ? 'yellow' : 'green'}
                  icon={<Globe className="w-4 h-4 text-gray-400" />}
                  rightContent={
                    <span className={`text-sm font-medium ${getTrendColor(threat.trend || '+0%')}`}>
                      {threat.trend || '+0%'}
                    </span>
                  }
                />
              ))}
            </MobileList>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No trending threats available</p>
            </div>
          )}
        </div>
      </MobileCard>

      {/* Recent Community Alerts */}
      <MobileCard>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
          </div>
          
          {recentAlerts.length > 0 ? (
            <MobileList>
              {recentAlerts.map((alert) => (
                <MobileListItemWithBadge
                  key={alert.id}
                  title={alert.message || alert.description}
                  subtitle={alert.created_at || 'Recently'}
                  badge={alert.severity}
                  badgeColor={alert.severity === 'CRITICAL' ? 'red' : 
                             alert.severity === 'HIGH' ? 'orange' : 
                             alert.severity === 'MEDIUM' ? 'yellow' : 'green'}
                  icon={<AlertTriangle className="w-4 h-4 text-orange-400" />}
                />
              ))}
            </MobileList>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recent alerts</p>
            </div>
          )}
        </div>
      </MobileCard>

      {/* Threat Map Preview */}
      <MobileCard>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Threat Distribution</h2>
          <div className="h-48 bg-gradient-to-br from-blue-50 to-red-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-600">
              <Globe className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Interactive threat map coming soon</p>
              <p className="text-xs">Real-time visualization of global scam patterns</p>
            </div>
          </div>
        </div>
      </MobileCard>

      {/* New Threat Form Modal */}
      <MobileModal
        isOpen={showNewThreatForm}
        onClose={() => setShowNewThreatForm(false)}
        title="Report New Threat"
        size="full"
      >
        <form onSubmit={handleNewThreatSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <MobileInput
              type="text"
              value={newThreat.title}
              onChange={(e) => setNewThreat({...newThreat, title: e.target.value})}
              placeholder="Enter threat title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newThreat.description}
              onChange={(e) => setNewThreat({...newThreat, description: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              placeholder="Describe the threat in detail"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={newThreat.threat_type}
                onChange={(e) => setNewThreat({...newThreat, threat_type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={newThreat.severity}
                onChange={(e) => setNewThreat({...newThreat, severity: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <MobileButton type="submit" className="flex-1">
              Submit Report
            </MobileButton>
            <MobileButton 
              type="button" 
              variant="outline" 
              onClick={() => setShowNewThreatForm(false)}
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
