import React, { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'breach', label: 'Breach', icon: '🔒' },
    { id: 'scam', label: 'Scam', icon: '🚨' },
    { id: 'chat', label: 'AI Chat', icon: '🤖' },
    { id: 'learn', label: 'Learn', icon: '📚' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Good afternoon!</h1>
              <p className="text-gray-600">Welcome to Remaleh Protect</p>
            </div>

            {/* Quick Action Icons */}
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-2xl">🔒</span>
                </div>
                <p className="text-xs text-gray-700">Breach Check</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-2xl">🚨</span>
                </div>
                <p className="text-xs text-gray-700">Scam Analysis</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-2xl">🤖</span>
                </div>
                <p className="text-xs text-gray-700">AI Assistant</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-2xl">📚</span>
                </div>
                <p className="text-xs text-gray-700">Learn Hub</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-2xl">👥</span>
                </div>
                <p className="text-xs text-gray-700">Community</p>
              </div>
            </div>

            {/* For You Today Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">For You Today</h2>
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <p className="text-gray-600">You are up to date!</p>
                <p className="text-sm text-gray-500 mt-1">No security threats detected</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600 text-lg">🛡️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Protected</p>
                    <p className="text-lg font-semibold text-gray-900">24/7</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-lg">📊</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Scans</p>
                    <p className="text-lg font-semibold text-gray-900">0</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-4">🔒 Breach Checker</h1>
              <p className="text-gray-600 mb-6">Check if your email has been compromised in data breaches.</p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Enter your email address</li>
                    <li>• We check against known data breaches</li>
                    <li>• Get instant results and recommendations</li>
                  </ul>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-4">🚨 Scam Analysis</h1>
              <p className="text-gray-600 mb-6">Analyze suspicious messages, links, and emails for potential scams.</p>
              
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">What we detect:</h3>
                  <ul className="text-red-700 space-y-1">
                    <li>• Phishing attempts</li>
                    <li>• Suspicious links</li>
                    <li>• Fraudulent messages</li>
                  </ul>
                </div>
                
                <button className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-red-700 transition-colors">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-4">🤖 AI Assistant</h1>
              <p className="text-gray-600 mb-6">Get instant help and answers to your security questions.</p>
              
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Ask about:</h3>
                  <ul className="text-green-700 space-y-1">
                    <li>• Password security</li>
                    <li>• Two-factor authentication</li>
                    <li>• Privacy protection</li>
                  </ul>
                </div>
                
                <button className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-green-700 transition-colors">
                  Chat with AI
                </button>
              </div>
            </div>
          </div>
        )
      case 'learn':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">📚 Learn Hub</h1>
              <p className="text-gray-600 mb-6">Educational content to improve your digital security knowledge.</p>
              
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">Topics covered:</h3>
                  <ul className="text-purple-700 space-y-1">
                    <li>• Password best practices</li>
                    <li>• Social engineering</li>
                    <li>• Safe browsing habits</li>
                  </ul>
                </div>
                
                <button className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-purple-700 transition-colors">
                  Start Learning
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Remaleh Protect</h1>
            <p className="text-gray-600">Your digital security companion</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Profile Icon */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Remaleh Protect</h1>
            <p className="text-blue-100 text-sm">Your Security Companion</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">LP</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App

