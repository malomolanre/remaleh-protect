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
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Breach Checker</h1>
            <p>This is a test version to identify the issue.</p>
            <button 
              onClick={() => alert('Button clicked!')}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
            >
              Test Button
            </button>
          </div>
        )
      case 'scam':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Scam Analysis</h1>
            <p>This is a test version to identify the issue.</p>
          </div>
        )
      case 'chat':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
            <p>This is a test version to identify the issue.</p>
          </div>
        )
      case 'learn':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Learn Hub</h1>
            <p>This is a test version to identify the issue.</p>
          </div>
        )
      case 'community':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Community Hub</h1>
            <p>This is a test version to identify the issue.</p>
          </div>
        )
      default:
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Welcome</h1>
            <p>This is a test version to identify the issue.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Remaleh Protect</h1>
            </div>
            <div className="text-sm text-gray-500">
              Test Version
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
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
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 Remaleh Protect. Test Version</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

