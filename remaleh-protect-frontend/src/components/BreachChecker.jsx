import React, { useState } from 'react'
import { AlertCircle, Shield, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { useBreachCheck } from '../hooks/useBreachCheck'
import { useForm } from '../hooks/useForm'
import { validateEmail } from '../utils/validation'
import { Button } from './ui/button'
import { Card, CardHeader, CardContent } from './ui/card'
import PasswordGenerator from './PasswordGenerator'

export default function BreachChecker() {
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false)
  const { isChecking, result, check } = useBreachCheck()
  
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { email: '' },
    { email: validateEmail }
  )

  const onSubmit = async (formValues) => {
    await check(formValues.email)
  }

  const handleUsePassword = (password) => {
    // You could implement a way to save this password or show it prominently
    alert(`Generated password: ${password}\n\nPlease save this in your password manager!`)
  }

  const getRiskLevel = (breachCount) => {
    if (breachCount === 0) return { level: 'safe', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
    if (breachCount <= 2) return { level: 'low', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
    if (breachCount <= 5) return { level: 'medium', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
    return { level: 'high', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
  }

  const riskInfo = result ? getRiskLevel(result.breaches?.length || 0) : null

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Breach Checker</h2>
              <p className="text-gray-600">Check if your email has been compromised in data breaches</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(onSubmit)
          }} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                disabled={isChecking}
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isChecking}
              disabled={!values.email.trim()}
              className="w-full"
            >
              {isChecking ? 'Checking...' : 'Check for Breaches'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className={`mb-6 border-2 ${riskInfo.borderColor}`}>
          <CardContent>
            <div className={`p-4 rounded-lg ${riskInfo.bgColor}`}>
              <div className="flex items-start gap-3">
                {result.breaches?.length > 0 ? (
                  <AlertCircle className={`w-6 h-6 ${riskInfo.color} mt-1 flex-shrink-0`} />
                ) : (
                  <Shield className={`w-6 h-6 ${riskInfo.color} mt-1 flex-shrink-0`} />
                )}
                
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${riskInfo.color} mb-2`}>
                    {result.breaches?.length > 0 
                      ? `Found ${result.breaches.length} breach${result.breaches.length > 1 ? 'es' : ''}`
                      : 'No breaches found!'
                    }
                  </h3>
                  
                  {result.breaches?.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-gray-700">
                        Your email has been found in {result.breaches.length} data breach{result.breaches.length > 1 ? 'es' : ''}. 
                        It's recommended to change your password immediately.
                      </p>
                      
                      <div className="space-y-2">
                        {result.breaches.map((breach, index) => (
                          <div key={index} className="p-3 bg-white rounded border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{breach.name}</span>
                              <span className="text-sm text-gray-500">{breach.breachDate}</span>
                            </div>
                            <p className="text-sm text-gray-600">{breach.description}</p>
                            {breach.dataClasses && (
                              <div className="mt-2">
                                <span className="text-xs font-medium text-gray-500">Compromised data:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {breach.dataClasses.map((dataClass, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                      {dataClass}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700">
                      Great news! Your email hasn't been found in any known data breaches. 
                      Keep up the good security practices!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Generator Section */}
      {result && (
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {result.breaches?.length > 0 
                    ? 'Generate a Strong Password'
                    : 'Proactive Password Security'
                  }
                </h3>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                className="flex items-center gap-2"
              >
                {showPasswordGenerator ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show
                  </>
                )}
              </Button>
            </div>

            {showPasswordGenerator && (
              <div className={`p-4 rounded-lg ${
                result.breaches?.length > 0 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <PasswordGenerator onUsePassword={handleUsePassword} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Tips */}
      {result && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Security Recommendations
            </h3>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {result.breaches?.length > 0 ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800">Immediate Actions Required</h4>
                      <ul className="text-sm text-red-700 mt-1 space-y-1">
                        <li>• Change passwords for all affected accounts</li>
                        <li>• Enable two-factor authentication where possible</li>
                        <li>• Monitor your accounts for suspicious activity</li>
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800">Stay Protected</h4>
                    <ul className="text-sm text-green-700 mt-1 space-y-1">
                      <li>• Use unique passwords for each account</li>
                      <li>• Enable two-factor authentication</li>
                      <li>• Regularly check for new breaches</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">General Security Tips</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Use a password manager to generate and store strong passwords</li>
                    <li>• Never reuse passwords across multiple accounts</li>
                    <li>• Be cautious of phishing emails and suspicious links</li>
                    <li>• Keep your software and devices updated</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
