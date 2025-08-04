import { useState } from 'react'
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

  // Hybrid chatbot rule-based responses (frontend)
  const getRuleBasedResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Password-related queries
    if (lowerMessage.includes('password') || lowerMessage.includes('2fa') || lowerMessage.includes('authentication')) {
      return {
        response: "🔐 **Password Security Best Practices:**\n\n• Use unique passwords for each account\n• Enable two-factor authentication (2FA)\n• Use a reputable password manager\n• Passwords should be 12+ characters with mixed case, numbers, and symbols\n• Never share passwords via email or text\n• Change passwords immediately if you suspect a breach\n\nWould you like specific help with password management tools or setting up 2FA?",
        source: "rule_based",
        showGuardian: false
      }
    }
    
    // Phishing/scam queries
    if (lowerMessage.includes('phishing') || lowerMessage.includes('scam') || lowerMessage.includes('suspicious email')) {
      return {
        response: "🎣 **Phishing & Scam Protection:**\n\n• Check sender's email address carefully\n• Look for urgent language or threats\n• Verify links before clicking (hover to see real URL)\n• Don't download unexpected attachments\n• When in doubt, contact the organization directly\n• Use our 'Check Text' feature to analyze suspicious messages\n\nIf you're dealing with an active threat or need immediate assistance, I can connect you with a Remaleh Guardian.",
        source: "rule_based",
        showGuardian: true
      }
    }
    
    // Malware/virus queries
    if (lowerMessage.includes('malware') || lowerMessage.includes('virus') || lowerMessage.includes('infected') || lowerMessage.includes('ransomware')) {
      return {
        response: "🦠 **Malware Protection & Response:**\n\n• Keep your antivirus software updated\n• Run regular system scans\n• Avoid downloading software from untrusted sources\n• Keep your operating system updated\n• If infected: disconnect from internet, run antivirus scan\n• For ransomware: DO NOT pay - contact authorities\n\n⚠️ **If you suspect active malware infection, this requires immediate expert assistance.**",
        source: "rule_based",
        showGuardian: true
      }
    }
    
    // Data breach queries
    if (lowerMessage.includes('breach') || lowerMessage.includes('hacked') || lowerMessage.includes('compromised')) {
      return {
        response: "🚨 **Data Breach Response:**\n\n• Change passwords for affected accounts immediately\n• Enable 2FA on all important accounts\n• Monitor your accounts for suspicious activity\n• Check credit reports for unauthorized activity\n• Use our 'Password Safety Check' to see if your email appears in known breaches\n\nFor business data breaches or complex incidents, expert guidance is essential.",
        source: "rule_based",
        showGuardian: true
      }
    }
    
    // Social media security
    if (lowerMessage.includes('social media') || lowerMessage.includes('facebook') || lowerMessage.includes('instagram') || lowerMessage.includes('twitter')) {
      return {
        response: "📱 **Social Media Security:**\n\n• Review privacy settings regularly\n• Be selective with friend/connection requests\n• Think before sharing personal information\n• Use strong, unique passwords\n• Enable 2FA on all social accounts\n• Be cautious of suspicious links in messages\n• Report and block suspicious accounts\n\nNeed help securing specific social media accounts?",
        source: "rule_based",
        showGuardian: false
      }
    }
    
    // WiFi/network security
    if (lowerMessage.includes('wifi') || lowerMessage.includes('network') || lowerMessage.includes('router') || lowerMessage.includes('vpn')) {
      return {
        response: "📶 **Network & WiFi Security:**\n\n• Avoid sensitive activities on public WiFi\n• Use a VPN when on public networks\n• Change default router passwords\n• Use WPA3 encryption on home WiFi\n• Regularly update router firmware\n• Hide your network name (SSID) if possible\n• Monitor connected devices regularly\n\nFor business network security, professional assessment is recommended.",
        source: "rule_based",
        showGuardian: true
      }
    }
    
    // Mobile security
    if (lowerMessage.includes('mobile') || lowerMessage.includes('phone') || lowerMessage.includes('smartphone') || lowerMessage.includes('app')) {
      return {
        response: "📱 **Mobile Device Security:**\n\n• Keep your OS and apps updated\n• Only download apps from official stores\n• Use screen locks (PIN, password, biometric)\n• Enable remote wipe capabilities\n• Be cautious with app permissions\n• Avoid clicking suspicious text message links\n• Use mobile antivirus if available\n\nConcerned about a specific mobile security issue?",
        source: "rule_based",
        showGuardian: false
      }
    }
    
    // Business/enterprise security
    if (lowerMessage.includes('business') || lowerMessage.includes('company') || lowerMessage.includes('enterprise') || lowerMessage.includes('employee')) {
      return {
        response: "🏢 **Business Cybersecurity:**\n\n• Implement employee security training\n• Use endpoint protection on all devices\n• Regular security audits and assessments\n• Backup data regularly and test recovery\n• Implement access controls and monitoring\n• Have an incident response plan\n• Consider cyber insurance\n\n**Business security requires professional consultation for proper implementation.**",
        source: "rule_based",
        showGuardian: true
      }
    }
    
    // General help or greeting
    if (lowerMessage.includes('help') || lowerMessage.includes('hello') || lowerMessage.includes('hi') || message.trim().length < 10) {
      return {
        response: "👋 **Welcome to Remaleh Cybersecurity Support!**\n\nI'm here to help with:\n• Password security and management\n• Phishing and scam identification\n• Malware protection and response\n• Data breach guidance\n• Social media security\n• Network and WiFi security\n• Mobile device protection\n• Business cybersecurity advice\n\n**What cybersecurity topic can I help you with today?**",
        source: "rule_based",
        showGuardian: false
      }
    }
    
    return null // No rule-based match, use backend LLM
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

    // First try rule-based response (instant)
    const ruleResponse = getRuleBasedResponse(currentInput)
    
    if (ruleResponse) {
      // Rule-based response found
      setTimeout(() => {
        const aiMessage = { 
          type: 'expert',
          content: ruleResponse.response, 
          timestamp: new Date(),
          source: ruleResponse.source,
          confidence: 'high',
          showGuardian: ruleResponse.showGuardian,
          escalated: false
        }
        setChatMessages(prev => [...prev, aiMessage])
        setIsTyping(false)
      }, 500) // Small delay for better UX
      return
    }

    // No rule-based match, use backend LLM
    try {
      const response = await fetch('https://remaleh-protect-api.onrender.com/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput,
          conversation_history: chatMessages.slice(-6) // Last 6 messages for context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Determine message type based on source
      let messageType = 'ai'
      if (data.source === 'llm') {
        messageType = 'llm'
      } else if (data.source === 'error') {
        messageType = 'system'
      }
      
      const aiMessage = { 
        type: messageType,
        content: data.response, 
        timestamp: new Date(),
        source: data.source,
        confidence: data.confidence,
        showGuardian: data.show_guardian,
        escalated: data.escalated
      }
      
      setChatMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage = { 
        type: 'system', 
        content: 'I\'m having trouble connecting right now. For immediate cybersecurity assistance, please connect with a Remaleh Guardian.', 
        timestamp: new Date(),
        showGuardian: true
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const connectToGuardian = () => {
    // Open Remaleh contact page in new tab
    window.open('https://www.remaleh.com.au/contact-us', '_blank')
    
    // Add a message to chat confirming the action
    const guardianMessage = {
      type: 'system',
      content: "🛡️ **Connecting you to a Remaleh Guardian...**\n\nI've opened our contact page where you can reach our cybersecurity experts directly. They'll provide personalized assistance for your specific situation.",
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, guardianMessage])
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'risk-high'
      case 'MEDIUM': return 'risk-medium'
      case 'LOW': return 'risk-low'
      case 'VERY_LOW': return 'risk-very-low'
      default: return 'risk-unknown'
    }
  }

  const getSourceBadge = (message) => {
    if (message.source === 'rule_based' || message.type === 'expert') {
      return (
        <div className="source-badge expert-knowledge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Expert Knowledge
        </div>
      )
    } else if (message.source === 'llm' || message.type === 'llm') {
      return (
        <div className="source-badge ai-analysis">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
          AI Analysis
        </div>
      )
    }
    return null
  }

  const formatChatMessage = (content) => {
    // Split content by lines and format appropriately
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="chat-bold">{line.slice(2, -2)}</div>
      } else if (line.startsWith('• ')) {
        return <div key={index} className="chat-bullet">{line}</div>
      } else if (line.trim() === '') {
        return <div key={index} className="chat-spacer"></div>
      } else {
        return <div key={index} className="chat-line">{line}</div>
      }
    })
  }

  return (
    <div className="app">
      {/* Header with Remaleh Logo */}
      <div className="header">
        <div className="header-content">
          <div className="remaleh-logo-container">
            <img 
              src="/remaleh-logo-full.png" 
              alt="Remaleh" 
              className="remaleh-logo"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Hero Section - Text Only */}
        <div className="hero">
          <h2>Stay Safe in Our Connected World</h2>
          <p>Your Digital Well-Being Is Our Paramount Commitment</p>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'checker' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Check Text Message
                </div>
                <p>Analyze messages for scams and threats using advanced AI</p>
              </div>
              <div className="card-content">
                <textarea
                  placeholder="Paste your message here to check for scams..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="textarea"
                />
                <button 
                  onClick={analyzeText} 
                  disabled={isAnalyzing}
                  className="btn btn-primary"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                      </svg>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Check Message
                    </>
                  )}
                </button>

                {error && (
                  <div className="alert alert-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                      <path d="M12 9v4"/>
                      <path d="m12 17 .01 0"/>
                    </svg>
                    {error}
                  </div>
                )}

                {result && (
                  <div className="results">
                    <div className={`risk-card ${getRiskColor(result.overall_assessment?.risk_level)}`}>
                      <div className="risk-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        <span>{result.overall_assessment?.risk_level} Risk</span>
                        <span className="risk-score">{result.overall_assessment?.risk_score}/100</span>
                      </div>
                      <p>{result.overall_assessment?.message}</p>
                    </div>

                    {result.threats_detected && result.threats_detected.length > 0 && (
                      <div className="threats-card">
                        <div className="threats-header">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                          </svg>
                          Threats Detected
                        </div>
                        <div className="threats-list">
                          {result.threats_detected.map((threat, index) => (
                            <div key={index} className="threat-item">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="m15 9-6 6"/>
                                <path d="m9 9 6 6"/>
                              </svg>
                              {threat}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'passwords' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Password Safety Check
                </div>
                <p>Check if your email appears in known data breaches</p>
              </div>
              <div className="card-content">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
                <button 
                  onClick={checkEmail} 
                  disabled={isCheckingEmail}
                  className="btn btn-secondary"
                >
                  {isCheckingEmail ? (
                    <>
                      <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                      </svg>
                      Checking Breaches...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Check My Passwords
                    </>
                  )}
                </button>

                {emailResult && (
                  <div className={`breach-result ${emailResult.breaches_found > 0 ? 'breach-found' : 'breach-safe'}`}>
                    <div className="breach-header">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {emailResult.breaches_found > 0 ? (
                          <>
                            <circle cx="12" cy="12" r="10"/>
                            <path d="m15 9-6 6"/>
                            <path d="m9 9 6 6"/>
                          </>
                        ) : (
                          <>
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </>
                        )}
                      </svg>
                      <span>{emailResult.breaches_found > 0 ? 'Breaches Found' : 'No Breaches Found'}</span>
                    </div>
                    <p>{emailResult.message}</p>
                    {emailResult.breaches_found > 0 && (
                      <div className="breach-recommendation">
                        <strong>Recommendation:</strong> Change passwords for accounts associated with this email immediately.
                      </div>
                    )}
                  </div>
                )}

                <div className="privacy-notice">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m9 9 1.5 1.5L16 6"/>
                  </svg>
                  <div>
                    <strong>Privacy Notice</strong>
                    <p>Your email is never stored. We only check against known breach databases.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learn' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  Get Cyber Savvy
                </div>
                <p>Essential cybersecurity knowledge for everyone</p>
              </div>
              <div className="card-content">
                <div className="learn-sections">
                  <div className="learn-card learn-passwords">
                    <h3>🔒 Password Safety</h3>
                    <ul>
                      <li>Use unique passwords for each account</li>
                      <li>Enable two-factor authentication</li>
                      <li>Use a password manager</li>
                      <li>Never share passwords via email or text</li>
                    </ul>
                  </div>

                  <div className="learn-card learn-email">
                    <h3>📧 Email Scam Detection</h3>
                    <ul>
                      <li>Check sender's email address carefully</li>
                      <li>Be wary of urgent requests for money</li>
                      <li>Verify links before clicking</li>
                      <li>Don't download unexpected attachments</li>
                    </ul>
                  </div>

                  <div className="learn-card learn-phone">
                    <h3>📱 Phone & SMS Protection</h3>
                    <ul>
                      <li>Don't click suspicious links in texts</li>
                      <li>Verify caller identity before sharing info</li>
                      <li>Be skeptical of urgent payment requests</li>
                      <li>Use official apps and websites</li>
                    </ul>
                  </div>

                  <div className="learn-card learn-social">
                    <h3>🌐 Social Media Safety</h3>
                    <ul>
                      <li>Review privacy settings regularly</li>
                      <li>Think before sharing personal information</li>
                      <li>Be cautious with friend requests</li>
                      <li>Report suspicious accounts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </svg>
                  Get Expert Help
                </div>
                <p>Hybrid AI + Expert cybersecurity assistance</p>
              </div>
              <div className="card-content">
                <div className="chat-container">
                  <div className="chat-messages">
                    {chatMessages.length === 0 && (
                      <div className="chat-welcome">
                        <div className="chat-welcome-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                        </div>
                        <h3>Remaleh Hybrid Cybersecurity Assistant</h3>
                        <p>Expert knowledge for common topics, AI analysis for complex questions, and human Guardians for critical issues.</p>
                        <div className="chat-features">
                          <div className="chat-feature">
                            <span className="feature-badge expert">🧠 Expert Knowledge</span>
                            <span>Instant responses</span>
                          </div>
                          <div className="chat-feature">
                            <span className="feature-badge ai">🤖 AI Analysis</span>
                            <span>Complex questions</span>
                          </div>
                          <div className="chat-feature">
                            <span className="feature-badge guardian">🛡️ Human Guardians</span>
                            <span>Critical issues</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`chat-message ${message.type}`}>
                        {message.type === 'user' ? (
                          <div className="message-content user-message">
                            <div className="message-text">{message.content}</div>
                          </div>
                        ) : (
                          <div className="message-content ai-message">
                            {getSourceBadge(message)}
                            <div className="message-text">
                              {formatChatMessage(message.content)}
                            </div>
                            {message.showGuardian && (
                              <button 
                                onClick={connectToGuardian}
                                className="guardian-button"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                                Connect with Remaleh Guardian
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="chat-message ai">
                        <div className="message-content ai-message">
                          <div className="typing-indicator">
                            <div className="typing-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            <span className="typing-text">Analyzing your question...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="chat-input-container">
                    <input
                      type="text"
                      placeholder="Ask about cybersecurity: passwords, phishing, malware, etc..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      className="chat-input"
                    />
                    <button 
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || isTyping}
                      className="chat-send-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m22 2-7 20-4-9-9-4Z"/>
                        <path d="M22 2 11 13"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="chat-info">
                    <div className="hybrid-intelligence">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m9 9 1.5 1.5L16 6"/>
                      </svg>
                      <span>Hybrid Intelligence</span>
                    </div>
                    <p>Expert knowledge for common topics, AI analysis for complex questions, and human Guardians for critical issues.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'checker' ? 'active' : ''}`}
          onClick={() => setActiveTab('checker')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Check Text</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'passwords' ? 'active' : ''}`}
          onClick={() => setActiveTab('passwords')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Passwords</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'learn' ? 'active' : ''}`}
          onClick={() => setActiveTab('learn')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span>Learn</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}
          onClick={() => setActiveTab('help')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
          <span>Get Help</span>
        </button>
      </div>

      {/* Privacy Footer */}
      <div className="privacy-footer">
        <div className="privacy-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Remaleh - Your Digital Guardian
        </div>
        <p>Copyright © 2025 Remaleh</p>
      </div>
    </div>
  )
}

export default App

