import React, { useState } from 'react'
import { AlertCircle, Shield, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { useBreachCheck } from '../hooks/useBreachCheck'
import PasswordGenerator from './PasswordGenerator'

export default function BreachChecker() {
  const [email, setEmail] = useState('')
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false)
  const { isChecking, result, check } = useBreachCheck()

  const onSubmit = async (e) => {
    e.preventDefault()
    await check(email)
  }

  const handleUsePassword = (password) => {
    // You could implement a way to save this password or show it prominently
    alert(`Generated password: ${password}\n\nPlease save this in your password manager and update your compromised accounts.`)
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center mb-4">
          <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
            <Shield className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold">Password Still Safe?</h2>
        </div>
        <p className="text-gray-600 mb-4">Check if your email has been involved in any known data breaches</p>

        <form onSubmit={onSubmit}>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#21a1ce] to-[#1a80a3] text-white py-3 px-6 rounded-lg font-medium w-full"
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Check for Breaches'}
          </button>
        </form>

        {result && (
          <div className="mt-6">
            {result.breached ? (
              <div className="p-4 rounded-lg bg-red-100 border border-red-200">
                <div className="flex items-center mb-2">
                  <div className="p-2 rounded-full bg-red-200 mr-3">
                    <AlertCircle className="text-red-500" size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-red-700">Email Found in Data Breaches</h3>
                </div>
                <p className="mb-4 text-red-600">Your email was found in {result.breaches.length} known data breach(es).</p>
                <div className="space-y-3">
                  {result.breaches.map((breach, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <h4 className="font-medium">{breach.name}</h4>
                      <p className="text-sm text-gray-600">Domain: {breach.domain}</p>
                      <p className="text-sm text-gray-600">Date: {breach.date}</p>
                      <p className="text-sm text-gray-600">Compromised data: {breach.data.join(', ')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-medium text-yellow-800">Recommended Actions:</h4>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Change your password immediately</li>
                    <li>• Enable two-factor authentication</li>
                    <li>• Monitor your accounts for suspicious activity</li>
                    <li>• Consider using a password manager</li>
                  </ul>
                </div>

                {/* Password Generator Section */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Lock className="text-blue-600 mr-2" size={20} />
                      <h4 className="font-medium text-blue-800">Generate a Strong Password</h4>
                    </div>
                    <button
                      onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {showPasswordGenerator ? (
                        <>
                          <ChevronUp size={16} className="mr-1" />
                          Hide Generator
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="mr-1" />
                          Show Generator
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showPasswordGenerator && (
                    <div className="mt-3">
                      <PasswordGenerator onUse={handleUsePassword} />
                    </div>
                  )}
                  
                  {!showPasswordGenerator && (
                    <p className="text-sm text-blue-700">
                      Click "Show Generator" to create a strong, unique password for your compromised accounts.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-green-100 border border-green-200">
                <div className="flex items-center mb-2">
                  <div className="p-2 rounded-full bg-green-200 mr-3">
                    <Shield className="text-green-500" size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-green-700">No Breaches Found</h3>
                </div>
                <p className="text-green-600">Great news! Your email was not found in any known data breaches.</p>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-medium text-blue-800">Stay Protected:</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Continue using strong, unique passwords</li>
                    <li>• Keep two-factor authentication enabled</li>
                    <li>• Regularly monitor your accounts</li>
                    <li>• Stay informed about new security threats</li>
                  </ul>
                </div>

                {/* Password Generator Section for Proactive Users */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Lock className="text-green-600 mr-2" size={20} />
                      <h4 className="font-medium text-green-800">Proactive Password Security</h4>
                    </div>
                    <button
                      onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                      className="flex items-center text-green-600 hover:text-green-800 text-sm"
                    >
                      {showPasswordGenerator ? (
                        <>
                          <ChevronUp size={16} className="mr-1" />
                          Hide Generator
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="mr-1" />
                          Show Generator
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showPasswordGenerator && (
                    <div className="mt-3">
                      <PasswordGenerator onUse={handleUsePassword} />
                    </div>
                  )}
                  
                  {!showPasswordGenerator && (
                    <p className="text-sm text-green-700">
                      Want to improve your password security? Click "Show Generator" to create strong passwords for your accounts.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
