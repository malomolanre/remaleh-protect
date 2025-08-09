import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Target, AlertTriangle, Calendar, MapPin, Clock, Filter, Download, Eye } from 'lucide-react'
import { Card, CardHeader, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [viewMode, setViewMode] = useState('overview')

  const [analyticsData, setAnalyticsData] = useState({
    threatTrends: [
      { date: '2024-08-03', delivery: 12, bank: 8, tech: 5, romance: 3 },
      { date: '2024-08-04', delivery: 15, bank: 10, tech: 7, romance: 4 },
      { date: '2024-08-05', delivery: 18, bank: 12, tech: 6, romance: 5 },
      { date: '2024-08-06', delivery: 14, bank: 9, tech: 8, romance: 3 },
      { date: '2024-08-07', delivery: 20, bank: 15, tech: 9, romance: 6 },
      { date: '2024-08-08', delivery: 22, bank: 18, tech: 11, romance: 7 },
      { date: '2024-08-09', delivery: 25, bank: 20, tech: 12, romance: 8 }
    ],
    regionalData: [
      { region: 'NSW', threats: 156, population: '8.2M', riskScore: 78 },
      { region: 'VIC', threats: 134, population: '6.7M', riskScore: 72 },
      { region: 'QLD', threats: 98, population: '5.2M', riskScore: 65 },
      { region: 'WA', threats: 67, population: '2.7M', riskScore: 58 },
      { region: 'SA', threats: 45, population: '1.8M', riskScore: 52 },
      { region: 'TAS', threats: 23, population: '0.5M', riskScore: 45 }
    ],
    threatPatterns: [
      { pattern: 'Urgency Pressure', frequency: 89, risk: 'HIGH', examples: 15 },
      { pattern: 'Authority Impersonation', frequency: 67, risk: 'CRITICAL', examples: 23 },
      { pattern: 'Financial Incentive', frequency: 54, risk: 'HIGH', examples: 18 },
      { pattern: 'Social Engineering', frequency: 43, risk: 'MEDIUM', examples: 12 },
      { pattern: 'Technical Manipulation', frequency: 32, risk: 'MEDIUM', examples: 8 }
    ],
    predictiveInsights: [
      { insight: 'Delivery scam surge expected', confidence: 87, timeframe: 'Next 48 hours', reason: 'Pattern analysis shows 3x increase in similar campaigns' },
      { insight: 'Bank impersonation targeting NSW', confidence: 92, timeframe: 'Next week', reason: 'Geographic clustering and timing patterns detected' },
      { insight: 'Tech support fraud decline', confidence: 78, timeframe: 'Next 2 weeks', reason: 'Law enforcement actions and public awareness campaigns' }
    ]
  })

  const [filters, setFilters] = useState({
    threatType: 'all',
    riskLevel: 'all',
    region: 'all'
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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const calculateTotalThreats = () => {
    return analyticsData.threatTrends.reduce((total, day) => 
      total + day.delivery + day.bank + day.tech + day.romance, 0
    )
  }

  const getTopThreatType = () => {
    const totals = {
      delivery: analyticsData.threatTrends.reduce((sum, day) => sum + day.delivery, 0),
      bank: analyticsData.threatTrends.reduce((sum, day) => sum + day.bank, 0),
      tech: analyticsData.threatTrends.reduce((sum, day) => sum + day.tech, 0),
      romance: analyticsData.threatTrends.reduce((sum, day) => sum + day.romance, 0)
    }
    return Object.entries(totals).sort(([,a], [,b]) => b - a)[0]
  }

  const topThreat = getTopThreatType()

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Analytics & Insights</h1>
        <p className="text-gray-600">Deep dive into threat patterns, trends, and predictive intelligence</p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Regions</option>
                <option value="nsw">NSW</option>
                <option value="vic">VIC</option>
                <option value="qld">QLD</option>
                <option value="wa">WA</option>
                <option value="sa">SA</option>
                <option value="tas">TAS</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="overview">Overview</option>
                <option value="detailed">Detailed Analysis</option>
                <option value="predictive">Predictive Insights</option>
              </select>
            </div>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{calculateTotalThreats()}</p>
            <p className="text-sm text-gray-600">Total Threats Detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{topThreat[1]}</p>
            <p className="text-sm text-gray-600">Top Threat: {topThreat[0].charAt(0).toUpperCase() + topThreat[0].slice(1)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">78</p>
            <p className="text-sm text-gray-600">Average Risk Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-orange-100 rounded-lg w-fit mx-auto mb-3">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">2.3s</p>
            <p className="text-sm text-gray-600">Avg Response Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Threat Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Threat Trends Over Time</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Daily</Button>
              <Button variant="outline" size="sm">Weekly</Button>
              <Button variant="outline" size="sm">Monthly</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-600">
              <BarChart3 className="w-16 h-16 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Interactive chart coming soon</p>
              <p className="text-xs">Real-time threat trend visualization</p>
            </div>
          </div>
          
          {/* Simplified Trend Display */}
          <div className="mt-4 grid grid-cols-7 gap-2">
            {analyticsData.threatTrends.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(day.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: `${(day.delivery / 25) * 100}%` }}></div>
                  <div className="h-2 bg-red-500 rounded" style={{ width: `${(day.bank / 20) * 100}%` }}></div>
                  <div className="h-2 bg-yellow-500 rounded" style={{ width: `${(day.tech / 12) * 100}%` }}></div>
                  <div className="h-2 bg-purple-500 rounded" style={{ width: `${(day.romance / 8) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Analysis */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Regional Threat Distribution</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Threats by Region</h3>
              <div className="space-y-3">
                {analyticsData.regionalData.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{region.region}</span>
                      <p className="text-sm text-gray-600">{region.threats} threats</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getRiskColor(region.riskScore > 70 ? 'HIGH' : region.riskScore > 50 ? 'MEDIUM' : 'LOW')}>
                        {region.riskScore}/100
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{region.population}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Risk Heatmap</h3>
              <div className="h-64 bg-gradient-to-br from-green-50 to-red-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <MapPin className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Interactive map coming soon</p>
                  <p className="text-xs">Geographic threat visualization</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat Pattern Analysis */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Threat Pattern Recognition</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Pattern Frequency</h3>
              <div className="space-y-3">
                {analyticsData.threatPatterns.map((pattern, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{pattern.pattern}</h4>
                      <Badge className={getRiskColor(pattern.risk)}>
                        {pattern.risk}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{pattern.frequency} occurrences</span>
                      <span>{pattern.examples} examples</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(pattern.frequency / 89) * 100}%`,
                          backgroundColor: pattern.risk === 'CRITICAL' ? '#dc2626' : 
                                        pattern.risk === 'HIGH' ? '#ea580c' : 
                                        pattern.risk === 'MEDIUM' ? '#eab308' : '#16a34a'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Pattern Correlation</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <BarChart3 className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Correlation matrix coming soon</p>
                  <p className="text-xs">Pattern relationship analysis</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Insights */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Predictive Intelligence</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.predictiveInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{insight.insight}</h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {insight.confidence}% Confidence
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{insight.reason}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>⏰ {insight.timeframe}</span>
                      <span className={`font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence >= 90 ? 'High' : insight.confidence >= 75 ? 'Medium' : 'Low'} Reliability
                      </span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Recommended Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">Immediate Actions</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Increase monitoring in NSW</li>
                <li>• Alert delivery companies</li>
                <li>• Update threat signatures</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Short-term (1-7 days)</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Deploy new detection rules</li>
                <li>• Community awareness campaign</li>
                <li>• Law enforcement coordination</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Long-term (1-4 weeks)</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Pattern analysis review</li>
                <li>• Machine learning model updates</li>
                <li>• User education programs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
