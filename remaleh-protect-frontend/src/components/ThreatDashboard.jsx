import React, { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, Users, Clock, BarChart3, Globe, Shield } from 'lucide-react'
import { Card, CardHeader, CardContent } from './ui/card'
import { Badge } from './ui/badge'

export default function ThreatDashboard() {
  const [threatData, setThreatData] = useState({
    trendingThreats: [
      { type: 'Delivery Scams', count: 156, trend: '+23%', risk: 'HIGH', region: 'Global' },
      { type: 'Bank Impersonation', count: 89, trend: '+15%', risk: 'CRITICAL', region: 'Australia' },
      { type: 'Tech Support Fraud', count: 67, trend: '+8%', risk: 'MEDIUM', region: 'Global' },
      { type: 'Romance Scams', count: 43, trend: '+12%', risk: 'HIGH', region: 'Global' }
    ],
    recentAlerts: [
      { id: 1, message: 'New phishing campaign targeting Medicare users', severity: 'HIGH', time: '2 hours ago' },
      { id: 2, message: 'Fake Australia Post SMS scams increasing', severity: 'MEDIUM', time: '4 hours ago' },
      { id: 3, message: 'Cryptocurrency investment fraud surge', severity: 'CRITICAL', time: '6 hours ago' }
    ],
    communityStats: {
      totalReports: 1247,
      activeUsers: 892,
      threatsBlocked: 3456,
      avgResponseTime: '2.3s'
    }
  })

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

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Threat Intelligence Dashboard</h1>
        <p className="text-gray-600">Real-time insights into emerging scams and community protection</p>
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
                <p className="text-2xl font-bold text-gray-900">{threatData.communityStats.totalReports.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">{threatData.communityStats.activeUsers.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">{threatData.communityStats.threatsBlocked.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">{threatData.communityStats.avgResponseTime}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {threatData.trendingThreats.map((threat, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{threat.type}</h3>
                  <Badge className={getSeverityColor(threat.risk)}>
                    {threat.risk}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{threat.count} reports</span>
                  <span className={`font-medium ${getTrendColor(threat.trend)}`}>
                    {threat.trend}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Globe className="w-3 h-3" />
                  <span>{threat.region}</span>
                </div>
              </div>
            ))}
          </div>
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
          <div className="space-y-3">
            {threatData.recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  )
}
