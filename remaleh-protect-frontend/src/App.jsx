import React, { useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import BreachChecker from './components/BreachChecker'
import ScamAnalysis from './components/ScamAnalysis'
import ChatAssistant from './components/ChatAssistant'
import LearnHub from './components/LearnHub'
import ThreatDashboard from './components/ThreatDashboard'
import RiskProfile from './components/RiskProfile'
import CommunityReporting from './components/CommunityReporting'
import AdminPanel from './components/AdminPanel'
import Login from './components/Login'
import Register from './components/Register'
import MobileHeader from './components/MobileHeader'
import MobileNavigation from './components/MobileNavigation'
import FloatingActionButton from './components/FloatingActionButton'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('breach')
  const { user, isAuthenticated } = useAuth()

  const tabs = [
    { id: 'breach', label: 'Breach Checker', icon: '🔒' },
    { id: 'scam', label: 'Scam Analysis', icon: '🚨' },
    { id: 'threats', label: 'Threat Intel', icon: '📊' },
    { id: 'profile', label: 'Risk Profile', icon: '👤' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'chat', label: 'AI Assistant', icon: '🤖' },
    { id: 'learn', label: 'Learn Hub', icon: '📚' },
    ...(user?.is_admin ? [{ id: 'admin', label: 'Admin', icon: '⚙️' }] : [])
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'breach':
        return <BreachChecker />
      case 'scam':
        return <ScamAnalysis />
      case 'threats':
        return <ThreatDashboard />
      case 'profile':
        return <RiskProfile />
      case 'community':
        return <CommunityReporting />
      case 'chat':
        return <ChatAssistant />
      case 'learn':
        return <LearnHub />
      case 'admin':
        return <AdminPanel />
      case 'login':
        return <Login />
      case 'register':
        return <Register />
      default:
        return <BreachChecker />
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <MobileHeader />
        
        {/* Desktop Header */}
        <header className="bg-white shadow-sm border-b hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <img 
                  src="/remaleh-logo.png" 
                  alt="Remaleh Protect" 
                  className="h-8 w-auto mr-3"
                />
                <h1 className="text-xl font-bold text-gray-900">Remaleh Protect</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Your Digital Security Companion
                </div>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700">
                      Welcome, {user?.first_name || 'User'}
                    </span>
                    <button
                      onClick={() => {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('refreshToken');
                        window.location.reload();
                      }}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setActiveTab('login')}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setActiveTab('register')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs - Desktop Only */}
        <nav className="bg-white border-b hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#21a1ce] text-[#21a1ce]'
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
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-24 md:pb-6">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              <p>&copy; 2024 Remaleh Protect. All rights reserved.</p>
              <p className="mt-1">
                Built with ❤️ for digital security and privacy
              </p>
            </div>
          </div>
        </footer>

        {/* Mobile Navigation */}
        <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
        
        {/* Floating Action Button */}
        <FloatingActionButton onAction={(action) => {
          switch (action) {
            case 'report-threat':
              setActiveTab('community');
              break;
            case 'ask-ai':
              setActiveTab('chat');
              break;
            case 'quick-scan':
              setActiveTab('breach');
              break;
            default:
              break;
          }
        }} />
      </div>
    </ErrorBoundary>
  )
}

export default App

