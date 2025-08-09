import { useState } from 'react'
import { API } from '../lib/api'

export function useScamAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resultHtml, setResultHtml] = useState(null)

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

  const aggregateScamResults = (serviceResults, urls, emails, startTime) => {
    const endTime = Date.now()
    const analysisTime = endTime - startTime

    let totalScore = 0
    let allIndicators = []
    let servicesUsed = []

    if (serviceResults.basicScam && !serviceResults.basicScam.error) {
      totalScore += (serviceResults.basicScam.risk_score || 0) * 100
      servicesUsed.push('✓ Basic Scam Detection')
      if (serviceResults.basicScam.indicators) {
        allIndicators.push(...serviceResults.basicScam.indicators)
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

    let riskLevel, riskColor, riskIcon
    if (totalScore >= 70) {
      riskLevel = 'HIGH RISK'
      riskColor = '#dc2626'
      riskIcon = '🚨'
    } else if (totalScore >= 40) {
      riskLevel = 'MEDIUM RISK'
      riskColor = '#ea580c'
      riskIcon = '⚠️'
    } else if (totalScore >= 15) {
      riskLevel = 'LOW-MEDIUM RISK'
      riskColor = '#ca8a04'
      riskIcon = '⚡'
    } else {
      riskLevel = 'LOW RISK'
      riskColor = '#16a34a'
      riskIcon = '✅'
    }

    const technicalErrorRegex = /Content analysis failed|HTTPSConnectionPool|NameResolutionError|Failed to resolve|Max retries exceeded|HTTP error/i
    const displayIndicators = allIndicators.filter(ind => !technicalErrorRegex.test(ind))
    const topIndicators = displayIndicators.slice(0, 3).map(ind => ind.replace(/\"/g, '"'))

    const recommendations = generateRecommendations(totalScore, allIndicators, urls, emails)

    return `
      <div style="padding: 20px; border-radius: 8px; background: #f8fafc; border-left: 4px solid ${riskColor};">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 26px; margin-right: 10px;">${riskIcon}</span>
          <h3 style="margin: 0; color: ${riskColor}; font-size: 20px;">${riskLevel}</h3>
          <span style="margin-left: 10px; color: #64748b; font-size: 14px;">(Score: ${totalScore.toFixed(0)})</span>
        </div>
        <p style="margin: 8px 0; color: #111827; font-size: 15px; font-weight: bold; line-height: 1.4;">
          ${totalScore >= 70 ? '⚠️ This message looks like a scam. It contains multiple warning signs such as a suspicious link and urgent language.'
          : totalScore >= 40 ? '⚠️ This message appears suspicious. It has several signs that it might be a scam.'
          : totalScore >= 15 ? '⚠️ Be cautious. This message has some risky elements and could be a scam.'
          : '✅ This message does not appear risky, but always be vigilant.'}
        </p>
        ${topIndicators.length > 0 ? `
          <div style="margin: 12px 0;">
            <h4 style="margin: 0 0 6px 0; color: #374151; font-size: 14px;">Why this looks risky:</h4>
            <div style="color: #b91c1c; font-size: 13px; line-height: 1.4;">
              ${topIndicators.map(ind => `• ${ind}`).join('<br>')}
              ${displayIndicators.length > topIndicators.length ? `<br><em>...and more warning signs detected</em>` : ''}
            </div>
          </div>
        ` : ''}
        <div style="margin: 12px 0;">
          <h4 style="margin: 0 0 6px 0; color: #374151; font-size: 14px;">What you should do:</h4>
          <div style="color: #065f46; font-size: 13px; line-height: 1.4;">
            ${recommendations.map(rec => `🛡️ ${rec}`).join('<br>')}
          </div>
        </div>
        <div style="margin: 15px 0;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Detailed Analysis (for advanced users):</h4>
          <div style="color: #6b7280; font-size: 13px;">
            <strong>Components Detected:</strong><br>
            ${urls.length > 0 ? `• URLs: ${urls.length} detected` : '• No URLs detected'}<br>
            ${emails.length > 0 ? `• Emails: ${emails.length} detected` : '• No emails detected'}<br><br>
            <strong>Analysis Services Used:</strong><br>
            ${servicesUsed.map(service => `• ${service}`).join('<br>')}<br><br>
            ${displayIndicators.length > 0 ? `
              <strong>Threats Detected:</strong><br>
              ${displayIndicators.slice(0, 8).map(ind => `✗ ${ind}`).join('<br>')}
              ${displayIndicators.length > 8 ? `<br><em>...and ${displayIndicators.length - 8} more indicators</em>` : ''}<br>
            ` : ''}
          </div>
        </div>
        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
          Analysis completed in ${analysisTime}ms using ${servicesUsed.filter(s => s.includes('✓')).length} services
        </div>
      </div>
    `
  }

  const analyze = async (text) => {
    if (!text || !text.trim()) return null
    setIsAnalyzing(true)
    setResultHtml(null)

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
      const html = aggregateScamResults(serviceResults, urls, emails, startTime)
      setResultHtml(html)
      return html
    } finally {
      setIsAnalyzing(false)
    }
  }

  return { isAnalyzing, resultHtml, analyze }
}