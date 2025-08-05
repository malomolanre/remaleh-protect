import React, { useState } from 'react' // CRITICAL FIX: Added missing React and useState imports
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
  Lock,
  Users,
  Globe,
  Smartphone,
  Brain,
  Zap,
  ArrowRight,
  Crown,
  Send
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
  const [isTyping, setIsTyping] = useState(false)

  // Rule-based cybersecurity knowledge base
  const cybersecurityKnowledge = {
    passwords: {
      keywords: ['password', 'passwords', 'strong password', 'password security', 'password manager', '2fa', 'two factor'],
      response: {
        source: 'expert-knowledge',
        title: '**Password Security Best Practices:**',
        content: [
          '• Use unique passwords for each account',
          '• Enable two-factor authentication (2FA)',
          '• Use a reputable password manager',
          '• Create passwords with 12+ characters',
          '• Include uppercase, lowercase, numbers, and symbols',
          '• Avoid personal information in passwords',
          '• Change passwords immediately if breached'
        ]
      }
    },
    phishing: {
      keywords: ['phishing', 'suspicious email', 'fake email', 'email scam', 'suspicious link', 'verify email'],
      response: {
        source: 'expert-knowledge',
        title: '**Phishing Protection Guidelines:**',
        content: [
          '• Never click suspicious links in emails',
          '• Verify sender identity through separate channels',
          '• Check URLs carefully for misspellings',
          '• Look for urgent language or threats',
          '• Hover over links to see actual destinations',
          '• Use email filtering and security tools',
          '• Report phishing attempts to authorities'
        ]
      }
    },
    malware: {
      keywords: ['malware', 'virus', 'ransomware', 'trojan', 'suspicious software', 'computer infected'],
      response: {
        source: 'expert-knowledge',
        title: '**Malware Protection Strategies:**',
        content: [
          '• Keep software and OS updated',
          '• Use reputable antivirus software',
          '• Avoid downloading from untrusted sources',
          '• Be cautious with email attachments',
          '• Regular system backups are essential',
          '• Use application whitelisting when possible',
          '• Monitor system performance for anomalies'
        ]
      }
    },
    social_engineering: {
      keywords: ['social engineering', 'pretexting', 'baiting', 'quid pro quo', 'tailgating', 'manipulation'],
      response: {
        source: 'expert-knowledge',
        title: '**Social Engineering Defense:**',
        content: [
          '• Verify identity before sharing information',
          '• Be skeptical of unsolicited requests',
          '• Follow proper authentication procedures',
          '• Train employees on social engineering tactics',
          '• Implement physical security measures',
          '• Create incident reporting procedures',
          '• Regular security awareness training'
        ]
      }
    },
    wifi_security: {
      keywords: ['wifi', 'wireless', 'public wifi', 'network security', 'router security', 'wifi password'],
      response: {
        source: 'expert-knowledge',
        title: '**WiFi Security Best Practices:**',
        content: [
          '• Use WPA3 encryption on home networks',
          '• Avoid public WiFi for sensitive activities',
          '• Use VPN on untrusted networks',
          '• Change default router passwords',
          '• Disable WPS and unnecessary features',
          '• Regular router firmware updates',
          '• Monitor connected devices regularly'
        ]
      }
    },
    data_backup: {
      keywords: ['backup', 'data backup', 'recovery', 'data loss', 'backup strategy', 'cloud backup'],
      response: {
        source: 'expert-knowledge',
        title: '**Data Backup & Recovery:**',
        content: [
          '• Follow 3-2-1 backup rule (3 copies, 2 different media, 1 offsite)',
          '• Automate backup processes',
          '• Test backup restoration regularly',
          '• Encrypt sensitive backup data',
          '• Use both local and cloud backup solutions',
          '• Document backup and recovery procedures',
          '• Consider backup retention policies'
        ]
      }
    },
    mobile_security: {
      keywords: ['mobile security', 'smartphone', 'app security', 'mobile malware', 'device security'],
      response: {
        source: 'expert-knowledge',
        title: '**Mobile Device Security:**',
        content: [
          '• Keep mobile OS and apps updated',
          '• Download apps only from official stores',
          '• Use device lock screens and biometrics',
          '• Enable remote wipe capabilities',
          '• Review app permissions carefully',
          '• Use mobile device management (MDM) for business',
          '• Avoid charging at public USB ports'
        ]
      }
    },
    incident_response: {
      keywords: ['security incident', 'data breach', 'cyber attack', 'incident response', 'security breach'],
      response: {
        source: 'expert-knowledge',
        title: '**Security Incident Response:**',
        content: [
          '• Immediately isolate affected systems',
          '• Document all incident details',
          '• Notify relevant stakeholders and authorities',
          '• Preserve evidence for investigation',
          '• Implement containment measures',
          '• Begin recovery and restoration processes',
          '• Conduct post-incident analysis and improvements'
        ]
      }
    }
  }

  // Check if input matches any cybersecurity knowledge
  const findCybersecurityResponse = (input) => {
    const lowerInput = input.toLowerCase()
    
    for (const [category, data] of Object.entries(cybersecurityKnowledge)) {
      if (data.keywords.some(keyword => lowerInput.includes(keyword))) {
        return data.response
      }
    }
    
    return null
  }

  // Check if message should escalate to Guardian
  const shouldEscalateToGuardian = (message) => {
    const urgentKeywords = [
      'hacked', 'breach', 'stolen', 'compromised', 'urgent', 'help immediately',
      'ransomware', 'blackmail', 'threat', 'emergency', 'attacked', 'infected'
    ]
    
    return urgentKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    )
  }

  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter a message to analyze')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock analysis result
      const riskLevel = Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW'
      const mockResult = {
        risk_level: riskLevel,
        confidence: Math.floor(Math.random() * 30) + 70,
        indicators: [
          'Urgent language detected',
          'Suspicious link patterns',
          'Request for personal information'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        recommendation: riskLevel === 'HIGH' 
          ? 'Do not respond to this message. Report it as spam.'
          : riskLevel === 'MEDIUM'
          ? 'Exercise caution. Verify sender through alternative means.'
          : 'Message appears legitimate, but always stay vigilant.'
      }
      
      setResult(mockResult)
    } catch (err) {
      setError('Failed to analyze message. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const checkEmail = async () => {
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsCheckingEmail(true)
    setError(null)
    setEmailResult(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock result
      const isBreached = Math.random() > 0.6
      const mockResult = {
        breached: isBreached,
        breach_count: isBreached ? Math.floor(Math.random() * 5) + 1 : 0,
        last_breach: isBreached ? '2023-08-15' : null,
        recommendation: isBreached 
          ? 'Your email was found in data breaches. Change passwords immediately.'
          : 'No breaches found for this email address.'
      }
      
      setEmailResult(mockResult)
    } catch (err) {
      setError('Failed to check email. Please try again.')
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = { 
      type: 'user', 
      content: chatInput.trim(), 
      timestamp: new Date() 
    }
    
    setChatMessages(prev => [...prev, userMessage])
    const currentInput = chatInput.trim()
    setChatInput('')
    setIsTyping(true)

    // Check for rule-based response first
    const ruleResponse = findCybersecurityResponse(currentInput)
    
    if (ruleResponse) {
      // Simulate thinking time for rule-based responses
      setTimeout(() => {
        const assistantMessage = {
          type: 'assistant',
          content: ruleResponse.title + '\n\n' + ruleResponse.content.join('\n'),
          source: ruleResponse.source,
          timestamp: new Date(),
          escalateToGuardian: shouldEscalateToGuardian(currentInput)
        }
        setChatMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
      }, 1000)
      return
    }

    // If no rule-based response, try LLM
    try {
      const response = await fetch('https://remaleh-protect-api.onrender.com/api/chat/', {
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
        type: 'assistant', 
        content: data.response, 
        source: 'ai-analysis',
        timestamp: new Date(),
        escalateToGuardian: data.escalated || shouldEscalateToGuardian(currentInput)
      }
      
      setChatMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error('Chat error:', err)
      const fallbackMessage = { 
        type: 'assistant', 
        content: 'I apologize, but I\'m having trouble processing complex questions right now. For immediate assistance with cybersecurity concerns, please contact our Remaleh Guardians.',
        source: 'fallback',
        timestamp: new Date(),
        escalateToGuardian: true
      }
      setChatMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendChatMessage()
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

  const formatMessageContent = (content) => {
    const lines = content.split('\n')
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith(':**')) {
        return <div key={index} className="font-semibold text-gray-900 mb-2">{line.replace(/\*\*/g, '')}</div>
      } else if (line.startsWith('•')) {
        return <div key={index} className="ml-4 mb-1">{line}</div>
      } else if (line.trim()) {
        return <div key={index} className="mb-1">{line}</div>
      }
      return null
    }).filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-3">
            <img 
              src="/remaleh-logo-full.png" 
              alt="Remaleh Logo" 
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center shadow-lg" style={{display: 'none'}}>
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Stay Safe in Our Connected World
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Your Digital Well-Being Is Our Paramount Commitment
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pb-24">
        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'checker' && (
            <div className="space-y-4">
              <div className="border-0 shadow-lg bg-white/70 backdrop-blur-sm rounded-lg p-6">
                <div className="pb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900 font-semibold">Check Text Message</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Analyze messages for scams and threats using advanced AI
                  </p>
                </div>
                <div className="space-y-4">
                  <textarea
                    placeholder="Paste your message here to check for scams..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <button
                    onClick={analyzeText}
                    disabled={isAnalyzing || !text.trim()}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        <span>Check Message</span>
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-800 text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {result && (
                  <div className={`mt-4 p-4 rounded-lg border-2 ${getRiskColor(result.risk_level)}`}>
                    <div className="flex items-center space-x-2 mb-3">
                      {getRiskIcon(result.risk_level)}
                      <span className="font-semibold">Risk Level: {result.risk_level}</span>
                      <span className="text-sm opacity-75">({result.confidence}% confidence)</span>
                    </div>
                    
                    {result.indicators && result.indicators.length > 0 && (
                      <div className="mb-3">
                        <p className="font-medium mb-2">Detected Indicators:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {result.indicators.map((indicator, index) => (
                            <li key={index}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium mb-1">Recommendation:</p>
                      <p className="text-sm">{result.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'passwords' && (
            <div className="space-y-4">
              <div className="border-0 shadow-lg bg-white/70 backdrop-blur-sm rounded-lg p-6">
                <div className="pb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <Key className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900 font-semibold">Password Safety Check</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Check if your email has been compromised in data breaches
                  </p>
                </div>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={checkEmail}
                    disabled={isCheckingEmail || !email.trim()}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isCheckingEmail ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Check My Passwords</span>
                      </>
                    )}
                  </button>
                </div>

                {emailResult && (
                  <div className={`mt-4 p-4 rounded-lg border-2 ${
                    emailResult.breached 
                      ? 'text-red-600 bg-red-50 border-red-200' 
                      : 'text-green-600 bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-3">
                      {emailResult.breached ? (
                        <ShieldAlert className="h-5 w-5 text-red-600" />
                      ) : (
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      )}
                      <span className="font-semibold">
                        {emailResult.breached ? 'Breaches Found' : 'No Breaches Found'}
                      </span>
                    </div>
                    
                    {emailResult.breached && (
                      <div className="mb-3">
                        <p className="text-sm">
                          Found in <strong>{emailResult.breach_count}</strong> data breach(es)
                        </p>
                        {emailResult.last_breach && (
                          <p className="text-sm">
                            Last breach: {emailResult.last_breach}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm">{emailResult.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'learn' && (
            <div className="space-y-4">
              <div className="border-0 shadow-lg bg-white/70 backdrop-blur-sm rounded-lg p-6">
                <div className="pb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900 font-semibold">Cyber Education</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Learn essential cybersecurity practices to stay protected
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Lock, title: 'Password Security', desc: 'Create and manage strong passwords', color: 'from-blue-500 to-purple-600' },
                    { icon: Shield, title: 'Phishing Protection', desc: 'Identify and avoid email scams', color: 'from-green-500 to-blue-600' },
                    { icon: Smartphone, title: 'Mobile Security', desc: 'Secure your mobile devices', color: 'from-pink-500 to-rose-600' },
                    { icon: Globe, title: 'Safe Browsing', desc: 'Navigate the web securely', color: 'from-cyan-500 to-blue-600' },
                    { icon: Users, title: 'Social Engineering', desc: 'Recognize manipulation tactics', color: 'from-orange-500 to-red-600' },
                    { icon: Brain, title: 'Privacy Awareness', desc: 'Protect your personal data', color: 'from-indigo-500 to-purple-600' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-gray-200/50 hover:bg-white/70 transition-colors cursor-pointer">
                      <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <item.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-4">
              <div className="border-0 shadow-lg bg-white/70 backdrop-blur-sm rounded-lg p-6">
                <div className="pb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <HelpCircle className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900 font-semibold">Get Help</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Chat with our cybersecurity assistant for instant help
                  </p>
                </div>

                {/* Chat Interface */}
                <div className="bg-white rounded-lg border border-gray-200 h-80 flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Ask me anything about cybersecurity!</p>
                        <p className="text-xs text-gray-400 mt-1">I can help with passwords, phishing, malware, and more.</p>
                      </div>
                    ) : (
                      chatMessages.map((message, index) => (
                        <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user' 
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {message.type === 'assistant' && message.source && (
                              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                                message.source === 'expert-knowledge' 
                                  ? 'bg-green-100 text-green-800' 
                                  : message.source === 'ai-analysis'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {message.source === 'expert-knowledge' && <Crown className="h-3 w-3" />}
                                {message.source === 'ai-analysis' && <Brain className="h-3 w-3" />}
                                {message.source === 'fallback' && <Zap className="h-3 w-3" />}
                                <span>
                                  {message.source === 'expert-knowledge' ? 'EXPERT KNOWLEDGE' : 
                                   message.source === 'ai-analysis' ? 'AI ANALYSIS' : 'FALLBACK'}
                                </span>
                              </div>
                            )}
                            <div className="text-sm">
                              {message.type === 'assistant' ? formatMessageContent(message.content) : message.content}
                            </div>
                            {message.escalateToGuardian && (
                              <div className="mt-3 pt-2 border-t border-gray-200">
                                <button className="inline-flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-xs font-medium rounded-full hover:from-cyan-700 hover:to-blue-800 transition-colors">
                                  <Shield className="h-3 w-3" />
                                  <span>Contact Remaleh Guardian</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-xs text-gray-500">Assistant is typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-gray-200 p-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about cybersecurity..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        disabled={isTyping}
                      />
                      <button
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim() || isTyping}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6">
        <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
          <Shield className="h-4 w-4 text-cyan-600" />
          <span className="text-sm text-gray-700">Remaleh - Your Digital Guardian</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Copyright © 2025 Remaleh</p>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 safe-area-pb">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-around">
            {[
              { id: 'checker', icon: MessageSquare, label: 'Check Text' },
              { id: 'passwords', icon: Key, label: 'Passwords' },
              { id: 'learn', icon: BookOpen, label: 'Learn' },
              { id: 'help', icon: HelpCircle, label: 'Get Help' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg transform scale-105'
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

