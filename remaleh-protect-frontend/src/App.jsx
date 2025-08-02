import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2, 
  AlertTriangle, 
  MessageSquare, 
  Key, 
  BookOpen, 
  HelpCircle,
  Mail,
  CheckCircle,
  XCircle,
  Info,
  Home,
  Lock,
  Users,
  Globe,
  Smartphone,
  Eye,
  Brain,
  Zap,
  Star,
  ArrowRight
} from 'lucide-react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('checker')
  const [text, setText] = useState('')
  const [email, setEmail] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [result, setResult] = useState(null)
  const [emailResult, setEmailResult] = useState(null)
  const [error, setError] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to check')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('https://remaleh-protect-api.onrender.com/api/scam/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          check_links: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Connection error. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const checkEmail = async () => {
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    setIsCheckingEmail(true)
    setError(null)
    setEmailResult(null)

    try {
      const response = await fetch('https://remaleh-protect-api.onrender.com/api/breach/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setEmailResult(data)
    } catch (err) {
      console.error('Email check error:', err)
      setError('Connection error. Please try again.')
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = { type: 'user', content: chatInput, timestamp: new Date() }
    setChatMessages(prev => [...prev, userMessage])
    
    const currentInput = chatInput
    setChatInput('')

    try {
      const response = await fetch('https://remaleh-protect-api.onrender.com/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput,
          conversation_history: chatMessages.slice(-5)
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const aiMessage = { 
        type: data.escalated ? 'expert' : 'ai', 
        content: data.response, 
        timestamp: new Date(),
        category: data.category,
        urgency: data.urgency,
        actions: data.suggested_actions
      }
      
      setChatMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage = { 
        type: 'system', 
        content: 'Sorry, I\'m having trouble connecting. Please try again.', 
        timestamp: new Date() 
      }
      setChatMessages(prev => [...prev, errorMessage])
    }
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200'
      case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'LOW': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'VERY_LOW': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskIcon = (level) => {
    switch (level) {
      case 'HIGH': return <ShieldAlert className="h-5 w-5 text-red-600" />
      case 'MEDIUM': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'LOW': return <Info className="h-5 w-5 text-yellow-600" />
      case 'VERY_LOW': return <ShieldCheck className="h-5 w-5 text-green-600" />
      default: return <Shield className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                <CheckCircle className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                Remaleh Protect
              </h1>
              <p className="text-xs text-gray-600">Your Digital Safety Companion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pb-20">
        {/* Hero Section */}
        <div className="py-6 text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Stay Safe in Our Connected World
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Your Digital Well-Being Is Our Paramount Commitment
          </p>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'checker' && (
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">Check Text Message</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    Analyze messages for scams and threats using advanced AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste your message here to check for scams..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[100px] border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                  />
                  <Button 
                    onClick={analyzeText} 
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Check Message
                      </>
                    )}
                  </Button>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}

                  {result && (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-xl border-2 ${getRiskColor(result.overall_assessment?.risk_level)}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {getRiskIcon(result.overall_assessment?.risk_level)}
                          <span className="font-semibold">
                            {result.overall_assessment?.risk_level} Risk
                          </span>
                          <Badge variant="outline" className="ml-auto">
                            {result.overall_assessment?.risk_score}/100
                          </Badge>
                        </div>
                        <p className="text-sm">{result.overall_assessment?.message}</p>
                      </div>

                      {result.threats_detected && result.threats_detected.length > 0 && (
                        <Card className="border-orange-200 bg-orange-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-orange-800 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Threats Detected
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-1">
                              {result.threats_detected.map((threat, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <XCircle className="h-3 w-3 text-orange-600" />
                                  <span className="text-sm text-orange-800">{threat}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'passwords' && (
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <Key className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">Password Safety Check</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    Check if your email appears in known data breaches
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                  <Button 
                    onClick={checkEmail} 
                    disabled={isCheckingEmail}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isCheckingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking Breaches...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Check My Passwords
                      </>
                    )}
                  </Button>

                  {emailResult && (
                    <div className={`p-4 rounded-xl border-2 ${emailResult.breaches_found > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {emailResult.breaches_found > 0 ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        <span className={`font-semibold ${emailResult.breaches_found > 0 ? 'text-red-700' : 'text-green-700'}`}>
                          {emailResult.breaches_found > 0 ? 'Breaches Found' : 'No Breaches Found'}
                        </span>
                      </div>
                      <p className={`text-sm ${emailResult.breaches_found > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {emailResult.message}
                      </p>
                      {emailResult.breaches_found > 0 && (
                        <div className="mt-3 text-red-600 text-sm">
                          <p><strong>Recommendation:</strong> Change passwords for accounts associated with this email immediately.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Privacy Notice</p>
                        <p>Your email is never stored. We only check against known breach databases.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'learn' && (
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">Get Cyber Savvy</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    Essential cybersecurity knowledge for everyone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Essential Tips */}
                  <div className="space-y-3">
                    <Card className="border-cyan-200 bg-cyan-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-cyan-800 flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Password Safety
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-cyan-700 space-y-2">
                        <p>• Use unique passwords for each account</p>
                        <p>• Enable two-factor authentication</p>
                        <p>• Use a password manager</p>
                        <p>• Never share passwords via email or text</p>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-800 flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Scam Detection
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-blue-700 space-y-2">
                        <p>• Check sender's email address carefully</p>
                        <p>• Be wary of urgent requests for money</p>
                        <p>• Verify links before clicking</p>
                        <p>• Don't download unexpected attachments</p>
                      </CardContent>
                    </Card>

                    <Card className="border-emerald-200 bg-emerald-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-emerald-800 flex items-center">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Phone & SMS Protection
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-emerald-700 space-y-2">
                        <p>• Don't answer calls from unknown numbers</p>
                        <p>• Never give personal info over the phone</p>
                        <p>• Be suspicious of prize notifications</p>
                        <p>• Verify caller identity independently</p>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-purple-800 flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Safe Browsing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-purple-700 space-y-2">
                        <p>• Look for HTTPS (lock icon) on websites</p>
                        <p>• Keep your browser updated</p>
                        <p>• Use reputable antivirus software</p>
                        <p>• Be cautious with public Wi-Fi</p>
                      </CardContent>
                    </Card>

                    <Card className="border-indigo-200 bg-indigo-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-indigo-800 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Social Media Safety
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-indigo-700 space-y-2">
                        <p>• Review privacy settings regularly</p>
                        <p>• Think before you share personal info</p>
                        <p>• Be selective with friend requests</p>
                        <p>• Report suspicious accounts</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Current Threats */}
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-800 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Current Threat Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-orange-700 space-y-2">
                      <p>• AI deepfake scams increasing</p>
                      <p>• Fake delivery notifications</p>
                      <p>• Romance scams on dating apps</p>
                      <p>• Cryptocurrency investment frauds</p>
                      <p className="font-medium">Stay vigilant and verify everything!</p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <HelpCircle className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">Get Expert Help</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    Chat with our AI assistant or connect with cybersecurity experts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-64 border border-gray-200 rounded-lg p-3 overflow-y-auto bg-gray-50">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Start a conversation with our AI assistant</p>
                        <p className="text-xs text-gray-400 mt-1">We're here to help with any cybersecurity concerns</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chatMessages.map((message, index) => (
                          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                              message.type === 'user' 
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                                : message.type === 'expert'
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white'
                                : message.type === 'system'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-white text-gray-800 border border-gray-200'
                            }`}>
                              {message.type === 'expert' && (
                                <div className="flex items-center space-x-1 mb-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="text-xs font-medium">Human Expert</span>
                                </div>
                              )}
                              <p>{message.content}</p>
                              {message.actions && message.actions.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.actions.map((action, actionIndex) => (
                                    <div key={actionIndex} className="flex items-center space-x-1 text-xs">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>{action}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Describe your cybersecurity concern..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      className="border-gray-200 focus:border-rose-500 focus:ring-rose-500/20"
                    />
                    <Button 
                      onClick={sendChatMessage}
                      className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">How it works</p>
                        <p>Our AI assistant will help with initial questions and connect you with human experts for complex issues.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
            <Shield className="h-4 w-4 text-cyan-600" />
            <span className="text-sm text-gray-700">Powered by local AI - Your data stays secure</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Connected to live Remaleh Protect API</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around py-2">
            {[
              { id: 'checker', icon: MessageSquare, label: 'Check Text', gradient: 'from-cyan-500 to-blue-600' },
              { id: 'passwords', icon: Key, label: 'Passwords', gradient: 'from-emerald-500 to-cyan-600' },
              { id: 'learn', icon: BookOpen, label: 'Learn', gradient: 'from-purple-500 to-blue-600' },
              { id: 'help', icon: HelpCircle, label: 'Get Help', gradient: 'from-rose-500 to-pink-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id 
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg` 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
