import React, { useState } from 'react'
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
          '• Passwords should be 12+ characters with mixed case, numbers, and symbols',
          '• Never share passwords via email or text',
          '• Change passwords immediately if you suspect a breach'
        ]
      }
    },
    phishing: {
      keywords: ['phishing', 'phishing email', 'suspicious email', 'fake email', 'email scam', 'suspicious link'],
      response: {
        source: 'expert-knowledge',
        title: '**Phishing Detection & Prevention:**',
        content: [
          '• Check sender email address carefully for misspellings',
          '• Hover over links to see actual destination before clicking',
          '• Be suspicious of urgent requests for personal information',
          '• Verify requests through official channels independently',
          '• Look for grammar and spelling errors in messages',
          '• Never provide passwords or sensitive data via email'
        ]
      }
    },
    malware: {
      keywords: ['malware', 'virus', 'ransomware', 'trojan', 'spyware', 'antivirus', 'malicious software'],
      response: {
        source: 'expert-knowledge',
        title: '**Malware Protection Strategies:**',
        content: [
          '• Keep operating system and software updated',
          '• Use reputable antivirus software with real-time protection',
          '• Avoid downloading software from untrusted sources',
          '• Be cautious with email attachments and USB drives',
          '• Regular system backups to secure locations',
          '• Enable firewall protection on all devices'
        ]
      }
    },
    breaches: {
      keywords: ['data breach', 'breach', 'hacked', 'compromised', 'stolen data', 'identity theft'],
      response: {
        source: 'expert-knowledge',
        title: '**Data Breach Response Steps:**',
        content: [
          '• Change passwords for affected accounts immediately',
          '• Monitor bank and credit card statements closely',
          '• Enable fraud alerts with credit bureaus',
          '• Consider credit monitoring services',
          '• Report identity theft to relevant authorities',
          '• Document all suspicious activities and communications'
        ]
      }
    },
    social: {
      keywords: ['social media', 'facebook', 'instagram', 'twitter', 'privacy settings', 'social engineering'],
      response: {
        source: 'expert-knowledge',
        title: '**Social Media Security Tips:**',
        content: [
          '• Review and tighten privacy settings regularly',
          '• Be selective about friend/connection requests',
          '• Avoid sharing personal information publicly',
          '• Be cautious of social engineering attempts',
          '• Use strong, unique passwords for social accounts',
          '• Enable two-factor authentication where available'
        ]
      }
    },
    network: {
      keywords: ['wifi', 'network security', 'public wifi', 'router', 'vpn', 'network'],
      response: {
        source: 'expert-knowledge',
        title: '**Network Security Best Practices:**',
        content: [
          '• Avoid sensitive activities on public WiFi',
          '• Use VPN when connecting to untrusted networks',
          '• Change default router passwords and settings',
          '• Keep router firmware updated',
          '• Use WPA3 encryption for home networks',
          '• Regularly monitor connected devices'
        ]
      }
    },
    mobile: {
      keywords: ['mobile security', 'smartphone', 'app security', 'mobile device', 'phone security'],
      response: {
        source: 'expert-knowledge',
        title: '**Mobile Device Security:**',
        content: [
          '• Keep mobile OS and apps updated',
          '• Download apps only from official stores',
          '• Review app permissions before installing',
          '• Use screen locks and biometric authentication',
          '• Enable remote wipe capabilities',
          '• Be cautious with public charging stations'
        ]
      }
    },
    business: {
      keywords: ['business security', 'enterprise', 'company security', 'workplace', 'corporate'],
      response: {
        source: 'expert-knowledge',
        title: '**Business Cybersecurity Essentials:**',
        content: [
          '• Implement comprehensive security policies',
          '• Provide regular cybersecurity training for employees',
          '• Use endpoint detection and response (EDR) solutions',
          '• Maintain secure backup and disaster recovery plans',
          '• Conduct regular security assessments and penetration testing',
          '• Establish incident response procedures'
        ]
      }
    }
  }

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

  const findRuleBasedResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    for (const [category, data] of Object.entries(cybersecurityKnowledge)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return data.response
      }
    }
    return null
  }

  const shouldEscalateToGuardian = (message) => {
    const urgentKeywords = [
      'hacked', 'compromised', 'stolen', 'fraud', 'scammed', 'emergency',
      'urgent', 'help', 'attacked', 'breach', 'suspicious activity',
      'identity theft', 'financial loss', 'blackmail', 'extortion'
    ]
    
    return urgentKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    )
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = { 
      type: 'user', 
      content: chatInput, 
      timestamp: new Date() 
    }
    setChatMessages(prev => [...prev, userMessage])
    
    const currentInput = chatInput
    setChatInput('')
    setIsTyping(true)

    // Check for rule-based response first
    const ruleResponse = findRuleBasedResponse(currentInput)
    
    if (ruleResponse) {
      // Simulate typing delay for better UX
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
    // Split content into lines and format
    const lines = content.split('\n')
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith(':**')) {
        // Bold headers
        return <div key={index} className="font-semibold text-gray-900 mb-2">{line.replace(/\*\*/g, '')}</div>
      } else if (line.startsWith('•')) {
        // Bullet points
        return <div key={index} className="ml-4 mb-1">{line}</div>
      } else if (line.trim()) {
        // Regular text
        return <div key={index} className="mb-1">{line}</div>
      }
      return null
    }).filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-3">
            <img 
              src="/remaleh-logo-full.png" 
              alt="Remaleh Logo" 
              className="h-8 w-auto object-contain"
              onError={(e) => {
                // Fallback to shield icon if logo fails to load
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

      {/* Main Content - Flex grow to fill space */}
      <div className="flex-1 max-w-md mx-auto px-4 pb-24">
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
                    className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none resize-none"
                  />
                  <button 
                    onClick={analyzeText} 
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        <span>Check Message</span>
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="border border-red-200 bg-red-50 rounded-lg p-3 flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {result && (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-xl border-2 ${getRiskColor(result.overall_assessment?.risk_level)}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {getRiskIcon(result.overall_assessment?.risk_level)}
                          <span className="font-semibold">
                            {result.overall_assessment?.risk_level} Risk
                          </span>
                          <span className="ml-auto px-2 py-1 bg-white/50 rounded text-xs">
                            {result.overall_assessment?.risk_score}/100
                          </span>
                        </div>
                        <p className="text-sm">{result.overall_assessment?.message}</p>
                      </div>

                      {result.threats_detected && result.threats_detected.length > 0 && (
                        <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                          <h4 className="text-sm text-orange-800 flex items-center font-semibold mb-2">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Threats Detected
                          </h4>
                          <div className="space-y-1">
                            {result.threats_detected.map((threat, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <XCircle className="h-3 w-3 text-orange-600" />
                                <span className="text-sm text-orange-800">{threat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                    Check if your email appears in known data breaches
                  </p>
                </div>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                  <button 
                    onClick={checkEmail} 
                    disabled={isCheckingEmail}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isCheckingEmail ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Checking Breaches...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Check My Passwords</span>
                      </>
                    )}
                  </button>

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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learn' && (
            <div className="space-y-4">
              <div className="border-0 shadow-lg bg-white/70 backdrop-blur-sm rounded-lg p-6">
                <div className="pb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900 font-semibold">Get Cyber Savvy</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Essential cybersecurity knowledge for everyone
                  </p>
                </div>
                
                <div className="space-y-3">
                  {[
                    { icon: Lock, title: 'Password Security', desc: 'Create and manage strong passwords', color: 'from-blue-500 to-cyan-600' },
                    { icon: Mail, title: 'Email Safety', desc: 'Spot and avoid phishing attempts', color: 'from-emerald-500 to-blue-600' },
                    { icon: Shield, title: 'Device Protection', desc: 'Secure your devices and data', color: 'from-purple-500 to-pink-600' },
                    { icon: Globe, title: 'Online Privacy', desc: 'Protect your digital footprint', color: 'from-orange-500 to-red-600' },
                    { icon: Users, title: 'Social Engineering', desc: 'Recognize manipulation tactics', color: 'from-teal-500 to-cyan-600' },
                    { icon: Smartphone, title: 'Mobile Security', desc: 'Keep your mobile devices safe', color: 'from-indigo-500 to-purple-600' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-gray-200/50 hover:bg-white/70 transition-colors">
                      <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
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
                <div className="pb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <HelpCircle className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900 font-semibold">Get Expert Help</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Hybrid AI + Expert cybersecurity assistance
                  </p>
                </div>

                {/* Chat Interface */}
                <div className="chat-container">
                  <div className="chat-messages">
                    {chatMessages.length === 0 && (
                      <div className="chat-welcome">
                        <div className="flex items-center justify-center mb-3">
                          <Shield className="h-8 w-8 text-cyan-600" />
                        </div>
                        <h3>Remaleh Hybrid Cybersecurity Assistant</h3>
                        <p>Expert knowledge for common topics, AI analysis for complex questions, and human Guardians for critical issues.</p>
                        <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <Crown className="h-3 w-3 text-green-600" />
                            <span>Expert Knowledge</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Brain className="h-3 w-3 text-blue-600" />
                            <span>AI Analysis</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3 text-purple-600" />
                            <span>Human Guardians</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {chatMessages.map((message, index) => (
                      <div key={index} className={`chat-message ${message.type}`}>
                        {message.type === 'assistant' && message.source && (
                          <div className={`source-badge ${message.source}`}>
                            {message.source === 'expert-knowledge' && <Crown className="h-3 w-3" />}
                            {message.source === 'ai-analysis' && <Brain className="h-3 w-3" />}
                            {message.source === 'fallback' && <HelpCircle className="h-3 w-3" />}
                            {message.source === 'expert-knowledge' ? 'Expert Knowledge' : 
                             message.source === 'ai-analysis' ? 'AI Analysis' : 'Support'}
                          </div>
                        )}
                        <div className={`message-bubble ${message.type}`}>
                          <div className="message-content">
                            {formatMessageContent(message.content)}
                          </div>
                        </div>
                        {message.escalateToGuardian && (
                          <a 
                            href="https://www.remaleh.com.au/contact-us" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="guardian-button"
                          >
                            <Users className="h-4 w-4" />
                            Connect with Remaleh Guardian
                          </a>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="chat-message assistant">
                        <div className="typing-indicator">
                          <div className="typing-dots">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                          </div>
                          <span className="text-sm text-gray-500">Analyzing...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="chat-input-container">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about cybersecurity: passwords, phishing, malware..."
                      className="chat-input"
                      rows="1"
                    />
                    <button 
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || isTyping}
                      className="chat-send-button"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-center text-xs text-gray-500">
                  <p>🔒 Hybrid Intelligence</p>
                  <p>Expert knowledge for common topics, AI analysis for complex questions, and human Guardians for critical issues.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Footer */}
      <div className="text-center py-4 px-4">
        <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
          <Shield className="h-4 w-4 text-cyan-600" />
          <span className="text-sm text-gray-700">Remaleh - Your Digital Guardian</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Copyright © 2025 Remaleh</p>
      </div>

      {/* Bottom Navigation - Fixed positioning */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 safe-area-inset-bottom">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around py-3">
            {[
              { id: 'checker', icon: MessageSquare, label: 'Check Text', gradient: 'from-cyan-500 to-blue-600' },
              { id: 'passwords', icon: Key, label: 'Passwords', gradient: 'from-emerald-500 to-cyan-600' },
              { id: 'learn', icon: BookOpen, label: 'Learn', gradient: 'from-purple-500 to-blue-600' },
              { id: 'help', icon: HelpCircle, label: 'Get Help', gradient: 'from-rose-500 to-pink-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 min-w-0 ${
                  activeTab === tab.id 
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105` 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

