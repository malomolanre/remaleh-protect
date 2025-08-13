import React, { useState, useEffect } from 'react'
import './App.css'
import { apiPost, API_ENDPOINTS, API } from './lib/api'
import PasswordGenerator from './components/PasswordGenerator'
import ChatAssistant from './components/ChatAssistant'
import LearnHub from './components/LearnHub'
import ContentAdmin from './components/ContentAdmin'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [greeting, setGreeting] = useState('')
  
  // Breach checker state
  const [breachEmail, setBreachEmail] = useState('')
  const [breachResult, setBreachResult] = useState(null)
  const [isChecking, setIsChecking] = useState(false)
  const [breachError, setBreachError] = useState('')
  
  // Password generator modal state
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false)

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
      ),
      label: 'Learning Hub'
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
    },
    { 
      id: 'admin', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Admin'
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

  // Handle password generation modal
  const handlePasswordUse = (password) => {
    // You could store the generated password or show it in the breach results
    console.log('Generated password:', password)
    setShowPasswordGenerator(false)
  }

  // Scam analysis state
  const [scamInput, setScamInput] = useState('')
  const [scamType, setScamType] = useState('message')
  const [scamResult, setScamResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scamError, setScamError] = useState('')

  // Scam analysis function
  const handleScamAnalysis = async () => {
    if (!scamInput.trim()) {
      setScamError('Please enter content to analyze')
      return
    }
    
    setIsAnalyzing(true)
    setScamError('')
    setScamResult(null)
    
    try {
      let analysis
      let detectedContentType = scamType
      let contentTypeNote = ''
      
      // Intelligent content detection and routing
      if (scamType === 'link') {
        // Check if user actually pasted a URL or a message
        const urlPattern = /^https?:\/\/[^\s]+$/i
        const containsUrls = /https?:\/\/[^\s]+/gi.test(scamInput)
        
        if (urlPattern.test(scamInput.trim())) {
          // Single URL - use link analysis
          analysis = await analyzeLink(scamInput)
          contentTypeNote = 'Analyzed as single URL'
        } else if (containsUrls) {
          // Message containing URLs - use enhanced scam analysis for better detection
          analysis = await analyzeMessage(scamInput)
          detectedContentType = 'message'
          contentTypeNote = 'Detected message with URLs - used Enhanced Scam Detection Engine'
        } else {
          // No URLs found - use enhanced scam analysis
          analysis = await analyzeMessage(scamInput)
          detectedContentType = 'message'
          contentTypeNote = 'No URLs detected - analyzed with Enhanced Scam Detection Engine'
        }
      } else if (scamType === 'email') {
        // Check if content looks like an email
        const emailPattern = /^[^\s]+@[^\s]+\.[^\s]+/i
        const containsEmailHeaders = /^(from|to|subject|date):/im.test(scamInput)
        
        if (emailPattern.test(scamInput.split('\n')[0]) || containsEmailHeaders) {
          // Looks like email - use enhanced scam API
          analysis = await analyzeEmail(scamInput)
          contentTypeNote = 'Analyzed as email content'
        } else {
          // Doesn't look like email - use enhanced scam analysis
          analysis = await analyzeMessage(scamInput)
          detectedContentType = 'message'
          contentTypeNote = 'Content doesn\'t appear to be email - used Enhanced Scam Detection Engine'
        }
      } else {
        // General message analysis - use enhanced scam detection
        analysis = await analyzeMessage(scamInput)
        contentTypeNote = 'Analyzed with Enhanced Scam Detection Engine'
      }
      
      // Add content type detection note to results
      if (contentTypeNote) {
        analysis.contentTypeNote = contentTypeNote
        analysis.detectedContentType = detectedContentType
      }
      
      setScamResult(analysis)
    } catch (error) {
      console.error('Scam analysis error:', error)
      if (error.message.includes('Failed to fetch')) {
        setScamError('Unable to connect to security APIs. Please check your internet connection and try again.')
      } else if (error.message.includes('HTTP error')) {
        setScamError('Security API temporarily unavailable. Please try again later.')
      } else {
        setScamError('Analysis failed. Please try again.')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Link analysis using link_analysis.py
  const analyzeLink = async (url) => {
    try {
      const response = await fetch(`${API}/api/link/analyze-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Link analysis failed')
      }
      
      const result = data.result
      
      // Transform link analysis response to match our format
      return {
        riskLevel: result.risk_level?.toLowerCase() || 'medium',
        riskScore: result.risk_score || 50,
        indicators: result.indicators || [],
        recommendations: result.recommendations || [
          'Be cautious of this link',
          'Verify the destination before clicking',
          'Check for HTTPS and legitimate domain'
        ],
        analysis: url.substring(0, 100) + (url.length > 100 ? '...' : ''),
        linkDetails: result
      }
    } catch (error) {
      console.error('Link analysis error:', error)
      // Fallback to local analysis
      return analyzeScamContent(url, 'link')
    }
  }

  // Email analysis using enhanced_scam.py
  const analyzeEmail = async (emailContent) => {
    try {
      const response = await fetch(`${API}/api/enhanced-scam/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: emailContent })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Email analysis failed')
      }
      
      const result = data.result
      
      // Transform enhanced scam response to match our format
      return {
        riskLevel: result.risk_level?.toLowerCase() || 'medium',
        riskScore: Math.round(result.risk_score * 100) || 50,
        indicators: result.indicators || [],
        recommendations: generateEmailRecommendations(result.risk_level, result.indicators),
        analysis: emailContent.substring(0, 100) + (emailContent.length > 100 ? '...' : ''),
        emailDetails: result
      }
    } catch (error) {
      console.error('Email analysis error:', error)
      // Fallback to local analysis
      return analyzeScamContent(emailContent, 'email')
    }
  }

  // Generate email-specific recommendations
  const generateEmailRecommendations = (riskLevel, indicators) => {
    const recommendations = []
    
    if (riskLevel === 'SCAM') {
      recommendations.push('Do not respond to this email')
      recommendations.push('Delete immediately and contact Remaleh Guardians')
      recommendations.push('Do not click any links or attachments')
      recommendations.push('If you clicked any links, reach out to Remaleh Guardians via chat immediately')
    } else if (riskLevel === 'SUSPICIOUS') {
      recommendations.push('Exercise extreme caution with this email')
      recommendations.push('Verify sender authenticity before responding')
      recommendations.push('Do not share personal information')
      recommendations.push('Contact Remaleh Guardians if you need assistance')
    } else {
      recommendations.push('Review this email carefully')
      recommendations.push('Check sender authenticity')
      recommendations.push('Avoid clicking suspicious links')
    }
    
    // Add specific recommendations based on indicators
    if (indicators.some(ind => ind.includes('financial'))) {
      recommendations.push('Never send money or financial information via email')
      recommendations.push('Contact Remaleh Guardians if you have financial concerns')
    }
    if (indicators.some(ind => ind.includes('urgency'))) {
      recommendations.push('Be cautious of urgent requests - legitimate organizations rarely pressure you')
    }
    
    return recommendations
  }

  // Message analysis using enhanced_scam.py for better detection
  const analyzeMessage = async (messageContent) => {
    try {
      const response = await fetch(`${API}/api/enhanced-scam/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: messageContent
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Enhanced scam analysis failed')
      }
      
      const result = data.result
      
      // Transform enhanced scam response to match our format
      return {
        riskLevel: result.risk_level?.toLowerCase() || 'medium',
        riskScore: Math.round(result.risk_score * 100) || 50,
        indicators: result.indicators || [],
        recommendations: generateEnhancedRecommendations(result.risk_level, result.indicators, result.patterns),
        analysis: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : ''),
        messageDetails: result
      }
    } catch (error) {
      console.error('Enhanced message analysis error:', error)
      // Fallback to local analysis
      return analyzeScamContent(messageContent, 'message')
    }
  }

  // Generate enhanced recommendations based on enhanced scam detection
  const generateEnhancedRecommendations = (riskLevel, indicators, patterns) => {
    const recommendations = []
    
    if (riskLevel === 'SCAM') {
      recommendations.push('Do not respond to this message')
      recommendations.push('Delete immediately and contact Remaleh Guardians')
      recommendations.push('Do not click any links or attachments')
      recommendations.push('If you clicked any links, reach out to Remaleh Guardians via chat immediately')
    } else if (riskLevel === 'SUSPICIOUS') {
      recommendations.push('Exercise extreme caution with this message')
      recommendations.push('Verify authenticity before responding')
      recommendations.push('Do not share personal information')
      recommendations.push('Contact Remaleh Guardians if you need assistance')
    } else if (riskLevel === 'SAFE') {
      recommendations.push('Content appears safe - no obvious threats detected')
      recommendations.push('Continue to exercise normal caution')
      recommendations.push('If you have concerns, contact Remaleh Guardians via chat')
    } else {
      recommendations.push('Review this message carefully')
      recommendations.push('Check sender authenticity')
      recommendations.push('Avoid clicking suspicious links')
    }
    
    // Add specific recommendations based on patterns
    if (patterns && patterns.includes('suspicious_domain')) {
      recommendations.push('Contains suspicious domain (.buzz, .tk, etc.) - high risk')
    }
    if (patterns && patterns.includes('url')) {
      recommendations.push('Contains URLs - verify before clicking')
    }
    if (patterns && patterns.includes('phone_number')) {
      recommendations.push('Contains phone numbers - do not call unknown numbers')
    }
    
    // Add Remaleh Guardians contact info only once
    if (!recommendations.some(rec => rec.includes('Remaleh Guardians'))) {
      recommendations.push('Contact Remaleh Guardians via chat for immediate assistance')
    }
    
    // Remove any duplicate recommendations
    const uniqueRecommendations = [...new Set(recommendations)]
    
    return uniqueRecommendations
  }

  // Generate recommendations from detected threats
  const generateRecommendationsFromThreats = (threats) => {
    const recommendations = []
    
    threats.forEach(threat => {
      if (threat.includes('Urgency')) {
        recommendations.push('Be cautious of urgent requests - legitimate organizations rarely pressure you')
      }
      if (threat.includes('Financial')) {
        recommendations.push('Never send money to unknown sources or for urgent requests')
      }
      if (threat.includes('Personal')) {
        recommendations.push('Never share passwords, SSN, or other sensitive information via message')
      }
      if (threat.includes('Suspicious')) {
        recommendations.push('Avoid clicking suspicious links or responding to unknown contacts')
      }
    })
    
    if (recommendations.length === 0) {
      recommendations.push('Review the content carefully before taking any action')
    }
    
    // Add Remaleh Guardians contact info only once
    if (!recommendations.some(rec => rec.includes('Remaleh Guardians'))) {
      recommendations.push('Contact Remaleh Guardians via chat for immediate assistance')
    }
    
    // Remove any duplicate recommendations
    const uniqueRecommendations = [...new Set(recommendations)]
    
    return uniqueRecommendations
  }

  // Scam content analysis logic
  const analyzeScamContent = (content, type) => {
    const indicators = {
      urgency: /(urgent|immediate|now|quick|fast|hurry|deadline|limited time|expires|last chance)/gi,
      money: /(\$[\d,]+|money|payment|bank|account|credit card|paypal|bitcoin|crypto|investment|profit|return)/gi,
      personal: /(password|login|verify|confirm|update|social security|ssn|birthday|address|phone)/gi,
      threats: /(suspended|blocked|locked|deleted|expired|legal action|police|fbi|irs|tax)/gi,
      suspicious: /(click here|verify now|login|password|bank|urgent|free|winner|prize|lottery)/gi
    }
    
    const results = {}
    let riskScore = 0
    
    Object.entries(indicators).forEach(([key, pattern]) => {
      const matches = content.match(pattern)
      if (matches) {
        results[key] = matches.length
        riskScore += matches.length * 2
      }
    })
    
    // Additional analysis based on type
    if (type === 'link') {
      if (content.includes('bit.ly') || content.includes('tinyurl')) riskScore += 5
      if (content.includes('http://') && !content.includes('https://')) riskScore += 3
    }
    
    if (type === 'email') {
      if (content.includes('@') && !content.includes('@gmail.com') && !content.includes('@yahoo.com')) riskScore += 2
    }
    
    const riskLevel = riskScore < 10 ? 'safe' : riskScore < 20 ? 'suspicious' : 'scam'
    
    return {
      riskLevel,
      riskScore,
      indicators: results,
      recommendations: generateRecommendations(riskLevel, results, type),
      analysis: content.substring(0, 100) + (content.length > 100 ? '...' : '')
    }
  }

  const generateRecommendations = (riskLevel, indicators, type) => {
    const recommendations = []
    
    if (riskLevel === 'scam') {
      recommendations.push('Do not click any links or provide personal information')
      recommendations.push('Contact Remaleh Guardians immediately')
      recommendations.push('Delete the message immediately')
      recommendations.push('If you clicked any links, reach out to Remaleh Guardians via chat')
    }
    
    if (indicators.urgency) {
      recommendations.push('Be cautious of urgent requests - legitimate organizations rarely pressure you')
    }
    
    if (indicators.money) {
      recommendations.push('Never send money to unknown sources or for urgent requests')
    }
    
    if (indicators.personal) {
      recommendations.push('Never share passwords, SSN, or other sensitive information via message')
    }
    
    if (type === 'link') {
      recommendations.push('Hover over links to verify the actual destination')
      recommendations.push('Use link scanning tools before clicking')
    }
    
    // Add Remaleh Guardians contact info only once
    if (!recommendations.some(rec => rec.includes('Remaleh Guardians'))) {
      recommendations.push('Contact Remaleh Guardians via chat for immediate assistance')
    }
    
    // Remove any duplicate recommendations
    const uniqueRecommendations = [...new Set(recommendations)]
    
    return uniqueRecommendations
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

                {/* Security Recommendations */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-black mb-4">Security Recommendations</h3>
                  
                  <div className="space-y-4">
                    {/* MFA Recommendation */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-800 mb-1">Enable Multi-Factor Authentication (MFA)</h4>
                          <p className="text-blue-700 text-sm mb-3">Add an extra layer of security to your accounts with MFA apps like Google Authenticator, Authy, or Microsoft Authenticator.</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Google Authenticator</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Authy</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Microsoft Authenticator</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Password Security */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-800 mb-1">Use Strong, Unique Passwords</h4>
                          <p className="text-green-700 text-sm mb-3">Generate secure passwords for each account to prevent credential stuffing attacks.</p>
                          <button 
                            onClick={() => setShowPasswordGenerator(true)}
                            className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Generate Secure Password
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Regular Monitoring */}
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-800 mb-1">Monitor Your Accounts Regularly</h4>
                          <p className="text-purple-700 text-sm mb-3">Use Remaleh Protect regularly to check for new breaches and stay updated on security threats.</p>
                          <div className="flex items-center text-purple-600 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Check back monthly for new breaches
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Password Manager */}
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-orange-800 mb-1">Use a Password Manager</h4>
                          <p className="text-orange-700 text-sm mb-3">Store and manage your passwords securely with trusted password managers.</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Bitwarden</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">1Password</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">LastPass</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Dashlane</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
            {/* Header Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#21a1ce] rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-black">Scam Analysis</h1>
                  <p className="text-gray-600">Advanced threat detection</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">Analyze suspicious messages, links, and emails for potential scams using advanced pattern recognition and threat intelligence.</p>
              
              {/* API Status Indicator */}
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Connected to Remaleh Protect Security Engine</span>
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch(`${API}/api/security/status`)
                      if (response.ok) {
                        const data = await response.json()
                        console.log('Security Engine Status:', data)
                        alert(`Security Engine Status: ${data.status}\nVersion: ${data.version}\nServices: ${Object.keys(data.available_services).length} available`)
                      }
                    } catch (error) {
                      console.error('Status check failed:', error)
                      alert('Unable to check Security Engine status')
                    }
                  }}
                  className="ml-2 text-xs text-[#21a1ce] hover:text-[#1a8bb8] underline cursor-pointer"
                >
                  Check Status
                </button>
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-black mb-4">Analyze Content</h2>
              
              <div className="space-y-4">
                {/* Content Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'message', label: 'Message', icon: '💬' },
                      { id: 'link', label: 'Link', icon: '🔗' },
                      { id: 'email', label: 'Email', icon: '📧' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setScamType(type.id)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                          scamType === type.id
                            ? 'border-[#21a1ce] bg-[#21a1ce] bg-opacity-10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-sm font-medium text-gray-700">{type.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Input */}
                <div>
                  <label htmlFor="scamInput" className="block text-sm font-medium text-gray-700 mb-2">
                    {scamType === 'message' ? 'Message Content' : scamType === 'link' ? 'URL or Link' : 'Email Content'}
                  </label>
                  <div className="relative">
                    {scamType === 'link' ? (
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                    ) : scamType === 'email' ? (
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                    ) : (
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    )}
                    <textarea
                      id="scamInput"
                      value={scamInput}
                      onChange={(e) => setScamInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey && !isAnalyzing && scamInput.trim()) {
                          handleScamAnalysis()
                        }
                      }}
                      placeholder={
                        scamType === 'message' 
                          ? 'Paste the suspicious message here...' 
                          : scamType === 'link' 
                          ? 'Enter the URL or link to analyze...' 
                          : 'Paste the email content here...'
                      }
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#21a1ce] focus:border-transparent transition-all duration-200 resize-none"
                      disabled={isAnalyzing}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Press Ctrl+Enter to analyze quickly
                  </p>
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">
                      <strong>Content Guide:</strong> {
                        scamType === 'link' 
                          ? 'Paste a single URL (e.g., https://example.com) or a message containing URLs'
                          : scamType === 'email' 
                          ? 'Paste email content with headers (From:, To:, Subject:) or email body text'
                          : 'Paste any suspicious message, text, or content for analysis'
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 <strong>Smart Detection:</strong> The system automatically detects content type and routes to the best analysis method
                    </p>
                  </div>
                </div>

                {/* Error Display */}
                {scamError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-red-800 text-sm">{scamError}</span>
                    </div>
                  </div>
                )}

                {/* Analyze Button */}
                <button 
                  onClick={handleScamAnalysis}
                  disabled={isAnalyzing || !scamInput.trim()}
                  className="w-full bg-[#21a1ce] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#1a8bb8] transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing with {scamType === 'link' ? 'Link Analysis Engine' : scamType === 'email' ? 'Enhanced Scam Detection Engine' : 'Comprehensive Scam Analysis Engine'}...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Analyze for Scams
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Display */}
            {scamResult && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                    scamResult.riskLevel === 'scam' ? 'bg-red-100' :
                    scamResult.riskLevel === 'suspicious' ? 'bg-yellow-100' :
                    scamResult.riskLevel === 'safe' ? 'bg-green-100' :
                    'bg-green-100'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      scamResult.riskLevel === 'scam' ? 'text-red-600' :
                      scamResult.riskLevel === 'suspicious' ? 'text-yellow-600' :
                      scamResult.riskLevel === 'safe' ? 'text-green-600' :
                      'text-green-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      Risk Level: {scamResult.riskLevel === 'safe' ? 'Safe ✅' : 
                                  scamResult.riskLevel === 'scam' ? 'Scam 🚨' :
                                  scamResult.riskLevel === 'suspicious' ? 'Suspicious ⚠️' :
                                  scamResult.riskLevel.charAt(0).toUpperCase() + scamResult.riskLevel.slice(1)}
                      {scamResult.riskLevel === 'scam' ? ' - IMMEDIATE ACTION REQUIRED' : ''}
                      {scamResult.riskLevel === 'safe' ? ' - No threats detected' : ''}
                      {scamResult.riskLevel === 'suspicious' ? ' - Exercise caution' : ''}
                    </h2>
                    <p className="text-gray-600">
                      Risk Score: {scamResult.riskScore}/100
                      {scamResult.riskScore >= 70 ? ' - IMMEDIATE ACTION REQUIRED' : ''}
                      {scamResult.riskLevel === 'safe' ? ' - Content appears safe' : ''}
                      {scamResult.riskLevel === 'suspicious' ? ' - Review carefully' : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Analyzed with {scamType === 'link' ? 'Link Analysis Engine' : scamType === 'email' ? 'Enhanced Scam Detection Engine' : 'Comprehensive Scam Analysis Engine'}
                    </p>
                    {scamResult.contentTypeNote && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-blue-800 text-xs">
                            <strong>Content Detection:</strong> {scamResult.contentTypeNote}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scam Warning */}
                {(scamResult.riskLevel === 'scam' || scamResult.riskScore >= 70) && (
                  <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                    <div className="flex items-center mb-3">
                      <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-lg font-bold text-red-800">🚨 SCAM DETECTED</h3>
                    </div>
                    <div className="space-y-2 text-red-700">
                      <p className="font-medium">This content shows multiple signs of being a scam:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {scamResult.riskLevel === 'scam' && <li>Scam risk level - immediate action required</li>}
                        {scamResult.riskScore >= 70 && <li>Very high risk score ({scamResult.riskScore}/100)</li>}
                        {scamResult.indicators && scamResult.indicators.length > 0 && <li>Multiple suspicious indicators detected</li>}
                        <li>Do NOT click any links or respond to this message</li>
                        <li>Contact Remaleh Guardians via chat immediately</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Suspicious Content Warning */}
                {scamResult.riskLevel === 'suspicious' && (
                  <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                    <div className="flex items-center mb-3">
                      <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-lg font-bold text-yellow-800">⚠️ SUSPICIOUS CONTENT DETECTED</h3>
                    </div>
                    <div className="space-y-2 text-yellow-700">
                      <p className="font-medium">This content shows some concerning signs:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Exercise caution with this content</li>
                        <li>Verify authenticity before responding</li>
                        <li>Do not share personal information</li>
                        <li>Contact Remaleh Guardians via chat if you need assistance</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Safe Content Message */}
                {scamResult.riskLevel === 'safe' && (
                  <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                    <div className="flex items-center mb-3">
                      <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-bold text-green-800">✅ CONTENT APPEARS SAFE</h3>
                    </div>
                    <div className="space-y-2 text-green-700">
                      <p className="font-medium">This content shows no obvious signs of being a scam:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Low risk score ({scamResult.riskScore}/100)</li>
                        <li>No suspicious patterns detected</li>
                        <li>Continue to exercise normal caution</li>
                        <li>If you have concerns, contact Remaleh Guardians via chat</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Risk Indicators - Handle both object and array formats */}
                {scamResult.indicators && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Detected Indicators:</h3>
                    
                    {/* Object format indicators (with counts) */}
                    {Object.keys(scamResult.indicators).length > 0 && !Array.isArray(scamResult.indicators) && (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(scamResult.indicators).map(([indicator, count]) => (
                          <div key={indicator} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {indicator.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="text-xs bg-[#21a1ce] text-white px-2 py-1 rounded-full">
                                {count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Array format indicators (link analysis, enhanced scam) */}
                    {Array.isArray(scamResult.indicators) && scamResult.indicators.length > 0 && (
                      <div className="space-y-2">
                        {scamResult.indicators.map((indicator, index) => (
                          <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-yellow-800 text-sm">{indicator}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* No indicators case */}
                    {(!scamResult.indicators || 
                      (Array.isArray(scamResult.indicators) && scamResult.indicators.length === 0) ||
                      (!Array.isArray(scamResult.indicators) && Object.keys(scamResult.indicators).length === 0)) && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-green-800 text-sm">No suspicious indicators detected</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Threats Detected section removed - now handled in consolidated indicators above */}

                {/* Link Analysis Details */}
                {scamResult.linkDetails && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Link Analysis Details:</h3>
                    <div className="space-y-2">
                      {scamResult.linkDetails.indicators && scamResult.linkDetails.indicators.map((indicator, index) => (
                        <div key={index} className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <span className="text-yellow-800 text-sm">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Analysis Details */}
                {scamResult.emailDetails && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Email Analysis Details:</h3>
                    <div className="space-y-2">
                      {scamResult.emailDetails.scam_categories && scamResult.emailDetails.scam_categories.map((category, index) => (
                        <div key={index} className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                          <span className="text-purple-800 text-sm">{category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Security Recommendations:</h3>
                  <div className="space-y-2">
                    {scamResult.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-blue-800 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      setScamInput('')
                      setScamResult(null)
                      setScamError('')
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Analyze Another Item
                  </button>
                </div>
              </div>
            )}

            {/* How It Works Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-black mb-4">How Scam Analysis Works</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#21a1ce] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#21a1ce] font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2">Input Content</h3>
                  <p className="text-gray-600 text-sm">Paste suspicious messages, links, or emails</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#21a1ce] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#21a1ce] font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2">AI Analysis</h3>
                  <p className="text-gray-600 text-sm">Advanced pattern recognition scans for threats</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#21a1ce] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#21a1ce] font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2">Get Results</h3>
                  <p className="text-gray-600 text-sm">Risk assessment and security recommendations</p>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-black mb-4">Detection Capabilities</h2>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-800 text-sm">Phishing attempts and social engineering</span>
                </div>
                
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-yellow-800 text-sm">Suspicious links and URLs</span>
                </div>
                
                <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-yellow-800 text-sm">Financial fraud and money scams</span>
                </div>
              </div>
            </div>
          </div>
        )
      case 'chat':
        return (
          <div className="space-y-4">
            {/* Chat Header */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="w-10 h-10 bg-[#21a1ce] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-[#21a1ce]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm mb-2">Your AI cybersecurity assistant for instant help and guidance</p>
                <div className="bg-[#21a1ce] bg-opacity-10 px-3 py-2 rounded-lg border border-[#21a1ce] border-opacity-20 inline-block">
                  <p className="text-[#21a1ce] text-xs font-medium">
                    💡 <strong>Need human help?</strong> Send "connect me with a Remaleh Guardian"
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <ChatAssistant setActiveTab={setActiveTab} />
            </div>
          </div>
        )
      case 'learn':
        return <LearnHub setActiveTab={setActiveTab} />
      case 'admin':
        return <ContentAdmin />
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

      {/* Password Generator Modal */}
      {showPasswordGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Password Generator</h2>
                <button 
                  onClick={() => setShowPasswordGenerator(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PasswordGenerator onUse={handlePasswordUse} />
            </div>
          </div>
        </div>
      )}



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

