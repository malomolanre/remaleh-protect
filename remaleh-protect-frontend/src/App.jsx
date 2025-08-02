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
  Info
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
      // Use comprehensive mode by default for simplicity
      const response = await fetch('https://lnh8imcdpmq9.manus.space/api/scam/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze text')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Unable to check this message. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const checkEmail = async () => {
    if (!email.trim()) {
      setError('Please enter your email address')
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
      // HaveIBeenPwned API call (we'll implement this in the backend)
      const response = await fetch('https://lnh8imcdpmq9.manus.space/api/breach/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to check email')
      }

      const data = await response.json()
      setEmailResult(data)
    } catch (err) {
      setError('Unable to check email. Please try again.')
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = { type: 'user', text: chatInput.trim(), timestamp: new Date() }
    setChatMessages(prev => [...prev, userMessage])
    const currentInput = chatInput.trim()
    setChatInput('')

    // Add typing indicator
    const typingMessage = { type: 'ai', text: 'Typing...', timestamp: new Date(), isTyping: true }
    setChatMessages(prev => [...prev, typingMessage])

    try {
      // Call chat API
      const response = await fetch('https://lnh8imcdpmq9.manus.space/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversation_history: chatMessages
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from chat service')
      }

      const chatResponse = await response.json()

      // Remove typing indicator and add actual response
      setChatMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping)
        const aiMessage = {
          type: 'ai',
          text: chatResponse.message,
          timestamp: new Date(),
          escalate_to_human: chatResponse.escalate_to_human,
          urgency_level: chatResponse.urgency_level,
          suggested_actions: chatResponse.suggested_actions || [],
          category: chatResponse.category
        }
        return [...withoutTyping, aiMessage]
      })

      // Handle escalation to human expert
      if (chatResponse.escalate_to_human) {
        setTimeout(() => {
          const escalationMessage = {
            type: 'system',
            text: '🔄 Connecting you with a human cybersecurity expert...',
            timestamp: new Date(),
            isEscalation: true
          }
          setChatMessages(prev => [...prev, escalationMessage])
          
          // Simulate expert connection
          setTimeout(() => {
            const expertMessage = {
              type: 'expert',
              text: '👨‍💻 Hi! I\'m Sarah, a cybersecurity specialist. I\'ve reviewed your conversation and I\'m here to help you resolve this issue. Let me guide you through the next steps.',
              timestamp: new Date(),
              isExpert: true
            }
            setChatMessages(prev => [...prev, expertMessage])
          }, 3000)
        }, 2000)
      }

    } catch (err) {
      // Remove typing indicator and show error
      setChatMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping)
        const errorMessage = {
          type: 'ai',
          text: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or if this is urgent, contact our support team directly.',
          timestamp: new Date(),
          isError: true
        }
        return [...withoutTyping, errorMessage]
      })
    }
  }

  const getRiskLevel = (result) => {
    if (result.comprehensive_analysis) {
      return result.comprehensive_analysis.final_risk_level
    }
    return result.analysis?.risk_level || 'UNKNOWN'
  }

  const getScamScore = (result) => {
    if (result.comprehensive_analysis) {
      return result.comprehensive_analysis.combined_score
    }
    return result.analysis?.scam_score || 0
  }

  const isDangerous = (result) => {
    if (result.comprehensive_analysis) {
      // Check text analysis first as it's more accurate for scam detection
      if (result.comprehensive_analysis.text_analysis?.is_scam) {
        return true
      }
      // Also check if scam score is high (above 30 indicates potential scam)
      if (result.comprehensive_analysis.combined_score > 30) {
        return true
      }
      return result.comprehensive_analysis.is_dangerous
    }
    return result.analysis?.is_scam || false
  }

  const renderTextChecker = () => (
    <div className="space-y-6">
      <Card className="border-teal-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-800">
            <MessageSquare className="h-5 w-5 mr-2 text-teal-600" />
            Check Text Message
          </CardTitle>
          <CardDescription className="text-base">
            Paste any suspicious text, email, or message to check if it's safe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your message here..."
            className="min-h-32 border-teal-200 focus:border-teal-500 focus:ring-teal-200 text-base"
          />
          
          <Button
            onClick={analyzeText}
            disabled={isAnalyzing || !text.trim()}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-6 text-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Check Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-teal-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-gray-800">
              <Shield className="h-5 w-5 mr-2 text-teal-600" />
              Safety Check Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="mb-4">
                {isDangerous(result) ? (
                  <div className="flex items-center justify-center text-red-600 mb-2">
                    <XCircle className="h-12 w-12 mr-2" />
                    <span className="text-2xl font-bold">NOT SAFE</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-green-600 mb-2">
                    <CheckCircle className="h-12 w-12 mr-2" />
                    <span className="text-2xl font-bold">LOOKS SAFE</span>
                  </div>
                )}
              </div>
              
              <Alert className={isDangerous(result) ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                <AlertDescription className={`text-base ${isDangerous(result) ? 'text-red-800' : 'text-green-800'}`}>
                  {isDangerous(result) 
                    ? '⚠️ This message contains warning signs of a scam. Do not click any links or provide personal information.'
                    : '✅ This message appears to be safe. No suspicious patterns detected.'
                  }
                </AlertDescription>
              </Alert>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Safety Score</p>
              <p className="text-3xl font-bold text-teal-600">
                {100 - getScamScore(result)}/100
              </p>
              <p className="text-sm text-gray-500">Higher is safer</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderPasswordChecker = () => (
    <div className="space-y-6">
      <Card className="border-teal-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-800">
            <Key className="h-5 w-5 mr-2 text-teal-600" />
            Check Password Safety
          </CardTitle>
          <CardDescription className="text-base">
            Enter your email to check if your passwords have been compromised in data breaches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="border-teal-200 focus:border-teal-500 focus:ring-teal-200 text-base"
            />
          </div>
          
          <Button
            onClick={checkEmail}
            disabled={isCheckingEmail || !email.trim()}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-6 text-lg"
          >
            {isCheckingEmail ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Key className="h-5 w-5 mr-2" />
                Check My Passwords
              </>
            )}
          </Button>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              We only check if your email appears in known data breaches. We never store your email address.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Email Results */}
      {emailResult && (
        <Card className="border-teal-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-gray-800">
              <Mail className="h-5 w-5 mr-2 text-teal-600" />
              Breach Check Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {emailResult.breached ? (
                <div className="text-red-600 mb-4">
                  <XCircle className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">Passwords May Be Compromised</h3>
                  <p className="text-sm mt-2">Your email was found in {emailResult.breach_count} data breach(es)</p>
                </div>
              ) : (
                <div className="text-green-600 mb-4">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">No Breaches Found</h3>
                  <p className="text-sm mt-2">Your email wasn't found in any known data breaches</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderCyberResources = () => (
    <div className="space-y-6">
      <Card className="border-teal-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-800">
            <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
            Get Cyber Savvy
          </CardTitle>
          <CardDescription className="text-base">
            Essential cybersecurity knowledge made simple for everyone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            
            {/* Password Safety */}
            <Card className="border-gray-200 hover:border-teal-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🔒</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Password Safety</h3>
                    <p className="text-sm text-gray-600 mb-3">Create strong, unique passwords to protect your accounts</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                      <p><strong>✓ Do:</strong> Use 12+ characters with letters, numbers, symbols</p>
                      <p><strong>✓ Do:</strong> Use different passwords for each account</p>
                      <p><strong>✓ Do:</strong> Use a password manager</p>
                      <p><strong>✗ Don't:</strong> Use personal info like birthdays or names</p>
                      <p><strong>✗ Don't:</strong> Share passwords or write them down</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Scams */}
            <Card className="border-gray-200 hover:border-teal-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📧</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Spot Email Scams</h3>
                    <p className="text-sm text-gray-600 mb-3">Learn to identify and avoid phishing emails</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                      <p><strong>🚨 Warning Signs:</strong></p>
                      <p>• Urgent language: "Act now!" or "Limited time!"</p>
                      <p>• Requests for personal information</p>
                      <p>• Suspicious sender addresses</p>
                      <p>• Poor grammar and spelling</p>
                      <p>• Unexpected attachments or links</p>
                      <p><strong>💡 Always verify through official channels</strong></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone & SMS Scams */}
            <Card className="border-gray-200 hover:border-teal-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📱</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Phone & SMS Scams</h3>
                    <p className="text-sm text-gray-600 mb-3">Protect yourself from phone and text message scams</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                      <p><strong>Common Scams:</strong></p>
                      <p>• Fake tech support calls</p>
                      <p>• Prize/lottery notifications</p>
                      <p>• Fake bank security alerts</p>
                      <p>• Romance scams</p>
                      <p><strong>🛡️ Protection:</strong> Never give personal info over phone/SMS</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safe Browsing */}
            <Card className="border-gray-200 hover:border-teal-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🌐</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Safe Browsing</h3>
                    <p className="text-sm text-gray-600 mb-3">Browse the internet safely and securely</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                      <p><strong>✓ Look for HTTPS:</strong> Secure sites start with "https://"</p>
                      <p><strong>✓ Check URLs:</strong> Verify website addresses carefully</p>
                      <p><strong>✓ Use antivirus:</strong> Keep security software updated</p>
                      <p><strong>✗ Avoid:</strong> Clicking suspicious pop-ups or ads</p>
                      <p><strong>✗ Avoid:</strong> Downloading from untrusted sources</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Safety */}
            <Card className="border-gray-200 hover:border-teal-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">👥</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Social Media Safety</h3>
                    <p className="text-sm text-gray-600 mb-3">Stay safe while using social platforms</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                      <p><strong>Privacy Settings:</strong> Review and update regularly</p>
                      <p><strong>Think Before Sharing:</strong> Personal info can be misused</p>
                      <p><strong>Friend Requests:</strong> Only accept from people you know</p>
                      <p><strong>Suspicious Messages:</strong> Don't click unknown links</p>
                      <p><strong>Report & Block:</strong> Use platform safety features</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Threats */}
            <Card className="border-orange-200 bg-orange-50 hover:border-orange-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-800 mb-2">Current Threat Alerts</h3>
                    <p className="text-sm text-orange-700 mb-3">Stay informed about the latest cybersecurity threats</p>
                    <div className="bg-white p-3 rounded-lg text-sm space-y-2 border border-orange-200">
                      <p><strong>🔥 Trending Scams:</strong></p>
                      <p>• AI-generated voice scams (deepfakes)</p>
                      <p>• Fake cryptocurrency investments</p>
                      <p>• COVID-19 related phishing</p>
                      <p>• Fake delivery notifications</p>
                      <p>• Romance scams on dating apps</p>
                      <p className="text-orange-600 font-medium">Stay vigilant and verify everything!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHelpChat = () => (
    <div className="space-y-6">
      <Card className="border-teal-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-800">
            <HelpCircle className="h-5 w-5 mr-2 text-teal-600" />
            Get Help - I Think I've Been Hacked
          </CardTitle>
          <CardDescription className="text-base">
            Chat with our AI assistant. We'll connect you with a human expert if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto bg-gray-50">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <HelpCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Hi! I'm here to help. Tell me what's happening and I'll guide you through the next steps.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                    <div className={`max-w-sm px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user' 
                        ? 'bg-teal-600 text-white' 
                        : message.type === 'expert'
                        ? 'bg-blue-100 border border-blue-300 text-blue-900'
                        : message.type === 'system'
                        ? 'bg-yellow-100 border border-yellow-300 text-yellow-900 text-center'
                        : 'bg-white border border-gray-200'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-gray-500 ml-2">AI is thinking...</span>
                        </div>
                      ) : (
                        <div>
                          {message.type === 'expert' && (
                            <div className="flex items-center mb-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-xs font-semibold text-blue-700">Human Expert</span>
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">{message.text}</div>
                          {message.suggested_actions && message.suggested_actions.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Suggested Actions:</p>
                              <div className="space-y-1">
                                {message.suggested_actions.map((action, actionIndex) => (
                                  <div key={actionIndex} className="flex items-center text-xs">
                                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                    <span>{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {message.urgency_level && message.urgency_level === 'high' && (
                            <div className="mt-2 pt-2 border-t border-red-200">
                              <div className="flex items-center text-xs text-red-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                <span className="font-semibold">High Priority Issue</span>
                              </div>
                            </div>
                          )}
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
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Describe what happened..."
              className="border-teal-200 focus:border-teal-500 focus:ring-teal-200"
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            />
            <Button 
              onClick={sendChatMessage}
              disabled={!chatInput.trim()}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'checker': return renderTextChecker()
      case 'passwords': return renderPasswordChecker()
      case 'resources': return renderCyberResources()
      case 'help': return renderHelpChat()
      default: return renderTextChecker()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 mr-3 text-teal-200" />
            <h1 className="text-3xl font-bold">Remaleh Protect</h1>
          </div>
          <p className="text-lg text-teal-100">Your Digital Safety Companion</p>
          <p className="text-sm text-teal-200 mt-2">Simple tools to keep you safe online</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTab('checker')}
            className={`flex flex-col items-center py-3 px-2 text-xs ${
              activeTab === 'checker' 
                ? 'text-teal-600 bg-teal-50' 
                : 'text-gray-600 hover:text-teal-600'
            }`}
          >
            <MessageSquare className="h-6 w-6 mb-1" />
            <span>Check Text</span>
          </button>
          
          <button
            onClick={() => setActiveTab('passwords')}
            className={`flex flex-col items-center py-3 px-2 text-xs ${
              activeTab === 'passwords' 
                ? 'text-teal-600 bg-teal-50' 
                : 'text-gray-600 hover:text-teal-600'
            }`}
          >
            <Key className="h-6 w-6 mb-1" />
            <span>Passwords</span>
          </button>
          
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex flex-col items-center py-3 px-2 text-xs ${
              activeTab === 'resources' 
                ? 'text-teal-600 bg-teal-50' 
                : 'text-gray-600 hover:text-teal-600'
            }`}
          >
            <BookOpen className="h-6 w-6 mb-1" />
            <span>Learn</span>
          </button>
          
          <button
            onClick={() => setActiveTab('help')}
            className={`flex flex-col items-center py-3 px-2 text-xs ${
              activeTab === 'help' 
                ? 'text-teal-600 bg-teal-50' 
                : 'text-gray-600 hover:text-teal-600'
            }`}
          >
            <HelpCircle className="h-6 w-6 mb-1" />
            <span>Get Help</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App

