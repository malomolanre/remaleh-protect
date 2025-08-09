export const APP_CONFIG = {
  API_ENDPOINTS: {
    SCAM_ANALYSIS: '/api/scam/comprehensive',
    BREACH_CHECK: '/api/breach/check',
    LINK_ANALYSIS: '/api/link/analyze',
    CHAT: '/api/chat/'
  },
  SCAM_INDICATORS: {
    DELIVERY_KEYWORDS: [
      'parcel', 'package', 'delivery', 'shipped', 'tracking', 'postal code',
      'held', 'suspended', 'customs', 'warehouse', 'courier', 'fedex', 'dhl',
      'ups', 'auspost', 'australia post', 'postage', 'shipment'
    ],
    BRANDS: [
      'auspost', 'australia post', 'ato', 'centrelink', 'medicare', 'telstra',
      'optus', 'vodafone', 'commonwealth bank', 'anz', 'westpac', 'nab',
      'paypal', 'amazon', 'ebay', 'netflix', 'spotify', 'apple', 'google',
      'microsoft', 'facebook', 'instagram', 'twitter'
    ],
    URGENCY_PHRASES: [
      'within 24 hours', 'expires today', 'immediate action', 'urgent',
      'act now', 'limited time', 'expires soon', 'verify now', 'confirm immediately',
      'suspend', 'block', 'freeze', 'close your account'
    ],
    FINANCIAL_KEYWORDS: [
      'bank account', 'credit card', 'social security', 'ssn', 'tax refund',
      'inheritance', 'lottery', 'winner', 'prize', 'million', 'thousand',
      'transfer', 'wire', 'bitcoin', 'cryptocurrency', 'investment'
    ],
    SUSPICIOUS_INSTRUCTIONS: [
      'reply with', 'click here', 'download', 'install', 'enable',
      'exit and reopen', 'copy and paste', 'forward this message',
      "don't tell anyone", 'keep this secret', 'call this number'
    ],
    PERSONAL_INFO_REQUESTS: [
      'password', 'pin', 'ssn', 'social security', 'date of birth',
      "mother's maiden name", 'security question', 'account number',
      'routing number', 'cvv', 'security code'
    ]
  },
  COLORS: {
    PRIMARY: '#21a1ce',
    SECONDARY: '#1a80a3',
    SUCCESS: '#16a34a',
    WARNING: '#ca8a04',
    DANGER: '#dc2626',
    INFO: '#3b82f6'
  },
  RISK_LEVELS: {
    HIGH: { threshold: 70, color: '#dc2626', icon: '🚨', label: 'HIGH RISK' },
    MEDIUM: { threshold: 40, color: '#ea580c', icon: '⚠️', label: 'MEDIUM RISK' },
    LOW_MEDIUM: { threshold: 15, color: '#ca8a04', icon: '⚡', label: 'LOW-MEDIUM RISK' },
    LOW: { threshold: 0, color: '#16a34a', icon: '✅', label: 'LOW RISK' }
  }
}
