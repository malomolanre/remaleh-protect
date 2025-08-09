import React, { useState } from 'react'
import { MessageSquare, AlertTriangle, CheckCircle, Info, Copy, ExternalLink } from 'lucide-react'
import { useScamAnalysis } from '../hooks/useScamAnalysis'
import { useForm } from '../hooks/useForm'
import { validateRequired } from '../utils/validation'
import { APP_CONFIG } from '../config/constants'
import { Button } from './ui/button'
import { MobileCard, MobileCardHeader, MobileCardContent } from './ui/mobile-card'
import { MobileTextarea } from './ui/mobile-input'

export default function ScamAnalysis() {
  const [showDetails, setShowDetails] = useState(false)
  const { isAnalyzing, result, analyze } = useScamAnalysis()
  
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { message: '' },
    { message: (value) => validateRequired(value, 'Message') }
  )

  const onSubmit = async (formValues) => {
    await analyze(formValues.message)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const getRiskLevel = (score) => {
    for (const [level, config] of Object.entries(APP_CONFIG.RISK_LEVELS)) {
      if (score >= config.threshold) {
        return { ...config, level }
      }
    }
    return APP_CONFIG.RISK_LEVELS.LOW
  }

  const riskInfo = result ? getRiskLevel(result.riskScore) : null

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <MobileCard className="mb-6">
        <MobileCardHeader>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Scam Analysis</h2>
              <p className="text-sm md:text-base text-gray-600">Analyze suspicious messages for potential scams and fraud attempts</p>
            </div>
          </div>
        </MobileCardHeader>
        
        <MobileCardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(onSubmit)
          }} className="space-y-4">
            <MobileTextarea
              label="Suspicious Message"
              value={values.message}
              onChange={(e) => handleChange('message', e.target.value)}
              onBlur={() => handleBlur('message')}
              error={errors.message && touched.message ? errors.message : undefined}
              placeholder="Paste the suspicious message, email, or text here..."
              rows={6}
              disabled={isAnalyzing}
              fullWidth
            />
            
            <Button
              type="submit"
              variant="danger"
              size="lg"
              loading={isAnalyzing}
              disabled={!values.message.trim()}
              className="w-full py-3 text-base"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze for Scams'}
            </Button>
          </form>
        </MobileCardContent>
      </MobileCard>

      {result && (
        <>
          {/* Risk Assessment */}
          <MobileCard className="mb-6 border-2" style={{ borderColor: riskInfo.color }}>
            <MobileCardContent>
              <div className="p-6 rounded-lg" style={{ backgroundColor: `${riskInfo.color}20` }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{riskInfo.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: riskInfo.color }}>
                      {riskInfo.label}
                    </h3>
                    <p className="text-gray-700">
                      Risk Score: <span className="font-semibold">{result.riskScore}/100</span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Key Indicators Found:</h4>
                    <div className="space-y-1">
                      {result.indicators && result.indicators.length > 0 ? (
                        result.indicators.map((indicator, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span>{indicator}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No specific indicators detected</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Confidence Level:</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${result.confidence}%`,
                            backgroundColor: riskInfo.color
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{result.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </MobileCardContent>
          </MobileCard>

          {/* Detailed Analysis */}
          <MobileCard className="mb-6">
            <MobileCardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Detailed Analysis
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
            </MobileCardHeader>
            
            <MobileCardContent>
              {showDetails && (
                <div className="space-y-4">
                  {result.analysis && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">AI Analysis:</h4>
                      <p className="text-blue-700">{result.analysis}</p>
                    </div>
                  )}
                  
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Recommendations:</h4>
                      <ul className="text-green-700 space-y-1">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.suspiciousElements && result.suspiciousElements.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Suspicious Elements:</h4>
                      <ul className="text-red-700 space-y-1">
                        {result.suspiciousElements.map((element, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>{element}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </MobileCardContent>
          </MobileCard>

          {/* Quick Actions */}
          <MobileCard>
            <MobileCardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </MobileCardHeader>
            
            <MobileCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(values.message)}
                  className="flex items-center gap-2 justify-center"
                >
                  <Copy className="w-4 h-4" />
                  Copy Message
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`Risk Score: ${result.riskScore}/100\nAnalysis: ${result.analysis || 'No analysis available'}`)}
                  className="flex items-center gap-2 justify-center"
                >
                  <Copy className="w-4 h-4" />
                  Copy Analysis
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Reminder:</h4>
                <p className="text-yellow-700 text-sm">
                  This analysis is for educational purposes. If you believe you've received a scam message, 
                  report it to relevant authorities and never provide personal information or click suspicious links.
                </p>
              </div>
            </MobileCardContent>
          </MobileCard>
        </>
      )}

      {/* Information Section */}
      {!result && (
        <MobileCard>
          <MobileCardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              How It Works
            </h3>
          </MobileCardHeader>
          
          <MobileCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Paste Message</h4>
                <p className="text-sm text-gray-600">
                  Copy and paste any suspicious message, email, or text you've received
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔍</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
                <p className="text-sm text-gray-600">
                  Our AI analyzes the message for common scam patterns and red flags
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Get Results</h4>
                <p className="text-sm text-gray-600">
                  Receive a detailed risk assessment and recommendations to stay safe
                </p>
              </div>
            </div>
          </MobileCardContent>
        </MobileCard>
      )}
    </div>
  )
}
