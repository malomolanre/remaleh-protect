import React, { useState, useEffect } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import BreachChecker from './components/BreachChecker'
import ScamAnalysis from './components/ScamAnalysis'
import ChatAssistant from './components/ChatAssistant'
import LearnHub from './components/LearnHub'
import CommunityHub from './components/CommunityHub'
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

  // Debug logging for user status
  useEffect(() => {
    if (user) {
      console.log('=== APP COMPONENT DEBUG ===');
      console.log('User object:', user);
      console.log('User is_admin:', user.is_admin);
      console.log('User role:', user.role);
      console.log('Is authenticated:', isAuthenticated);
      console.log('==========================');
    }
  }, [user, isAuthenticated]);

  const tabs = [
    { id: 'breach', label: 'Breach Check', icon: '🔒' },
    { id: 'scam', label: 'Scam Analysis', icon: '🚨' },
    { id: 'chat', label: 'AI Assistant', icon: '🤖' },
    { id: 'learn', label: 'Learn Hub', icon: '📚' },
    { id: 'community', label: 'Community', icon: '👥' },
    ...(user?.is_admin ? [{ id: 'admin', label: 'Admin', icon: '⚙️' }] : [])
  ]

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'breach':
          return <BreachChecker setActiveTab={setActiveTab} />
        case 'scam':
          return <ScamAnalysis setActiveTab={setActiveTab} />
        case 'chat':
          return <ChatAssistant setActiveTab={setActiveTab} />
        case 'learn':
          return <LearnHub setActiveTab={setActiveTab} />
        case 'community':
          // Check if user is authenticated for community access
          if (!isAuthenticated) {
            return (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="text-yellow-800 text-lg font-semibold mb-2">
                      🔒 Login Required
                    </div>
                    <p className="text-yellow-700 mb-4">
                      You need to be logged in to access the Community Hub.
                    </p>
                    <button
                      onClick={() => setActiveTab('login')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Login to Continue
                    </button>
                  </div>
                </div>
              </div>
            )
          }
          return <CommunityHub setActiveTab={setActiveTab} />
        case 'admin':
          // Check if user is admin
          if (!user?.is_admin) {
            return (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="text-red-800 text-lg font-semibold mb-2">
                      🚫 Access Denied
                    </div>
                    <p className="text-red-700 mb-4">
                      You need admin privileges to access this section.
                    </p>
                    <button
                      onClick={() => setActiveTab('breach')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Go to Breach Check
                    </button>
                  </div>
                </div>
              </div>
            )
          }
          return <AdminPanel />
        case 'login':
          return <Login onLoginSuccess={() => {
            // After successful login, redirect to appropriate tab based on user role
            if (user?.is_admin) {
              setActiveTab('admin');
            } else {
              setActiveTab('breach'); // Default to breach checker for regular users
            }
          }} onSwitchToRegister={() => setActiveTab('register')} />
        case 'register':
          return <Register onRegisterSuccess={() => {
            // After successful registration, redirect to login tab
            setActiveTab('login');
          }} />
        default:
          return <BreachChecker setActiveTab={setActiveTab} />
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-red-800 text-lg font-semibold mb-2">
                🚫 Component Error
              </div>
              <p className="text-red-700 mb-4">
                Error loading component: {error.message}
              </p>
              <button
                onClick={() => setActiveTab('breach')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Breach Check
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <MobileHeader setActiveTab={setActiveTab} />
        
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
                      Welcome, {user?.is_admin ? 'Admin' : user?.first_name || 'User'}
                      {user?.is_admin && <span className="ml-2 text-blue-600 font-semibold">(Admin)</span>}
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
            case 'report-scam':
              if (isAuthenticated) {
                setActiveTab('community');
              } else {
                setActiveTab('login');
              }
              break;
            case 'ask-ai':
              setActiveTab('chat');
              break;
            case 'breach-check':
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

