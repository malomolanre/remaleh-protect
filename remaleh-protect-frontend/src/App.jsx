import React, { useState, useEffect } from 'react'
import './App.css'
import { apiPost, API_ENDPOINTS } from './lib/api'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [greeting, setGreeting] = useState('')
  
  // Breach checker state
  const [breachEmail, setBreachEmail] = useState('')
  const [breachResult, setBreachResult] = useState(null)
  const [isChecking, setIsChecking] = useState(false)
  const [breachError, setBreachError] = useState('')

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
    { 
      id: 'home', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'breach', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    { 
      id: 'scam', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    { 
      id: 'learn', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      id: 'community', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: 'chat', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ]

  // Breach checking function
  const handleBreachCheck = async () => {
    if (!breachEmail || !breachEmail.includes('@')) {
      setBreachError('Please enter a valid email address')
      return
    }
    
    setIsChecking(true)
    setBreachError('')
    setBreachResult(null)
    
    try {
      const response = await apiPost(API_ENDPOINTS.BREACH, { email: breachEmail })
      const data = await response.json()
      
      if (response.ok) {
        setBreachResult(data)
      } else {
        setBreachError(data.error || 'Failed to check for breaches')
      }
    } catch (error) {
      console.error('Breach check error:', error)
      setBreachError('Network error. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

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
              <h2 className="text-xl font-bold text-black mb-4">Latest Community Scam Reports</h2>
              
              {/* Horizontal Carousel Container */}
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {/* Sample scam reports - in real app, these would come from your backend */}
                  {[
                    {
                      id: 1,
                      type: "Phishing",
                      description: "Fake bank email asking for login details",
                      time: "2 hours ago",
                      severity: "high",
                      reporter: "Sarah M."
                    },
                    {
                      id: 2,
                      type: "Investment Scam",
                      description: "Promises of 500% returns in crypto trading",
                      time: "4 hours ago",
                      severity: "high",
                      reporter: "Mike R."
                    },
                    {
                      id: 3,
                      type: "Tech Support",
                      description: "Call claiming computer has virus",
                      time: "6 hours ago",
                      severity: "medium",
                      reporter: "Lisa K."
                    },
                    {
                      id: 4,
                      type: "Romance Scam",
                      description: "Online dating profile asking for money",
                      time: "8 hours ago",
                      severity: "medium",
                      reporter: "David L."
                    },
                    {
                      id: 5,
                      type: "Lottery Scam",
                      description: "Email claiming you won $1M prize",
                      time: "12 hours ago",
                      severity: "low",
                      reporter: "Emma T."
                    }
                  ].map((scam, index) => (
                    <div 
                      key={scam.id}
                      className="flex-shrink-0 w-80 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-4 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between h-full">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              scam.severity === 'high' ? 'bg-red-100 text-red-700' :
                              scam.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {scam.severity.toUpperCase()}
                            </span>
                            <span className="text-gray-500 text-xs">{scam.time}</span>
                          </div>
                          <h3 className="font-semibold text-gray-800 mb-1">{scam.type}</h3>
                          <p className="text-gray-600 text-sm mb-2">{scam.description}</p>
                          <p className="text-gray-500 text-xs">Reported by {scam.reporter}</p>
                        </div>
                        <div className="text-red-400 ml-3">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Scroll Indicator */}
                <div className="flex justify-center mt-4 space-x-2">
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <div 
                      key={index}
                      className="w-2 h-2 rounded-full bg-gray-300"
                    />
                  ))}
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button className="text-[#21a1ce] text-sm font-medium hover:underline">
                  View All Reports →
                </button>
              </div>
            </div>

            {/* Quick Action Icons */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#21a1ce] rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
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
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
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
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
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
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
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
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
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
            {/* Header Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#21a1ce] rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-black">Breach Checker</h1>
                  <p className="text-gray-600">Secure email verification</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">Check if your email has been compromised in data breaches and get personalized security recommendations.</p>
            </div>

            {/* Email Input Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-black mb-4">Check Your Email</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={breachEmail}
                      onChange={(e) => setBreachEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isChecking && breachEmail && breachEmail.includes('@')) {
                          handleBreachCheck()
                        }
                      }}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent transition-all duration-200"
                      disabled={isChecking}
                    />
                  </div>
                </div>
                
                {/* Error Display */}
                {breachError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-red-800 text-sm">{breachError}</span>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleBreachCheck}
                  disabled={isChecking || !breachEmail}
                  className="w-full bg-[#21a1ce] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#1a8bb8] transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChecking ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Check for Breaches
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Display */}
            {breachResult && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  {breachResult.breached ? (
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-black">
                      {breachResult.breached ? 'Breaches Found' : 'No Breaches Detected'}
                    </h2>
                    <p className="text-gray-600">
                      {breachResult.breached ? `${breachResult.breach_count} breach(es) found` : 'Your email is secure'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Checked: {breachEmail}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className={`text-lg ${breachResult.breached ? 'text-red-700' : 'text-green-700'}`}>
                    {breachResult.message}
                  </p>
                </div>

                {breachResult.breached && breachResult.breaches && breachResult.breaches.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800">Affected Services:</h3>
                    {breachResult.breaches.map((breach, index) => (
                      <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-red-800 mb-1">{breach.name}</h4>
                            <p className="text-red-700 text-sm mb-2">{breach.domain}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-red-600 text-xs">Breached: {breach.date}</span>
                              <span className="text-red-600 text-xs">•</span>
                              <span className="text-red-600 text-xs">{breach.data.join(', ')}</span>
                            </div>
                          </div>
                          <div className="text-red-400 ml-3">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {breachResult.demo_mode && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-blue-800 text-sm">Demo mode - Results are simulated for testing purposes</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      setBreachEmail('')
                      setBreachResult(null)
                      setBreachError('')
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Check Another Email
                  </button>
                </div>
              </div>
            )}

            {/* How It Works Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-black mb-4">How It Works</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#21a1ce] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#21a1ce] font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2">Enter Email</h3>
                  <p className="text-gray-600 text-sm">Provide your email address securely</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#21a1ce] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#21a1ce] font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2">Scan Database</h3>
                  <p className="text-gray-600 text-sm">We check against known breaches</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#21a1ce] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#21a1ce] font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2">Get Results</h3>
                  <p className="text-gray-600 text-sm">Instant results and recommendations</p>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-black mb-4">Security Features</h2>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 text-sm">Your data is never stored or shared</span>
                </div>
                
                <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-blue-800 text-sm">Real-time breach database updates</span>
                </div>
                
                <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-purple-800 text-sm">Instant results and notifications</span>
                </div>
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
      <header className="bg-[#21a1ce] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <img 
              src="/Remaleh-logo-full-2.jpg" 
              alt="Remaleh" 
              className="h-8 w-auto mx-auto"
            />
          </div>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[#21a1ce] font-semibold text-sm">LP</span>
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

