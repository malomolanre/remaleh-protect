import React, { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, X, ArrowLeft } from 'lucide-react'
import { MobileCard } from './ui/mobile-card'
import { MobileButton } from './ui/mobile-button'
import { MobileInput } from './ui/mobile-input'
import { useBreachCheck } from '../hooks/useBreachCheck'
import MobilePullToRefresh from './MobilePullToRefresh'

export default function BreachChecker({ setActiveTab }) {
  const [email, setEmail] = useState('')
  const { check, result, isChecking } = useBreachCheck()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (email.trim()) {
      await check(email.trim())
    }
  }

  return (
    <MobilePullToRefresh onRefresh={async () => { if (email.trim()) await check(email.trim()) }} className="">
    <div className="space-y-4 p-4">
      {/* Header centered like Community Hub */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 bg-[#21a1ce] rounded-lg flex items-center justify-center">
            <Search className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Breach Checker</h1>
        <p className="text-gray-600 text-sm">Check if your email has been compromised</p>
      </div>

      {/* Search Form */}
      <MobileCard>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <MobileInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full"
            />
          </div>
          <MobileButton
            type="submit"
            disabled={isChecking || !email.trim()}
            className="w-full"
          >
            {isChecking ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Checking...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Search className="w-4 h-4 mr-2" />
                Check for Breaches
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
              {result.breached ? (
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {result.breached ? 'Breach Detected' : 'No Breaches Found'}
              </h3>
            </div>
            
            {result.breached ? (
              <div className="space-y-3">
                <p className="text-red-700">
                  Your email was found in {result.breachCount} data breach{result.breachCount > 1 ? 'es' : ''}.
                </p>
                {result.breaches && result.breaches.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Affected Services:</h4>
                    <div className="space-y-2">
                      {result.breaches.map((breach, index) => (
                        <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-800">{breach.name}</p>
                              <p className="text-sm text-red-600">{breach.domain}</p>
                              {breach.breach_date && (
                                <p className="text-xs text-red-500">
                                  Breached: {new Date(breach.breach_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-1">Recommended Actions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Change your password immediately</li>
                    <li>• Enable two-factor authentication</li>
                    <li>• Monitor your accounts for suspicious activity</li>
                    <li>• Use a password manager for unique passwords</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-green-700">
                <p>Great news! Your email address hasn't been found in any known data breaches.</p>
                <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-1">Keep it secure:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Use strong, unique passwords</li>
                    <li>• Enable two-factor authentication</li>
                    <li>• Be cautious of phishing attempts</li>
                    <li>• Regularly check for new breaches</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </MobileCard>
      )}

      {/* Error Display */}
      {error && (
        <MobileCard className="bg-red-50 border-red-200">
          <div className="p-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </MobileCard>
      )}
    </div>
    </MobilePullToRefresh>
  )
}
