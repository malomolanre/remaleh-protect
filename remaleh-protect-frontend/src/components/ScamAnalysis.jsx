import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, X, ArrowLeft, Shield, MessageSquare, Link, Mail } from 'lucide-react'
import { MobileCard } from './ui/mobile-card'
import { MobileButton } from './ui/mobile-button'
import { MobileInput, MobileTextarea } from './ui/mobile-input'
import { useScamAnalysis } from '../hooks/useScamAnalysis'

export default function ScamAnalysis({ setActiveTab }) {
  const [inputType, setInputType] = useState('message')
  const [input, setInput] = useState('')
  const { analyze, result, isAnalyzing } = useScamAnalysis()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (input.trim()) {
      await analyze(input.trim())
    }
  }

  const inputTypes = [
    { id: 'message', label: 'Message', icon: MessageSquare, description: 'Text or email content' },
    { id: 'link', label: 'Link', icon: Link, description: 'Suspicious URL' },
    { id: 'email', label: 'Email', icon: Mail, description: 'Email address or header' }
  ]

  return (
    <div className="space-y-4 p-4">
      {/* Header centered like Community Hub */}
      <div className="mb-6">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 bg-[#21a1ce] rounded-lg flex items-center justify-center mr-3">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Scam Analysis</h1>
        </div>
        <p className="text-gray-600 text-sm text-center mt-1">Analyze suspicious content for potential scams</p>
      </div>

      {/* Input Type Selection */}
      <MobileCard>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What are you analyzing?</h3>
          <div className="grid grid-cols-3 gap-2">
            {inputTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setInputType(type.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  inputType === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <type.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {inputTypes.find(t => t.id === inputType)?.description}
          </p>
        </div>
      </MobileCard>

      {/* Analysis Form */}
      <MobileCard>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
              {inputType === 'message' ? 'Message Content' : 
               inputType === 'link' ? 'URL/Link' : 'Email Address'}
            </label>
            {inputType === 'message' ? (
              <MobileTextarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter the ${inputType === 'message' ? 'message content' : 
                           inputType === 'link' ? 'suspicious URL' : 'email address'} to analyze`}
                rows={4}
                required
                className="w-full"
              />
            ) : (
              <MobileInput
                id="input"
                type={inputType === 'link' ? 'url' : 'email'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter the ${inputType === 'link' ? 'suspicious URL' : 'email address'} to analyze`}
                required
                className="w-full"
              />
            )}
          </div>
          <MobileButton
            type="submit"
            disabled={isAnalyzing || !input.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                Analyze for Scams
              </div>
            )}
          </MobileButton>
        </form>
      </MobileCard>

      {/* Results */}
      {result && (
        <MobileCard>
          <div className="p-4">
            <div className="flex items-center mb-3">
              {result.isScam ? (
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {result.isScam ? 'Potential Scam Detected' : 'No Scam Detected'}
              </h3>
            </div>
            
            {result.isScam ? (
              <div className="space-y-3">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-1">Risk Level: {result.riskLevel}</h4>
                  <p className="text-red-700 text-sm">{result.explanation}</p>
                </div>
                
                {result.redFlags && result.redFlags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Red Flags Identified:</h4>
                    <div className="space-y-2">
                      {result.redFlags.map((flag, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-700">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-1">Recommended Actions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Do not respond or click any links</li>
                    <li>• Block the sender/contact</li>
                    <li>• Report to relevant authorities if needed</li>
                    <li>• Share with friends to raise awareness</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-green-700">
                <p>This content appears to be legitimate and safe.</p>
                <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-1">Stay vigilant:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Always verify sender information</li>
                    <li>• Be cautious of unexpected requests</li>
                    <li>• Trust your instincts</li>
                    <li>• Report suspicious content to help others</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </MobileCard>
      )}

      {/* Error Display */}
      {/* Error Display */}
        <MobileCard className="bg-red-50 border-red-200">
          <div className="p-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </MobileCard>
    </div>
  )
}
