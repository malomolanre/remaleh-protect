import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [greeting, setGreeting] = useState('')

  // Dynamic greeting based on time of day
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) return 'Good morning!'
      if (hour < 17) return 'Good afternoon!'
      return 'Good evening!'
    }
    setGreeting(getGreeting())
  }, [])

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'breach', label: 'Breach', icon: '🔒' },
    { id: 'scam', label: 'Scam', icon: '🚨' },
    { id: 'learn', label: 'Learn', icon: '📚' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'chat', label: 'Chat', icon: '💬' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-black mb-2">{greeting}</h1>
              <p className="text-gray-700">Welcome to Remaleh Protect</p>
            </div>

            {/* Quick Action Icons */}
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#21a1ce] rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="text-white text-2xl">🔒</span>
                </div>
                <p className="text-xs text-black font-medium">Breach Check</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#21a1ce] rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="text-white text-2xl">🚨</span>
                </div>
                <p className="text-xs text-black font-medium">Scam Analysis</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#21a1ce] rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="text-white text-2xl">🤖</span>
                </div>
                <p className="text-xs text-black font-medium">AI Assistant</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#21a1ce] rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="text-white text-2xl">📚</span>
                </div>
                <p className="text-xs text-black font-medium">Learn Hub</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#21a1ce] rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="text-white text-2xl">👥</span>
                </div>
                <p className="text-xs text-black font-medium">Community</p>
              </div>
            </div>

            {/* For You Today Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-black mb-4">For You Today</h2>
              <div className="text-center">
                <div className="w-24 h-24 bg-[#21a1ce] bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <p className="text-black font-medium">You are up to date!</p>
                <p className="text-gray-600 text-sm mt-1">No security threats detected</p>
              </div>
            </div>
          </div>
        )
      case 'breach':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-black mb-4">🔒 Breach Checker</h1>
              <p className="text-gray-700 mb-6">Check if your email has been compromised in data breaches.</p>
              
              <div className="space-y-4">
                <div className="bg-[#21a1ce] bg-opacity-10 p-4 rounded-xl border border-[#21a1ce] border-opacity-20">
                  <h3 className="font-semibold text-black mb-2">How it works:</h3>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Enter your email address</li>
                    <li>• We check against known data breaches</li>
                    <li>• Get instant results and recommendations</li>
                  </ul>
                </div>
                
                <button className="w-full bg-[#21a1ce] text-white py-4 px-6 rounded-xl font-medium hover:bg-[#1a8bb8] transition-colors shadow-sm">
                  Start Breach Check
                </button>
              </div>
            </div>
          </div>
        )
      case 'scam':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-black mb-4">🚨 Scam Analysis</h1>
              <p className="text-gray-700 mb-6">Analyze suspicious messages, links, and emails for potential scams.</p>
              
              <div className="space-y-4">
                <div className="bg-[#21a1ce] bg-opacity-10 p-4 rounded-xl border border-[#21a1ce] border-opacity-20">
                  <h3 className="font-semibold text-black mb-2">What we detect:</h3>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Phishing attempts</li>
                    <li>• Suspicious links</li>
                    <li>• Fraudulent messages</li>
                  </ul>
                </div>
                
                <button className="w-full bg-[#21a1ce] text-white py-4 px-6 rounded-xl font-medium hover:bg-[#1a8bb8] transition-colors shadow-sm">
                  Analyze for Scams
                </button>
              </div>
            </div>
          </div>
        )
      case 'chat':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-black mb-4">💬 Chat</h1>
              <p className="text-gray-700 mb-6">Get instant help and answers to your security questions.</p>
              
              <div className="space-y-4">
                <div className="bg-[#21a1ce] bg-opacity-10 p-4 rounded-xl border border-[#21a1ce] border-opacity-20">
                  <h3 className="font-semibold text-black mb-2">Ask about:</h3>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Password security</li>
                    <li>• Two-factor authentication</li>
                    <li>• Privacy protection</li>
                  </ul>
                </div>
                
                <button className="w-full bg-[#21a1ce] text-white py-4 px-6 rounded-xl font-medium hover:bg-[#1a8bb8] transition-colors shadow-sm">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        )
      case 'learn':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-black mb-4">📚 Learn Hub</h1>
              <p className="text-gray-700 mb-6">Educational content to improve your digital security knowledge.</p>
              
              <div className="space-y-4">
                <div className="bg-[#21a1ce] bg-opacity-10 p-4 rounded-xl border border-[#21a1ce] border-opacity-20">
                  <h3 className="font-semibold text-black mb-2">Topics covered:</h3>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Password best practices</li>
                    <li>• Social engineering</li>
                    <li>• Safe browsing habits</li>
                  </ul>
                </div>
                
                <button className="w-full bg-[#21a1ce] text-white py-4 px-6 rounded-xl font-medium hover:bg-[#1a8bb8] transition-colors shadow-sm">
                  Start Learning
                </button>
              </div>
            </div>
          </div>
        )
      case 'community':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-black mb-4">👥 Community Hub</h1>
              <p className="text-gray-700 mb-6">Report scams and stay updated on the latest threats.</p>
              
              <div className="space-y-4">
                <div className="bg-[#21a1ce] bg-opacity-10 p-4 rounded-xl border border-[#21a1ce] border-opacity-20">
                  <h3 className="font-semibold text-black mb-2">Community features:</h3>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Report suspicious activity</li>
                    <li>• View latest scams</li>
                    <li>• Top reporter leaderboard</li>
                  </ul>
                </div>
                
                <button className="w-full bg-[#21a1ce] text-white py-4 px-6 rounded-xl font-medium hover:bg-[#1a8bb8] transition-colors shadow-sm">
                  Join Community
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-black mb-4">Welcome to Remaleh Protect</h1>
            <p className="text-gray-700">Your digital security companion</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Profile Icon */}
      <header className="bg-[#21a1ce] text-white px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/remaleh-logo.png" 
              alt="Remaleh" 
              className="w-10 h-10 mr-3"
            />
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold">Remaleh Protect</h1>
            <p className="text-white text-base opacity-90">Your Security Companion</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#21a1ce] font-semibold text-lg">LP</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-[#21a1ce] bg-[#21a1ce] bg-opacity-10'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              <span className="text-xs font-medium leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App

