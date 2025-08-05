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
  const [selectedLearningTopic, setSelectedLearningTopic] = useState(null)

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
    }
  }

  // LEARNING CONTENT DATABASE
  const learningContent = {
    'password-security': {
      title: 'Password Protection',
      icon: Lock,
      color: 'from-blue-500 to-cyan-600',
      currentThreat: 'AI-powered password cracking and credential stuffing attacks are targeting reused passwords',
      content: {
        overview: 'With AI making password cracking faster than ever, strong unique passwords are your first line of defense.',
        tips: [
          'Use a different password for each website or app - hackers test stolen passwords everywhere',
          'Make passwords at least 12 characters long to resist AI cracking tools',
          'Mix uppercase letters, lowercase letters, numbers, and symbols',
          'Avoid using your name, birthday, or pet\'s name - these are easily guessed',
          'Use a password manager app to create and remember strong passwords',
          'Turn on two-step verification - even if your password is stolen, this stops hackers',
          'Change passwords immediately if you get breach notifications'
        ],
        tools: [
          { name: 'Password Manager Apps', desc: 'Bitwarden (free) or 1Password create uncrackable passwords for you' },
          { name: 'Two-Step Verification', desc: 'Google Authenticator or your phone\'s built-in codes add extra protection' },
          { name: 'Breach Alerts', desc: 'HaveIBeenPwned.com tells you if your email appears in data breaches' }
        ],
        warning: 'Hackers use AI to test millions of password combinations per second. Reused passwords put all your accounts at risk.',
        examples: [
          'Instead of "password123", try "Coffee&Sunshine2024!" - much harder to crack',
          'Turn a phrase into a password: "I love my 3 cats!" becomes "Il0v3my3c@ts!"',
          'Use your password manager to generate random passwords like "Kx9#mP2$vL8@"'
        ]
      }
    },
    'email-safety': {
      title: 'Email & Text Scams',
      icon: Mail,
      color: 'from-emerald-500 to-blue-600',
      currentThreat: 'AI-generated phishing emails and fake delivery/banking texts are becoming incredibly realistic',
      content: {
        overview: 'Scammers now use AI to create convincing fake emails and texts that look exactly like real companies.',
        tips: [
          'Check the sender\'s email address carefully - scammers use look-alike addresses',
          'Be extra suspicious of urgent messages about deliveries, bank accounts, or bills',
          'Never click links in unexpected texts about packages or account problems',
          'Call the company directly using numbers from their official website, not the message',
          'Look for small spelling mistakes or odd phrasing that AI might create',
          'Be wary of QR codes in emails - they can lead to fake websites',
          'Forward suspicious messages to your phone carrier by texting them to 7726 (SPAM)'
        ],
        tools: [
          { name: 'Email Spam Filters', desc: 'Gmail and Outlook automatically catch many scams, but some still get through' },
          { name: 'Link Checkers', desc: 'Copy suspicious links into VirusTotal.com before clicking them' },
          { name: 'Scam Reporting', desc: 'Report scam texts to 7726 and emails to your email provider' }
        ],
        warning: 'AI makes fake emails look perfect. When in doubt, contact the company directly through their official website.',
        examples: [
          'Scam text: "Your package is delayed. Click here to reschedule delivery"',
          'Scam email: "Unusual activity on your account. Verify now or account will be locked"',
          'Safe response: "I\'ll log into my account directly through the official website to check"'
        ]
      }
    },
    'device-protection': {
      title: 'Device & Home Security',
      icon: Shield,
      color: 'from-purple-500 to-pink-600',
      currentThreat: 'Malware targeting smart home devices and fake software updates are increasing',
      content: {
        overview: 'Hackers target phones, computers, and smart home devices to steal personal information and spy on families.',
        tips: [
          'Install updates immediately when your devices ask - delays leave security holes open',
          'Only download apps from official stores (App Store, Google Play, Microsoft Store)',
          'Use strong passwords on your WiFi router and change the default admin password',
          'Be suspicious of pop-ups claiming your computer has viruses',
          'Cover your laptop camera when not in use',
          'Regularly restart your router and smart home devices',
          'Back up family photos and important files to cloud storage'
        ],
        tools: [
          { name: 'Built-in Security', desc: 'Windows Defender and phone security apps catch most threats automatically' },
          { name: 'Router Security', desc: 'Check your router\'s app for security updates and device monitoring' },
          { name: 'Cloud Backup', desc: 'iCloud, Google Photos, or OneDrive protect your memories if devices break' }
        ],
        warning: 'Smart home devices like cameras and doorbells can be hacked if not properly secured.',
        examples: [
          'Real update: Your phone shows "iOS 17.3 available" in Settings',
          'Fake update: Pop-up saying "Your computer is infected! Download our cleaner now!"',
          'Smart home tip: Change default passwords on security cameras and baby monitors'
        ]
      }
    },
    'online-privacy': {
      title: 'Social Media & Privacy',
      icon: Globe,
      color: 'from-orange-500 to-red-600',
      currentThreat: 'Data brokers sell your personal information, and social media oversharing helps scammers target you',
      content: {
        overview: 'Your social media posts and online activity create a detailed profile that scammers use to target you and your family.',
        tips: [
          'Don\'t post vacation photos until you\'re back home - burglars watch social media',
          'Avoid posting children\'s full names, schools, or locations',
          'Check your Facebook, Instagram, and TikTok privacy settings every few months',
          'Be careful with "fun" quizzes that ask for personal information',
          'Don\'t accept friend requests from people you don\'t know personally',
          'Turn off location sharing for social media posts',
          'Think twice before posting photos that show your address or license plates'
        ],
        tools: [
          { name: 'Privacy Checkups', desc: 'Facebook and Google offer privacy checkup tools to review your settings' },
          { name: 'Data Removal', desc: 'Services like DeleteMe remove your info from data broker websites' },
          { name: 'Safe Posting', desc: 'Post vacation photos after you return, not while you\'re away' }
        ],
        warning: 'Scammers study your social media to make their fake messages more convincing and personal.',
        examples: [
          'Risky post: "At Disney World for the week with the kids! House is so quiet!"',
          'Safer post: "Had an amazing week at Disney World!" (posted after returning)',
          'Privacy tip: Don\'t let strangers see your friends list or family photos'
        ]
      }
    },
    'social-engineering': {
      title: 'Phone & Romance Scams',
      icon: Users,
      color: 'from-teal-500 to-cyan-600',
      currentThreat: 'AI voice cloning and sophisticated romance scams are targeting families and elderly individuals',
      content: {
        overview: 'Scammers use AI to clone voices and create fake relationships to steal money from trusting individuals.',
        tips: [
          'Be suspicious of urgent calls claiming a family member needs bail money',
          'Ask personal questions only the real person would know if someone calls for help',
          'Never send money, gift cards, or cryptocurrency to people you\'ve only met online',
          'Be wary of new online friends who quickly profess love or ask for financial help',
          'Don\'t trust caller ID - scammers can fake any phone number',
          'Hang up on calls about computer problems, extended warranties, or IRS issues',
          'Create a family code word for real emergencies'
        ],
        tools: [
          { name: 'Call Blocking', desc: 'Use your phone\'s built-in call blocking or apps like Truecaller' },
          { name: 'Family Communication', desc: 'Establish ways to verify family emergency calls' },
          { name: 'Reverse Image Search', desc: 'Google reverse image search can reveal if dating profile photos are stolen' }
        ],
        warning: 'AI can now clone voices from just a few seconds of audio. Always verify emergency calls through other means.',
        examples: [
          'Scam call: "Grandma, it\'s me! I\'m in jail and need $2000 for bail right now!"',
          'Safe response: "What\'s your middle name?" or "Let me call your parents first"',
          'Romance scam: Online love interest asks for money for travel or emergencies'
        ]
      }
    },
    'mobile-security': {
      title: 'Phone & App Safety',
      icon: Smartphone,
      color: 'from-indigo-500 to-purple-600',
      currentThreat: 'Fake apps, SIM swapping attacks, and malicious QR codes are targeting mobile users',
      content: {
        overview: 'Your phone contains your entire digital life. New threats target mobile devices through fake apps and SIM card attacks.',
        tips: [
          'Only download apps from official stores and check reviews before installing',
          'Be cautious scanning QR codes from unknown sources - they can install malware',
          'Use app-based two-factor authentication instead of SMS when possible',
          'Don\'t click links in text messages from unknown numbers',
          'Keep your phone number private and don\'t share it unnecessarily',
          'Use a strong passcode, not patterns or simple PINs',
          'Enable automatic app updates to get security fixes quickly'
        ],
        tools: [
          { name: 'App Store Safety', desc: 'Stick to official app stores and read reviews before downloading' },
          { name: 'Authenticator Apps', desc: 'Google Authenticator or Authy are safer than SMS for two-factor codes' },
          { name: 'Find My Device', desc: 'Enable location services so you can remotely wipe your phone if stolen' }
        ],
        warning: 'SIM swapping lets criminals take over your phone number and access accounts that use SMS verification.',
        examples: [
          'Fake app: "WhatsApp Gold" or "Instagram Pro" - stick to official apps only',
          'Suspicious QR code: Random QR codes on flyers or stickers in public places',
          'SIM swap warning: Sudden loss of cell service could mean your number was stolen'
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
      'urgent', 'help', 'attacked', 'breach', 'suspicious activity'
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2 remaleh-text-gradient">
          Stay Safe in Our Connected World
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Your Digital Well-Being Is Our Paramount Commitment
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pb-24 main-content">
        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'checker' && (
            <div className="space-y-4">
              <div className="border-0 shadow-lg bg-white/70 backdrop-blur-sm rounded-lg p-6 card-hover">
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
                    className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none resize-none transition-all duration-200"
                  />
                  <button 
                    onClick={analyzeText} 
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 button-hover"
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
              <div className="border-0 shadow-lg bg-white/70 backdrop-blur-sm rounded-lg p-6 card-hover">
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
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                  />
                  <button 
                    onClick={checkEmail} 
                    disabled={isCheckingEmail}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 button-hover"
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
              <div className="border-0 shadow-lg bg-white/70 backdrop-blur-sm rounded-lg p-6 card-hover">
                <div className="pb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900 font-semibold">Stay Safe Online</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Protect yourself from the latest cyber threats targeting families
                  </p>
                </div>
                
                {!selectedLearningTopic ? (
                  // Topic Selection View
                  <div className="space-y-4">
                    {/* Current Threat Alert */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-700">
                          <p className="font-medium mb-1">2025 Threat Alert</p>
                          <p>Scammers are using AI to create more convincing fake emails, texts, and voice calls. Stay vigilant!</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(learningContent).map(([key, item]) => (
                        <div 
                          key={key} 
                          onClick={() => setSelectedLearningTopic(key)}
                          className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-gray-200/50 hover:bg-white/70 transition-all duration-200 cursor-pointer card-hover"
                        >
                          <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                            <item.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.content.overview.substring(0, 70)}...</p>
                            <p className="text-xs text-red-600 mt-1 font-medium">⚠️ Current threat: {item.currentThreat.substring(0, 50)}...</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>

                    {/* Blog Redirection */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Continue Your Cyber Education</h4>
                            <p className="text-sm text-gray-600 mb-2">Visit our blog for more cybersecurity tips, latest threat updates, and family safety guides.</p>
                            <a 
                              href="https://www.remaleh.com.au/blog" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-sm font-medium text-cyan-700 hover:text-cyan-800 transition-colors"
                            >
                              <span>Visit Remaleh Blog</span>
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Detailed Content View
                  <div className="space-y-4">
                    {/* Back Button */}
                    <button 
                      onClick={() => setSelectedLearningTopic(null)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      <span className="text-sm">Back to topics</span>
                    </button>

                    {/* Topic Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${learningContent[selectedLearningTopic].color} rounded-xl flex items-center justify-center`}>
                        {React.createElement(learningContent[selectedLearningTopic].icon, { className: "h-6 w-6 text-white" })}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{learningContent[selectedLearningTopic].title}</h3>
                        <p className="text-gray-600 text-sm">{learningContent[selectedLearningTopic].content.overview}</p>
                      </div>
                    </div>

                    {/* Current Threat Alert */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-700">
                          <p className="font-medium mb-1">Current Threat (2025)</p>
                          <p>{learningContent[selectedLearningTopic].currentThreat}</p>
                        </div>
                      </div>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-700">
                          <p className="font-medium mb-1">Remember</p>
                          <p>{learningContent[selectedLearningTopic].content.warning}</p>
                        </div>
                      </div>
                    </div>

                    {/* Simple Steps */}
                    <div className="bg-white/50 rounded-lg p-4 border border-gray-200/50">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Simple Steps to Stay Safe</span>
                      </h4>
                      <ul className="space-y-3">
                        {learningContent[selectedLearningTopic].content.tips.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-3 text-sm text-gray-700">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-green-700">{index + 1}</span>
                            </div>
                            <span className="leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Examples Section */}
                    {learningContent[selectedLearningTopic].content.examples && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          <span>Real Examples</span>
                        </h4>
                        <div className="space-y-2">
                          {learningContent[selectedLearningTopic].content.examples.map((example, index) => (
                            <div key={index} className="text-sm text-blue-800 bg-white/50 rounded p-2">
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Helpful Tools */}
                    <div className="bg-white/50 rounded-lg p-4 border border-gray-200/50">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-purple-600" />
                        <span>Helpful Tools & Apps</span>
                      </h4>
                      <div className="space-y-3">
                        {learningContent[selectedLearningTopic].content.tools.map((tool, index) => (
                          <div key={index} className="bg-white/70 rounded-lg p-3 border border-gray-200/30">
                            <p className="font-medium text-gray-900 text-sm mb-1">{tool.name}</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{tool.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Family Tip */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
                      <div className="flex items-start space-x-2">
                        <Users className="h-4 w-4 text-cyan-600 mt-0.5" />
                        <div className="text-sm text-cyan-800">
                          <p className="font-medium mb-1">Family Tip</p>
                          <p>Share these tips with your family members, especially elderly relatives who are often targeted by these scams. Knowledge is the best protection!</p>
                        </div>
                      </div>
                    </div>

                    {/* Blog Link */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-3">
                          <BookOpen className="h-4 w-4 text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-purple-900 mb-1">Want to Learn More?</p>
                            <p className="text-sm text-purple-700 mb-2">Continue your cybersecurity education with our latest articles and family safety guides.</p>
                            <a 
                              href="https://www.remaleh.com.au/blog" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors"
                            >
                              <span>Visit Remaleh Blog</span>
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-4">
              <div className="border-0 shadow-lg bg-white/70 backdrop-blur-sm rounded-lg p-6 card-hover">
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
                        <div className="message-bubble assistant">
                          <div className="typing-indicator">
                            <div className="typing-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            <span className="typing-text">Assistant is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="chat-input">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about cybersecurity..."
                      disabled={isTyping}
                      className="chat-input-field"
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

