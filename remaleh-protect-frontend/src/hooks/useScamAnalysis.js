import { useState } from 'react'
import { API } from '../lib/api'

export function useScamAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  const performEnhancedLocalAnalysis = (text, urls, emails) => {
    const textLower = text.toLowerCase()
    let score = 0
    const indicators = []

    const deliveryKeywords = [
      'parcel', 'package', 'delivery', 'shipped', 'tracking', 'postal code',
      'held', 'suspended', 'customs', 'warehouse', 'courier', 'fedex', 'dhl',
      'ups', 'auspost', 'australia post', 'postage', 'shipment'
    ]
    deliveryKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        score += 15
        indicators.push(`Delivery scam indicator: "${keyword}"`)
      }
    })

    const brands = [
      'auspost', 'australia post', 'ato', 'centrelink', 'medicare', 'telstra',
      'optus', 'vodafone', 'commonwealth bank', 'anz', 'westpac', 'nab',
      'paypal', 'amazon', 'ebay', 'netflix', 'spotify', 'apple', 'google',
      'microsoft', 'facebook', 'instagram', 'twitter'
    ]
    brands.forEach(brand => {
      if (textLower.includes(brand)) {
        score += 20
        indicators.push(`Brand impersonation: "${brand}"`)
      }
    })

    const urgencyPhrases = [
      'within 24 hours', 'expires today', 'immediate action', 'urgent',
      'act now', 'limited time', 'expires soon', 'verify now', 'confirm immediately',
      'suspend', 'block', 'freeze', 'close your account'
    ]
    urgencyPhrases.forEach(phrase => {
      if (textLower.includes(phrase)) {
        score += 12
        indicators.push(`Creates false urgency: "${phrase}"`)
      }
    })

    const financialKeywords = [
      'bank account', 'credit card', 'social security', 'ssn', 'tax refund',
      'inheritance', 'lottery', 'winner', 'prize', 'million', 'thousand',
      'transfer', 'wire', 'bitcoin', 'cryptocurrency', 'investment'
    ]
    financialKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        score += 18
        indicators.push(`Financial fraud indicator: "${keyword}"`)
      }
    })

    const suspiciousInstructions = [
      'reply with', 'click here', 'download', 'install', 'enable',
      'exit and reopen', 'copy and paste', 'forward this message',
      "don't tell anyone", 'keep this secret', 'call this number'
    ]
    suspiciousInstructions.forEach(instruction => {
      if (textLower.includes(instruction)) {
        score += 10
        indicators.push(`Suspicious instruction: "${instruction}"`)
      }
    })

    urls.forEach(url => {
      const urlLower = url.toLowerCase()
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.buzz', '.click', '.download']
      suspiciousTlds.forEach(tld => {
        if (urlLower.includes(tld)) {
          score += 35
          indicators.push(`Highly suspicious domain: ${url}`)
        }
      })

      const domain = url.replace(/https?:\/\//, '').split('/')[0]
      if (/^[a-z]{4,8}\.(buzz|tk|ml|ga|cf)/.test(domain.toLowerCase())) {
        score += 30
        indicators.push(`Random character domain: ${domain}`)
      }

      const shorteners = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly']
      shorteners.forEach(shortener => {
        if (urlLower.includes(shortener)) {
          score += 15
          indicators.push(`URL shortener detected: ${shortener}`)
        }
      })
    })

    const personalInfoRequests = [
      'password', 'pin', 'ssn', 'social security', 'date of birth',
      "mother's maiden name", 'security question', 'account number',
      'routing number', 'cvv', 'security code'
    ]
    personalInfoRequests.forEach(request => {
      if (textLower.includes(request)) {
        score += 25
        indicators.push(`Requests personal information: "${request}"`)
      }
    })

    return { score, indicators, analysis: 'Enhanced local pattern analysis' }
  }

  const generateRecommendations = (score, indicators, urls, emails) => {
    const recommendations = []
    if (score >= 70) {
      recommendations.push('Do not interact with this message - Multiple high-risk indicators detected')
      if (urls.length > 0) recommendations.push('Avoid clicking the detected URLs - Links identified as dangerous')
      recommendations.push('Verify sender through official channels - Always confirm unexpected messages')
      if (emails.length > 0) recommendations.push('Check if your email has been compromised - Consider changing passwords')
    } else if (score >= 40) {
      recommendations.push('Exercise caution with this message - Several suspicious elements found')
      if (urls.length > 0) recommendations.push('Verify URLs before clicking - Check domain authenticity')
      recommendations.push('Confirm sender identity through alternative means')
    } else if (score >= 15) {
      recommendations.push('Be cautious and verify sender identity')
      if (urls.length > 0) recommendations.push('Check URL destinations before clicking')
      recommendations.push('When in doubt, contact the organization directly')
    } else {
      recommendations.push('Message appears legitimate but always stay vigilant')
      recommendations.push('Continue following good cybersecurity practices')
    }
    return recommendations
  }

  const generateSuspiciousElements = (indicators) => {
    return indicators.filter(indicator => 
      indicator.includes('suspicious') || 
      indicator.includes('dangerous') || 
      indicator.includes('highly suspicious') ||
      indicator.includes('random character domain')
    )
  }

  const aggregateScamResults = (serviceResults, urls, emails, startTime) => {
    const endTime = Date.now()
    const analysisTime = endTime - startTime

    let totalScore = 0
    let allIndicators = []
    let servicesUsed = []
    let aiAnalysis = ''

    if (serviceResults.basicScam && !serviceResults.basicScam.error) {
      totalScore += (serviceResults.basicScam.risk_score || 0) * 100
      servicesUsed.push('✓ Basic Scam Detection')
      if (serviceResults.basicScam.indicators) {
        allIndicators.push(...serviceResults.basicScam.indicators)
      }
      if (serviceResults.basicScam.analysis) {
        aiAnalysis = serviceResults.basicScam.analysis
      }
    } else {
      servicesUsed.push('✗ Basic Scam Detection (unavailable)')
    }

    if (serviceResults.breachCheck && !serviceResults.breachCheck.error) {
      if (serviceResults.breachCheck.breached_emails && serviceResults.breachCheck.breached_emails.length > 0) {
        totalScore += 30
        allIndicators.push(`Compromised emails detected: ${serviceResults.breachCheck.breached_emails.length}`)
      }
      servicesUsed.push('✓ Breach Check')
    }

    if (serviceResults.linkAnalysis && !serviceResults.linkAnalysis.error) {
      const analysis = serviceResults.linkAnalysis.analysis || serviceResults.linkAnalysis.result || {}
      const urlsAnalysed = analysis.urls || []
      if (typeof analysis.average_risk_score === 'number') {
        totalScore += analysis.average_risk_score
      }
      servicesUsed.push('✓ Link Analysis')
      urlsAnalysed.forEach(u => {
        if (u.indicators && u.indicators.length > 0) {
          allIndicators.push(...u.indicators)
        }
      })
    }

    if (serviceResults.localAnalysis) {
      totalScore += serviceResults.localAnalysis.score
      allIndicators.push(...serviceResults.localAnalysis.indicators)
      servicesUsed.push('✓ Enhanced Pattern Analysis')
    }

    // Normalize score to 0-100 range
    const normalizedScore = Math.min(Math.max(totalScore, 0), 100)
    
    // Calculate confidence based on services used and indicators found
    const confidence = Math.min(
      (servicesUsed.filter(s => s.includes('✓')).length / 4) * 100 + 
      (allIndicators.length * 5), 
      100
    )

    const technicalErrorRegex = /Content analysis failed|HTTPSConnectionPool|NameResolutionError|Failed to resolve|Max retries exceeded|HTTP error/i
    const displayIndicators = allIndicators.filter(ind => !technicalErrorRegex.test(ind))
    const topIndicators = displayIndicators.slice(0, 5).map(ind => ind.replace(/\"/g, '"'))

    const recommendations = generateRecommendations(normalizedScore, allIndicators, urls, emails)
    const suspiciousElements = generateSuspiciousElements(allIndicators)

    return {
      riskScore: Math.round(normalizedScore),
      confidence: Math.round(confidence),
      indicators: topIndicators,
      analysis: aiAnalysis || `Analysis completed using ${servicesUsed.filter(s => s.includes('✓')).length} services in ${analysisTime}ms`,
      recommendations,
      suspiciousElements,
      urlsDetected: urls.length,
      emailsDetected: emails.length,
      servicesUsed: servicesUsed.filter(s => s.includes('✓')),
      analysisTime
    }
  }

  const analyze = async (text) => {
    if (!text || !text.trim()) return null
    setIsAnalyzing(true)
    setResult(null)

    try {
      const startTime = Date.now()

      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
      const urlRegex = /https?:\/\/[^\s]+/g
      const emails = text.match(emailRegex) || []
      const urls = text.match(urlRegex) || []

      const servicePromises = []
      const serviceResults = {
        basicScam: null,
        breachCheck: null,
        linkAnalysis: null,
        localAnalysis: null
      }

      servicePromises.push(
        fetch(`${API}/api/scam/comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        })
          .then(r => r.json())
          .then(data => { serviceResults.basicScam = data })
          .catch(() => { serviceResults.basicScam = { error: 'Service unavailable' } })
      )

      if (emails.length > 0) {
        servicePromises.push(
          fetch(`${API}/api/breach/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emails })
          })
            .then(r => r.json())
            .then(data => { serviceResults.breachCheck = data })
            .catch(() => { serviceResults.breachCheck = { error: 'Service unavailable' } })
        )
      }

      if (urls.length > 0) {
        servicePromises.push(
          fetch(`${API}/api/link/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          })
            .then(r => r.json())
            .then(data => { serviceResults.linkAnalysis = data })
            .catch(() => { serviceResults.linkAnalysis = { error: 'Service unavailable' } })
        )
      }

      serviceResults.localAnalysis = performEnhancedLocalAnalysis(text, urls, emails)

      await Promise.all(servicePromises)
      const analysisResult = aggregateScamResults(serviceResults, urls, emails, startTime)
      setResult(analysisResult)
      return analysisResult
    } finally {
      setIsAnalyzing(false)
    }
  }

  return { isAnalyzing, result, analyze }
}
