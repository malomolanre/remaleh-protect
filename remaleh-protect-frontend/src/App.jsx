import React, { useState } from 'react';
import './index.css';

const API_BASE_URL = 'https://remaleh-protect-api.onrender.com';

function App( ) {
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeText = async () => {
    if (!textInput.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/scam/comprehensive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textInput,
          check_links: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult({
        type: 'scam_analysis',
        ...data
      });
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({
        type: 'error',
        message: 'Unable to connect to analysis service. Please try again later.',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPasswords = async () => {
    if (!emailInput.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/breach/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult({
        type: 'breach_check',
        ...data
      });
    } catch (error) {
      console.error('Breach check error:', error);
      setResult({
        type: 'error',
        message: 'Unable to connect to breach checking service. Please try again later.',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { type: 'user', content: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    
    const currentInput = chatInput;
    setChatInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversation_history: chatMessages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        type: data.escalated ? 'expert' : 'ai',
        content: data.response,
        timestamp: new Date(),
        escalated: data.escalated,
        category: data.category,
        urgency: data.urgency
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'system',
        content: 'Unable to connect to chat service. Please try again later.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'LOW': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'VERY_LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">RP</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Remaleh Protect</h1>
              <p className="text-gray-600">Your Digital Safety Companion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'text' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'
              }`}
            >
              🛡️ Check Text
            </button>
            <button
              onClick={() => setActiveTab('passwords')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'passwords' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'
              }`}
            >
              🔐 Passwords
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'learn' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'
              }`}
            >
              📚 Learn
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'help' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'
              }`}
            >
              💬 Get Help
            </button>
          </div>

          <div className="p-6">
            {/* Text Checker Tab */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">AI-Powered Scam Detection</h2>
                <p className="text-gray-600">Paste any message, email, or text to check for scams using advanced local AI analysis.</p>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your message, email, or text here..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  onClick={analyzeText}
                  disabled={!textInput.trim() || loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Analyzing with AI...' : 'Analyze Message'}
                </button>
              </div>
            )}

            {/* Passwords Tab */}
            {activeTab === 'passwords' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Password Breach Monitor</h2>
                <p className="text-gray-600">Check if your email appears in known data breaches. Your email is never stored.</p>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  onClick={checkPasswords}
                  disabled={!emailInput.trim() || loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Checking Breaches...' : 'Check My Passwords'}
                </button>
              </div>
            )}

            {/* Learn Tab */}
            {activeTab === 'learn' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Get Cyber Savvy</h2>
                <div className="grid gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-800">🔐 Password Safety</h3>
                    <p className="text-blue-700">Use unique, strong passwords for each account. Enable two-factor authentication wherever possible.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-green-800">📧 Email Security</h3>
                    <p className="text-green-700">Be suspicious of urgent requests for money or personal information. Verify sender identity through other channels.</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-purple-800">🌐 Safe Browsing</h3>
                    <p className="text-purple-700">Always check URLs carefully and look for HTTPS before entering sensitive data. Avoid clicking suspicious links.</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-orange-800">⚠️ Current Threats</h3>
                    <p className="text-orange-700">Watch out for AI deepfakes, crypto scams, fake delivery notifications, and romance scams. Stay vigilant!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Help Tab */}
            {activeTab === 'help' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">AI Cybersecurity Assistant</h2>
                <p className="text-gray-600">Get instant help from our AI assistant. For urgent issues, you'll be connected to a human expert.</p>
                
                {/* Chat Messages */}
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>👋 Hi! I'm your AI cybersecurity assistant.</p>
                      <p>Ask me anything about digital security or report suspicious activity.</p>
                    </div>
                  ) : (
                    chatMessages.map((message, index) => (
                      <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-teal-500 text-white' 
                            : message.type === 'expert'
                            ? 'bg-blue-500 text-white'
                            : message.type === 'system'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}>
                          {message.type === 'expert' && (
                            <div className="text-xs opacity-75 mb-1">🟢 Human Expert</div>
                          )}
                          {message.type === 'ai' && (
                            <div className="text-xs opacity-75 mb-1">🤖 AI Assistant</div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          {message.escalated && (
                            <div className="text-xs mt-1 opacity-75">⚡ Escalated to human expert</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && sendChatMessage()}
                    placeholder="Describe your cybersecurity concern..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || loading}
                    className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className="mt-6">
                {result.type === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-bold text-red-800 mb-2">⚠️ Connection Error</h3>
                    <p className="text-red-700">{result.message}</p>
                    <p className="text-red-600 text-sm mt-2">Please check your internet connection and try again.</p>
                  </div>
                )}

                {result.type === 'scam_analysis' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${getRiskColor(result.overall_assessment?.risk_level)}`}>
                      <h3 className="font-bold text-lg mb-2">🛡️ Analysis Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">Risk Level: {result.overall_assessment?.risk_level || 'Unknown'}</p>
                          <p className="font-medium">Risk Score: {result.overall_assessment?.risk_score || 0}/100</p>
                        </div>
                        <div>
                          <p className="font-medium">Threats Detected: {result.threats_detected?.length || 0}</p>
                          <p className="text-sm">{result.overall_assessment?.message}</p>
                        </div>
                      </div>
                    </div>

                    {result.threats_detected && result.threats_detected.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-bold text-red-800 mb-2">🚨 Detected Threats:</h4>
                        <ul className="space-y-1">
                          {result.threats_detected.map((threat, index) => (
                            <li key={index} className="text-red-700 text-sm">• {threat}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.link_analysis && result.link_analysis.urls_found && result.link_analysis.urls_found.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-bold text-blue-800 mb-2">🔗 Link Analysis:</h4>
                        <p className="text-blue-700 text-sm mb-2">Found {result.link_analysis.urls_found.length} URL(s)</p>
                        <ul className="space-y-1">
                          {result.link_analysis.urls_found.map((url, index) => (
                            <li key={index} className="text-blue-600 text-sm break-all">• {url}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {result.type === 'breach_check' && (
                  <div className={`p-4 rounded-lg border ${result.breaches_found > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <h3 className="font-bold text-lg mb-2">
                      {result.breaches_found > 0 ? '🚨 Breaches Found' : '✅ No Breaches Found'}
                    </h3>
                    <p className={`font-medium ${result.breaches_found > 0 ? 'text-red-700' : 'text-green-700'}`}>
                      {result.message}
                    </p>
                    {result.breaches_found > 0 && (
                      <div className="mt-3 text-red-600 text-sm">
                        <p><strong>Recommendation:</strong> Change passwords for accounts associated with this email immediately.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white">
          <p className="text-sm opacity-75">🔒 Powered by local AI - Your data stays secure</p>
          <p className="text-xs opacity-60 mt-1">Connected to live Remaleh Protect API</p>
        </div>
      </div>
    </div>
  );
}

export default App;
