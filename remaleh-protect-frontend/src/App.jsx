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
    { id: 'home', icon: '🏠' },
    { id: 'breach', icon: '🔒' },
    { id: 'scam', icon: '🚨' },
    { id: 'learn', icon: '📚' },
    { id: 'community', icon: '👥' },
    { id: 'chat', icon: '💬' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-black mb-2">{greeting}</h1>
              <p className="text-gray-600">Welcome to Remaleh Protect</p>
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

            {/* Quick Action Icons */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#21a1ce] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl">🔒</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-1">Breach Check</h3>
                    <p className="text-gray-600 text-sm">Check if your email has been compromised in data breaches</p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#21a1ce] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl">🚨</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-1">Scam Analysis</h3>
                    <p className="text-gray-600 text-sm">Analyze suspicious messages and links for potential scams</p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#21a1ce] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl">📚</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-1">Learn Hub</h3>
                    <p className="text-gray-600 text-sm">Educational content to improve your digital security</p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#21a1ce] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl">👥</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-1">Community</h3>
                    <p className="text-gray-600 text-sm">Report scams and stay updated on latest threats</p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#21a1ce] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl">💬</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-1">Chat</h3>
                    <p className="text-gray-600 text-sm">Get instant help and answers to security questions</p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
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
          <div className="flex-1 text-center">
            <img 
              src="/Remaleh-logo-full-2.jpg" 
              alt="Remaleh" 
              className="h-16 mx-auto mb-3"
            />
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-[#21a1ce] bg-[#21a1ce] bg-opacity-15 shadow-lg scale-110'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App

