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
      case 'HIGH': return 'risk-high'
      case 'MEDIUM': return 'risk-medium'
      case 'LOW': return 'risk-low'
      case 'VERY_LOW': return 'risk-very-low'
      default: return 'risk-unknown'
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <img 
                src="/remaleh-logo.png" 
                alt="Remaleh Logo" 
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div className="logo-text">
              <h1>Remaleh Protect</h1>
              <p>Your Digital Safety Companion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Hero Section */}
        <div className="hero">
          <div className="hero-icon">
            <img 
              src="/remaleh-logo.png" 
              alt="Remaleh Logo" 
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'contain'
              }}
            />
          </div>
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
                      <li>Don't answer calls from unknown numbers</li>
                      <li>Never give personal info over the phone</li>
                      <li>Be suspicious of prize notifications</li>
                      <li>Verify caller identity independently</li>
                    </ul>
                  </div>

                  <div className="learn-card learn-browsing">
                    <h3>🌐 Safe Browsing</h3>
                    <ul>
                      <li>Look for HTTPS (lock icon) on websites</li>
                      <li>Keep your browser updated</li>
                      <li>Use reputable antivirus software</li>
                      <li>Be cautious with public Wi-Fi</li>
                    </ul>
                  </div>

                  <div className="learn-card learn-social">
                    <h3>👥 Social Media Safety</h3>
                    <ul>
                      <li>Review privacy settings regularly</li>
                      <li>Think before you share personal info</li>
                      <li>Be selective with friend requests</li>
                      <li>Report suspicious accounts</li>
                    </ul>
                  </div>

                  <div className="learn-card learn-threats">
                    <h3>⚠️ Current Threat Alerts</h3>
                    <ul>
                      <li>AI deepfake scams increasing</li>
                      <li>Fake delivery notifications</li>
                      <li>Romance scams on dating apps</li>
                      <li>Cryptocurrency investment frauds</li>
                    </ul>
                    <p><strong>Stay vigilant and verify everything!</strong></p>
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
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </svg>
                  Get Expert Help
                </div>
                <p>Chat with our AI assistant or connect with cybersecurity experts</p>
              </div>
              <div className="card-content">
                <div className="chat-container">
                  {chatMessages.length === 0 ? (
                    <div className="chat-empty">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44L5.5 19H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2.5l1.54-.44A2.5 2.5 0 0 1 9.5 2Z"/>
                        <path d="M14 6h7v12h-1"/>
                        <path d="M14 9h4"/>
                        <path d="M14 12h2"/>
                      </svg>
                      <p>Start a conversation with our AI assistant</p>
                      <small>We're here to help with any cybersecurity concerns</small>
                    </div>
                  ) : (
                    <div className="chat-messages">
                      {chatMessages.map((message, index) => (
                        <div key={index} className={`chat-message ${message.type}`}>
                          {message.type === 'expert' && (
                            <div className="expert-badge">
                              <div className="expert-indicator"></div>
                              Human Expert
                            </div>
                          )}
                          <p>{message.content}</p>
                          {message.actions && message.actions.length > 0 && (
                            <div className="chat-actions">
                              {message.actions.map((action, actionIndex) => (
                                <div key={actionIndex} className="chat-action">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                                    <path d="m9 12 2 2 4-4"/>
                                  </svg>
                                  {action}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="chat-input-container">
                  <input
                    placeholder="Describe your cybersecurity concern..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    className="input"
                  />
                  <button 
                    onClick={sendChatMessage}
                    className="btn btn-help"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </button>
                </div>

                <div className="help-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                  <div>
                    <strong>How it works</strong>
                    <p>Our AI assistant will help with initial questions and connect you with human experts for complex issues.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="privacy-footer">
          <div className="privacy-badge">
            <img 
              src="/remaleh-logo.png" 
              alt="Remaleh Logo" 
              style={{
                width: '16px',
                height: '16px',
                objectFit: 'contain'
              }}
            />
            Remaleh Protect - Your Digital Guardian
          </div>
          <p>24/7 Cybersecurity Monitoring</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-container">
          {[
            { id: 'checker', icon: 'message', label: 'Check Text' },
            { id: 'passwords', icon: 'lock', label: 'Passwords' },
            { id: 'learn', icon: 'book', label: 'Learn' },
            { id: 'help', icon: 'help', label: 'Get Help' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''} nav-${tab.id}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {tab.icon === 'message' && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>}
                {tab.icon === 'lock' && (
                  <>
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                  </>
                )}
                {tab.icon === 'book' && (
                  <>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </>
                )}
                {tab.icon === 'help' && (
                  <>
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </>
                )}
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App

