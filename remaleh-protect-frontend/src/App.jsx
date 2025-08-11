import React, { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('breach')

  const tabs = [
    { id: 'breach', label: 'Breach Check', icon: '🔒' },
    { id: 'scam', label: 'Scam Analysis', icon: '🚨' },
    { id: 'chat', label: 'AI Assistant', icon: '🤖' },
    { id: 'learn', label: 'Learn Hub', icon: '📚' },
    { id: 'community', label: 'Community', icon: '👥' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'breach':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🔒 Breach Checker</h1>
            <p className="text-gray-600 mb-6">Check if your email has been compromised in data breaches.</p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
                <ul className="text-blue-700 space-y-1">
                  <li>• Enter your email address</li>
                  <li>• We check against known data breaches</li>
                  <li>• Get instant results and recommendations</li>
                </ul>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Start Breach Check
              </button>
            </div>
          </div>
        )
      case 'scam':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🚨 Scam Analysis</h1>
            <p className="text-gray-600 mb-6">Analyze suspicious messages, links, and emails for potential scams.</p>
            
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">What we detect:</h3>
                <ul className="text-red-700 space-y-1">
                  <li>• Phishing attempts</li>
                  <li>• Suspicious links</li>
                  <li>• Fraudulent messages</li>
                </ul>
              </div>
              
              <button className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors">
                Analyze for Scams
              </button>
            </div>
          </div>
        )
      case 'chat':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🤖 AI Assistant</h1>
            <p className="text-gray-600 mb-6">Get instant help and answers to your security questions.</p>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Ask about:</h3>
                <ul className="text-green-700 space-y-1">
                  <li>• Password security</li>
                  <li>• Two-factor authentication</li>
                  <li>• Privacy protection</li>
                </ul>
              </div>
              
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Chat with AI
              </button>
            </div>
          </div>
        )
      case 'learn':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">📚 Learn Hub</h1>
            <p className="text-gray-600 mb-6">Educational content to improve your digital security knowledge.</p>
            
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">Topics covered:</h3>
                <ul className="text-purple-700 space-y-1">
                  <li>• Password best practices</li>
                  <li>• Social engineering</li>
                  <li>• Safe browsing habits</li>
                </ul>
              </div>
              
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Start Learning
              </button>
            </div>
          </div>
        )
      case 'community':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">👥 Community Hub</h1>
            <p className="text-gray-600 mb-6">Report scams and stay updated on the latest threats.</p>
            
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">Community features:</h3>
                <ul className="text-orange-700 space-y-1">
                  <li>• Report suspicious activity</li>
                  <li>• View latest scams</li>
                  <li>• Top reporter leaderboard</li>
                </ul>
              </div>
              
              <button className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                Join Community
              </button>
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Remaleh Protect</h1>
            <p className="text-gray-600">Your digital security companion</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Remaleh Protect</h1>
            </div>
            <div className="text-sm text-gray-500">
              Security Companion
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 Remaleh Protect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

