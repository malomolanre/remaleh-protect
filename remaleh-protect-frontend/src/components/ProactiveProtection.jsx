import React, { useState } from 'react'
import { Shield, Browser, Mail, Smartphone, Bell, Settings, Download, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function ProactiveProtection() {
  const [protectionStatus, setProtectionStatus] = useState({
    browserExtension: { installed: false, active: false, lastScan: null },
    emailIntegration: { connected: false, provider: null, lastCheck: null },
    mobileProtection: { enabled: false, lastScan: null },
    realTimeMonitoring: { active: false, threatsBlocked: 0, lastAlert: null }
  })

  const [recentThreats, setRecentThreats] = useState([
    { id: 1, type: 'Suspicious Link', source: 'Email', blocked: true, time: '2 minutes ago' },
    { id: 2, type: 'Phishing Attempt', source: 'SMS', blocked: true, time: '15 minutes ago' },
    { id: 3, type: 'Fake Website', source: 'Browser', blocked: true, time: '1 hour ago' }
  ])

  const toggleProtection = (type) => {
    setProtectionStatus(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        active: !prev[type].active
      }
    }))
  }

  const getStatusColor = (status) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getStatusIcon = (status) => {
    return status ? CheckCircle : AlertTriangle
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Proactive Threat Protection</h1>
        <p className="text-gray-600">Stop scams before they reach you with real-time monitoring and prevention</p>
      </div>

      {/* Protection Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
              <Browser className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Browser Extension</h3>
            <Badge className={getStatusColor(protectionStatus.browserExtension.installed)}>
              {protectionStatus.browserExtension.installed ? 'Installed' : 'Not Installed'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-3">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Email Protection</h3>
            <Badge className={getStatusColor(protectionStatus.emailIntegration.connected)}>
              {protectionStatus.emailIntegration.connected ? 'Connected' : 'Not Connected'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
              <Smartphone className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Mobile Protection</h3>
            <Badge className={getStatusColor(protectionStatus.mobileProtection.enabled)}>
              {protectionStatus.mobileProtection.enabled ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-orange-100 rounded-lg w-fit mx-auto mb-3">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Real-Time Monitoring</h3>
            <Badge className={getStatusColor(protectionStatus.realTimeMonitoring.active)}>
              {protectionStatus.realTimeMonitoring.active ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Browser Extension */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Browser className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Browser Extension</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Real-time link scanning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Phishing website detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Form protection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Safe browsing warnings
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Installation</h3>
              {!protectionStatus.browserExtension.installed ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Get instant protection while browsing</p>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Install Extension
                  </Button>
                  <p className="text-xs text-gray-500">Available for Chrome, Firefox, Safari, and Edge</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600">Extension installed</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => toggleProtection('browserExtension')}
                  >
                    {protectionStatus.browserExtension.active ? 'Disable' : 'Enable'} Protection
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Email Protection</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Supported Providers</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Gmail', 'Outlook', 'Yahoo', 'Apple Mail'].map((provider) => (
                  <div key={provider} className="flex items-center gap-2 p-2 border rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{provider}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Connect Your Email</h3>
              {!protectionStatus.emailIntegration.connected ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Automatically scan emails for threats</p>
                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Connect Email
                  </Button>
                  <p className="text-xs text-gray-500">Secure OAuth connection, no password sharing</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600">Email connected</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Settings
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Protection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Mobile Protection</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Mobile Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  SMS scam detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  WhatsApp message scanning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  App permission monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  QR code safety check
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Enable Protection</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Protect your mobile communications</p>
                <Button 
                  className="w-full"
                  onClick={() => toggleProtection('mobileProtection')}
                >
                  {protectionStatus.mobileProtection.enabled ? 'Disable' : 'Enable'} Mobile Protection
                </Button>
                <p className="text-xs text-gray-500">Available for iOS and Android</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Monitoring */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Real-Time Threat Monitoring</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Monitoring Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(protectionStatus.realTimeMonitoring.active)}>
                    {protectionStatus.realTimeMonitoring.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Threats Blocked:</span>
                  <span className="font-medium text-gray-900">{protectionStatus.realTimeMonitoring.threatsBlocked}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Alert:</span>
                  <span className="text-sm text-gray-500">
                    {protectionStatus.realTimeMonitoring.lastAlert || 'None'}
                  </span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4"
                onClick={() => toggleProtection('realTimeMonitoring')}
              >
                {protectionStatus.realTimeMonitoring.active ? 'Disable' : 'Enable'} Monitoring
              </Button>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Recent Threats Blocked</h3>
              <div className="space-y-2">
                {recentThreats.map((threat) => (
                  <div key={threat.id} className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{threat.type}</p>
                      <p className="text-xs text-gray-500">{threat.source} • {threat.time}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Blocked</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="w-6 h-6 mb-2" />
              <span>Run Security Scan</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="w-6 h-6 mb-2" />
              <span>Protection Settings</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Bell className="w-6 h-6 mb-2" />
              <span>Alert Preferences</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
