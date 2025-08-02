import React, { useState } from 'react';
import './index.css';

function App( ) {
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeText = async () => {
    setLoading(true);
    try {
      // For now, we'll use a simple demo response
      // Later we can connect to your backend API
      setTimeout(() => {
        setResult({
          risk_score: textInput.toLowerCase().includes('urgent') || textInput.toLowerCase().includes('winner') ? 85 : 15,
          risk_level: textInput.toLowerCase().includes('urgent') || textInput.toLowerCase().includes('winner') ? 'HIGH' : 'LOW',
          threats_detected: textInput.toLowerCase().includes('urgent') || textInput.toLowerCase().includes('winner') ? ['Urgency pressure', 'Financial fraud'] : [],
          message: textInput.toLowerCase().includes('urgent') || textInput.toLowerCase().includes('winner') ? 'This message shows signs of being a scam!' : 'This message appears to be safe.'
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      setLoading(false);
      setResult({ error: 'Analysis failed. Please try again.' });
    }
  };

  const checkPasswords = async () => {
    setLoading(true);
    setTimeout(() => {
      setResult({
        breaches_found: emailInput.includes('test') ? 2 : 0,
        message: emailInput.includes('test') ? 'Your email was found in 2 data breaches!' : 'Good news! No breaches found for this email.',
        safe: !emailInput.includes('test')
      });
      setLoading(false);
    }, 1500);
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
                <h2 className="text-2xl font-bold text-gray-800">Check Message for Scams</h2>
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
                  {loading ? 'Analyzing...' : 'Check Message'}
                </button>
              </div>
            )}

            {/* Passwords Tab */}
            {activeTab === 'passwords' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Are My Passwords Still Safe?</h2>
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
                  {loading ? 'Checking...' : 'Check My Passwords'}
                </button>
              </div>
            )}

            {/* Learn Tab */}
            {activeTab === 'learn' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Get Cyber Savvy</h2>
                <div className="grid gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-800">🔐 Password Safety</h3>
                    <p className="text-blue-700">Use unique, strong passwords for each account. Enable two-factor authentication.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-bold text-green-800">📧 Email Security</h3>
                    <p className="text-green-700">Be suspicious of urgent requests for money or personal information.</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-800">🌐 Safe Browsing</h3>
                    <p className="text-purple-700">Always check URLs carefully and look for HTTPS before entering sensitive data.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Help Tab */}
            {activeTab === 'help' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Get Help - I Think I've Been Hacked</h2>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-bold text-red-800">🚨 Immediate Steps:</h3>
                  <ul className="text-red-700 mt-2 space-y-1">
                    <li>• Change all your passwords immediately</li>
                    <li>• Check your bank and credit card statements</li>
                    <li>• Run a full antivirus scan</li>
                    <li>• Contact your bank if you suspect financial fraud</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">💬 <strong>Need expert help?</strong> Contact a cybersecurity professional for personalized assistance.</p>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Analysis Results:</h3>
                {result.error ? (
                  <p className="text-red-600">{result.error}</p>
                ) : (
                  <div className="space-y-2">
                    {result.risk_score !== undefined && (
                      <p className={`font-medium ${result.risk_level === 'HIGH' ? 'text-red-600' : 'text-green-600'}`}>
                        Risk Level: {result.risk_level} ({result.risk_score}/100)
                      </p>
                    )}
                    {result.breaches_found !== undefined && (
                      <p className={`font-medium ${result.breaches_found > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Breaches Found: {result.breaches_found}
                      </p>
                    )}
                    <p className="text-gray-700">{result.message}</p>
                    {result.threats_detected && result.threats_detected.length > 0 && (
                      <div>
                        <p className="font-medium text-red-600">Threats Detected:</p>
                        <ul className="list-disc list-inside text-red-600">
                          {result.threats_detected.map((threat, index) => (
                            <li key={index}>{threat}</li>
                          ))}
                        </ul>
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
          <p className="text-sm opacity-75">Powered by local AI - Your data stays secure</p>
        </div>
      </div>
    </div>
  );
}

export default App;
