import React, { useState } from 'react';
import { MessageSquare, Lock, BookOpen, Shield, Mail, Users, Smartphone, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('check');
  const [scamMessage, setScamMessage] = useState('');
  const [scamResult, setScamResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [email, setEmail] = useState('');
  const [breachResult, setBreachResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedLearningTopic, setSelectedLearningTopic] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // CORRECTED SCAM CHECKER WITH PROPER BACKEND INTEGRATION
  const handleScamCheck = async (e) => {
    e.preventDefault();
    if (!scamMessage.trim()) return;

    setIsAnalyzing(true);
    setScamResult(null);

    try {
      const startTime = Date.now();
      
      // Component extraction
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const urlRegex = /https?:\/\/[^\s]+/g;
      
      const emails = scamMessage.match(emailRegex) || [];
      const urls = scamMessage.match(urlRegex) || [];
      
      // Prepare service calls with CORRECT endpoints
      const servicePromises = [];
      const serviceResults = {
        basicScam: null,
        breachCheck: null,
        localAnalysis: null
      };

      // 1. Basic Scam Detection (CORRECTED ENDPOINT)
      servicePromises.push(
        fetch('https://remaleh-protect-api.onrender.com/api/scam/comprehensive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: scamMessage })
        })
        .then(response => response.json())
        .then(data => {
          serviceResults.basicScam = data;
        })
        .catch(error => {
          console.error('Basic scam detection failed:', error);
          serviceResults.basicScam = { error: 'Service unavailable' };
        })
      );

      // 2. Breach Check (CORRECTED ENDPOINT - only if emails found)
      if (emails.length > 0) {
        servicePromises.push(
          fetch('https://remaleh-protect-api.onrender.com/api/breach/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emails: emails })
          })
          .then(response => response.json())
          .then(data => {
            serviceResults.breachCheck = data;
          })
          .catch(error => {
            console.error('Breach check failed:', error);
            serviceResults.breachCheck = { error: 'Service unavailable' };
          })
        );
      }

      // 3. Enhanced Local Analysis (Comprehensive)
      serviceResults.localAnalysis = performEnhancedLocalAnalysis(scamMessage, urls, emails);

      // Wait for all service calls to complete
      await Promise.all(servicePromises);

      // Aggregate results
      const aggregatedResult = aggregateScamResults(serviceResults, urls, emails, startTime);
      
      setScamResult(aggregatedResult);

    } catch (error) {
      console.error('Scam analysis error:', error);
      setScamResult('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced Local Analysis Function
  const performEnhancedLocalAnalysis = (text, urls, emails) => {
    const textLower = text.toLowerCase();
    let score = 0;
    const indicators = [];

    // Delivery Scam Detection (Enhanced)
    const deliveryKeywords = [
      'parcel', 'package', 'delivery', 'shipped', 'tracking', 'postal code',
      'held', 'suspended', 'customs', 'warehouse', 'courier', 'fedex', 'dhl',
      'ups', 'auspost', 'australia post', 'postage', 'shipment'
    ];
    
    deliveryKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        score += 15;
        indicators.push(`Delivery scam indicator: "${keyword}"`);
      }
    });

    // Brand Impersonation Detection
    const brands = [
      'auspost', 'australia post', 'ato', 'centrelink', 'medicare', 'telstra',
      'optus', 'vodafone', 'commonwealth bank', 'anz', 'westpac', 'nab',
      'paypal', 'amazon', 'ebay', 'netflix', 'spotify', 'apple', 'google',
      'microsoft', 'facebook', 'instagram', 'twitter'
    ];
    
    brands.forEach(brand => {
      if (textLower.includes(brand)) {
        score += 20;
        indicators.push(`Brand impersonation: "${brand}"`);
      }
    });

    // Urgency Indicators
    const urgencyPhrases = [
      'within 24 hours', 'expires today', 'immediate action', 'urgent',
      'act now', 'limited time', 'expires soon', 'verify now', 'confirm immediately',
      'suspend', 'block', 'freeze', 'close your account'
    ];
    
    urgencyPhrases.forEach(phrase => {
      if (textLower.includes(phrase)) {
        score += 12;
        indicators.push(`Creates false urgency: "${phrase}"`);
      }
    });

    // Financial Fraud Indicators
    const financialKeywords = [
      'bank account', 'credit card', 'social security', 'ssn', 'tax refund',
      'inheritance', 'lottery', 'winner', 'prize', 'million', 'thousand',
      'transfer', 'wire', 'bitcoin', 'cryptocurrency', 'investment'
    ];
    
    financialKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        score += 18;
        indicators.push(`Financial fraud indicator: "${keyword}"`);
      }
    });

    // Suspicious Instructions
    const suspiciousInstructions = [
      'reply with', 'click here', 'download', 'install', 'enable',
      'exit and reopen', 'copy and paste', 'forward this message',
      'don\'t tell anyone', 'keep this secret', 'call this number'
    ];
    
    suspiciousInstructions.forEach(instruction => {
      if (textLower.includes(instruction)) {
        score += 10;
        indicators.push(`Suspicious instruction: "${instruction}"`);
      }
    });

    // URL Analysis (Enhanced)
    urls.forEach(url => {
      const urlLower = url.toLowerCase();
      
      // Suspicious domains
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.buzz', '.click', '.download'];
      suspiciousTlds.forEach(tld => {
        if (urlLower.includes(tld)) {
          score += 35;
          indicators.push(`Highly suspicious domain: ${url}`);
        }
      });

      // Random character domains
      const domain = url.replace(/https?:\/\//, '').split('/')[0];
      if (/^[a-z]{4,8}\.(buzz|tk|ml|ga|cf)/.test(domain.toLowerCase())) {
        score += 30;
        indicators.push(`Random character domain: ${domain}`);
      }

      // URL shorteners
      const shorteners = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly'];
      shorteners.forEach(shortener => {
        if (urlLower.includes(shortener)) {
          score += 15;
          indicators.push(`URL shortener detected: ${shortener}`);
        }
      });
    });

    // Personal Information Requests
    const personalInfoRequests = [
      'password', 'pin', 'ssn', 'social security', 'date of birth',
      'mother\'s maiden name', 'security question', 'account number',
      'routing number', 'cvv', 'security code'
    ];
    
    personalInfoRequests.forEach(request => {
      if (textLower.includes(request)) {
        score += 25;
        indicators.push(`Requests personal information: "${request}"`);
      }
    });

    return {
      score: score,
      indicators: indicators,
      analysis: 'Enhanced local pattern analysis'
    };
  };

  // Result Aggregation Function
  const aggregateScamResults = (serviceResults, urls, emails, startTime) => {
    const endTime = Date.now();
    const analysisTime = endTime - startTime;
    
    let totalScore = 0;
    let allIndicators = [];
    let servicesUsed = [];
    let serviceDetails = [];

    // Process Basic Scam Detection Results
    if (serviceResults.basicScam && !serviceResults.basicScam.error) {
      totalScore += (serviceResults.basicScam.risk_score || 0) * 100;
      servicesUsed.push('✓ Basic Scam Detection');
      if (serviceResults.basicScam.indicators) {
        allIndicators.push(...serviceResults.basicScam.indicators);
      }
      serviceDetails.push(`Basic Scam Analysis: ${serviceResults.basicScam.risk_score || 0} risk score`);
    } else {
      servicesUsed.push('✗ Basic Scam Detection (unavailable)');
    }

    // Process Breach Check Results
    if (serviceResults.breachCheck && !serviceResults.breachCheck.error) {
      if (serviceResults.breachCheck.breached_emails && serviceResults.breachCheck.breached_emails.length > 0) {
        totalScore += 30;
        allIndicators.push(`Compromised emails detected: ${serviceResults.breachCheck.breached_emails.length}`);
      }
      servicesUsed.push('✓ Breach Check');
      serviceDetails.push(`Breach Check: ${serviceResults.breachCheck.breached_emails?.length || 0} compromised emails`);
    } else if (emails.length > 0) {
      servicesUsed.push('✗ Breach Check (unavailable)');
    }

    // Process Local Analysis Results
    if (serviceResults.localAnalysis) {
      totalScore += serviceResults.localAnalysis.score;
      allIndicators.push(...serviceResults.localAnalysis.indicators);
      servicesUsed.push('✓ Enhanced Pattern Analysis');
      serviceDetails.push(`Pattern Analysis: ${serviceResults.localAnalysis.score} threat indicators`);
    }

    // Determine risk level
    let riskLevel, riskColor, riskIcon;
    if (totalScore >= 70) {
      riskLevel = 'HIGH RISK';
      riskColor = '#dc2626';
      riskIcon = '🚨';
    } else if (totalScore >= 40) {
      riskLevel = 'MEDIUM RISK';
      riskColor = '#ea580c';
      riskIcon = '⚠️';
    } else if (totalScore >= 15) {
      riskLevel = 'LOW-MEDIUM RISK';
      riskColor = '#ca8a04';
      riskIcon = '⚡';
    } else {
      riskLevel = 'LOW RISK';
      riskColor = '#16a34a';
      riskIcon = '✅';
    }

    // Generate recommendations
    const recommendations = generateRecommendations(totalScore, allIndicators, urls, emails);

    // Format result
    return `
      <div style="padding: 20px; border-radius: 8px; background: #f8fafc; border-left: 4px solid ${riskColor};">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 24px; margin-right: 10px;">${riskIcon}</span>
          <h3 style="margin: 0; color: ${riskColor}; font-size: 18px;">${riskLevel}</h3>
          <span style="margin-left: 10px; color: #64748b; font-size: 14px;">(Score: ${totalScore.toFixed(0)})</span>
        </div>
        
        <p style="margin: 10px 0; color: #475569; font-size: 14px;">
          ${totalScore >= 70 ? 'This message shows strong indicators of a scam.' : 
            totalScore >= 40 ? 'This message contains several suspicious elements.' :
            totalScore >= 15 ? 'This message has some concerning indicators.' :
            'This message appears to have minimal risk indicators.'}
        </p>

        <div style="margin: 15px 0;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Components Detected:</h4>
          <div style="color: #6b7280; font-size: 13px;">
            ${urls.length > 0 ? `• URLs: ${urls.length} detected` : '• No URLs detected'}<br>
            ${emails.length > 0 ? `• Emails: ${emails.length} detected` : '• No emails detected'}
          </div>
        </div>

        <div style="margin: 15px 0;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Analysis Services Used:</h4>
          <div style="color: #6b7280; font-size: 13px;">
            ${servicesUsed.map(service => `• ${service}`).join('<br>')}
          </div>
        </div>

        ${allIndicators.length > 0 ? `
          <div style="margin: 15px 0;">
            <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Threats Detected:</h4>
            <div style="color: #dc2626; font-size: 13px;">
              ${allIndicators.slice(0, 8).map(indicator => `✗ ${indicator}`).join('<br>')}
              ${allIndicators.length > 8 ? `<br><em>... and ${allIndicators.length - 8} more indicators</em>` : ''}
            </div>
          </div>
        ` : ''}

        <div style="margin: 15px 0;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Security Recommendations:</h4>
          <div style="color: #059669; font-size: 13px;">
            ${recommendations.map(rec => `🛡️ ${rec}`).join('<br>')}
          </div>
        </div>

        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
          Analysis completed in ${analysisTime}ms using ${servicesUsed.filter(s => s.includes('✓')).length} services
        </div>
      </div>
    `;
  };

  // Recommendations Generator
  const generateRecommendations = (score, indicators, urls, emails) => {
    const recommendations = [];

    if (score >= 70) {
      recommendations.push('Do not interact with this message - Multiple high-risk indicators detected');
      if (urls.length > 0) {
        recommendations.push('Avoid clicking the detected URLs - Links identified as dangerous');
      }
      recommendations.push('Verify sender through official channels - Always confirm unexpected messages');
      if (emails.length > 0) {
        recommendations.push('Check if your email has been compromised - Consider changing passwords');
      }
    } else if (score >= 40) {
      recommendations.push('Exercise caution with this message - Several suspicious elements found');
      if (urls.length > 0) {
        recommendations.push('Verify URLs before clicking - Check domain authenticity');
      }
      recommendations.push('Confirm sender identity through alternative means');
    } else if (score >= 15) {
      recommendations.push('Be cautious and verify sender identity');
      if (urls.length > 0) {
        recommendations.push('Check URL destinations before clicking');
      }
      recommendations.push('When in doubt, contact the organization directly');
    } else {
      recommendations.push('Message appears legitimate but always stay vigilant');
      recommendations.push('Continue following good cybersecurity practices');
    }

    return recommendations;
  };

  const handleBreachCheck = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsChecking(true);
    setBreachResult(null);

    try {
      // Simulate API call
      setTimeout(() => {
        const randomBreached = Math.random() > 0.5;
        
        if (randomBreached) {
          setBreachResult({
            breached: true,
            breaches: [
              {
                name: 'ExampleSite',
                domain: 'example.com',
                date: '2023-01-15',
                data: ['Email', 'Password', 'Username']
              },
              {
                name: 'AnotherBreach',
                domain: 'anotherbreach.com',
                date: '2022-08-22',
                data: ['Email', 'Password', 'IP Address']
              }
            ]
          });
        } else {
          setBreachResult({
            breached: false
          });
        }
        
        setIsChecking(false);
      }, 1500);
    } catch (error) {
      console.error('Error checking breaches:', error);
      setIsChecking(false);
    }
  };

  // Cybersecurity knowledge base for rule-based responses
  const cybersecurityKnowledge = {
    passwords: {
      keywords: ['password', 'passwords', 'strong password', 'secure password', 'passphrase', 'password manager'],
      response: `
**Password Protection**

• Use at least 16 characters when possible
• Combine uppercase letters, lowercase letters, numbers, and symbols
• Avoid personal information (birthdays, names, etc.)
• Don't use common words or patterns
• Consider using passphrases (e.g., "KangarooJumping2025!Sydney")
• Use a different password for each account
• Consider using a password manager like LastPass, 1Password, or Bitwarden
• Enable multi-factor authentication (MFA) whenever possible
      `,
      source: 'Expert Knowledge'
    },
    phishing: {
      keywords: ['phishing', 'scam email', 'fake email', 'suspicious email', 'scam text', 'phishing email', 'identify phishing'],
      response: `
**Identifying Phishing Emails and Texts**

• Check the sender's email address carefully for slight misspellings
• Be suspicious of urgent requests requiring immediate action
• Hover over links before clicking to see the actual URL
• Be wary of emails requesting personal information or passwords
• Look for poor grammar and spelling errors
• Be suspicious of unexpected attachments
• Verify requests through official channels (call the company directly)
• Check for generic greetings like "Dear Customer" instead of your name
      `,
      source: 'Expert Knowledge'
    },
    malware: {
      keywords: ['malware', 'virus', 'ransomware', 'spyware', 'trojan', 'adware', 'computer virus'],
      response: `
**Protecting Against Malware**

• Keep your operating system and software updated
• Use reputable antivirus/anti-malware software
• Be careful about downloading files or clicking links
• Only download apps from official app stores
• Back up your important data regularly
• Use a firewall
• Be wary of suspicious email attachments
• Avoid pirated software and media
      `,
      source: 'Expert Knowledge'
    },
    privacy: {
      keywords: ['privacy', 'data privacy', 'online privacy', 'protect privacy', 'privacy settings'],
      response: `
**Protecting Your Online Privacy**

• Review and adjust privacy settings on social media accounts
• Use a VPN when connecting to public Wi-Fi
• Clear your browsing history and cookies regularly
• Use private browsing mode when appropriate
• Be mindful of what you share online
• Use strong, unique passwords for each account
• Consider using privacy-focused browsers and search engines
• Regularly check which apps have access to your data
      `,
      source: 'Expert Knowledge'
    },
    mfa: {
      keywords: ['mfa', 'multi-factor', 'two-factor', '2fa', 'authentication', 'two step verification'],
      response: `
**Multi-Factor Authentication (MFA)**

• MFA adds an extra layer of security beyond just passwords
• Types include: something you know (password), something you have (phone), something you are (fingerprint)
• Authenticator apps (like Google Authenticator) are more secure than SMS
• Enable MFA on all important accounts (email, banking, social media)
• Hardware security keys provide the strongest protection
• Even if your password is compromised, MFA helps protect your account
• Backup your MFA recovery codes in a secure location
      `,
      source: 'Expert Knowledge'
    },
    wifi: {
      keywords: ['wifi', 'wi-fi', 'wireless', 'router', 'network security', 'public wifi'],
      response: `
**Wi-Fi Security Best Practices**

• Change default router passwords and admin credentials
• Use WPA3 encryption if available (at least WPA2)
• Create a strong, unique Wi-Fi password
• Enable the router's firewall
• Keep router firmware updated
• Use a guest network for visitors and IoT devices
• Be cautious when using public Wi-Fi (use a VPN)
• Position your router centrally to minimize signal outside your home
      `,
      source: 'Expert Knowledge'
    },
    breach: {
      keywords: ['data breach', 'breach', 'hacked', 'compromised', 'stolen data', 'leaked'],
      response: `
**Data Breach Response**

• **Change passwords immediately** • **Enable 2FA on all accounts** • **Monitor financial statements** • **Check credit reports** • **Report to relevant authorities** • **Document the incident**

**🛡️ REMALEH GUARDIAN ESCALATION**

This appears to be a serious cybersecurity concern that may require immediate professional assistance. Our cybersecurity experts can provide personalized guidance for your specific situation.

[Contact Remaleh Guardian →](https://www.remaleh.com.au/contact-us)
      `,
      source: 'Expert Knowledge'
    },
    phone: {
      keywords: ['phone safety', 'mobile security', 'smartphone', 'app safety', 'sim swapping'],
      response: `
**Phone & App Safety**

• Keep your phone's operating system updated
• Only download apps from official app stores (Google Play, Apple App Store)
• Review app permissions before installing
• Use screen locks (PIN, password, fingerprint, face recognition)
• Enable remote wipe capabilities
• Be cautious with public Wi-Fi
• Regularly review and uninstall unused apps
• Be aware of SIM swapping attacks - contact your carrier if you lose service unexpectedly

**Real-world example:** Sarah received a text saying her phone service would be suspended. She called her carrier directly and discovered it was a scam attempting SIM swapping.
      `,
      source: 'Expert Knowledge'
    }
  };

  const formatChatMessage = (text) => {
    if (!text) return '';
    
    // Enhanced formatting for better readability
    let formatted = text
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert bullet points
      .replace(/^• /gm, '<br>• ')
      .replace(/^\* /gm, '<br>• ')
      .replace(/^- /gm, '<br>• ')
      // Convert headers
      .replace(/^### (.*$)/gm, '<h4 style="margin: 15px 0 8px 0; color: #374151; font-size: 16px;">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 style="margin: 15px 0 10px 0; color: #1f2937; font-size: 18px;">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 style="margin: 15px 0 10px 0; color: #111827; font-size: 20px;">$1</h2>')
      // Convert links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #21a1ce; text-decoration: underline;">$1</a>')
      // Add spacing after bullet points
      .replace(/• /g, '• ')
      // Clean up extra line breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    
    return formatted;
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Reset error state
    setChatError(false);
    
    // Add user message
    const userMessage = { text: inputMessage, sender: 'user' };
    setChatMessages([...chatMessages, userMessage]);
    
    // Store message for processing
    const messageToProcess = inputMessage;
    
    // Clear input and show typing indicator
    setInputMessage('');
    setIsTyping(true);

    try {
      let responseFound = false;
      let response = '';
      let source = '';
      const lowercaseInput = messageToProcess.toLowerCase();

      // First check against local knowledge base for quick responses
      for (const category in cybersecurityKnowledge) {
        const { keywords, response: categoryResponse, source: categorySource } = cybersecurityKnowledge[category];
        
        // Check each keyword
        for (const keyword of keywords) {
          if (lowercaseInput.includes(keyword.toLowerCase())) {
            response = categoryResponse;
            source = categorySource;
            responseFound = true;
            break;
          }
        }
        
        if (responseFound) break;
      }

      // If no match found in local knowledge base, call backend API
      if (!responseFound) {
        try {
          const apiResponse = await fetch('https://remaleh-protect-api.onrender.com/api/chat/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: messageToProcess }),
          });
          
          if (!apiResponse.ok) {
            throw new Error(`API responded with status: ${apiResponse.status}`);
          }
          
          const data = await apiResponse.json();
          
          if (data.success) {
            response = data.response;
            source = data.source === 'expert_knowledge' ? 'Expert Knowledge' : 'AI Analysis';
            responseFound = true;
          }
        } catch (apiError) {
          console.error("API Error:", apiError);
          // Continue to fallback response if API call fails
        }
      }

      // Fallback response if no match found and API call failed
      if (!responseFound) {
        response = "I don't have specific information about that topic yet. For complex cybersecurity questions, I recommend consulting with a security professional.";
        source = "AI Analysis";
      }

      // Add bot response after a short delay to simulate thinking
      setTimeout(() => {
        const botMessage = { text: response, sender: 'assistant', source };
        setChatMessages(prevMessages => [...prevMessages, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Error processing chat:", error);
      setChatError(true);
      
      // Add error message
      const errorMessage = { 
        text: "Sorry, I encountered an error processing your request. Please try again.", 
        sender: 'assistant', 
        source: "System" 
      };
      setChatMessages(prevMessages => [...prevMessages, errorMessage]);
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm p-4 flex justify-center">
        <img 
          src="/remaleh-logo-full.png" 
          alt="Remaleh" 
          className="h-8 w-auto object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.innerHTML = `
              <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 2L18 9.5L10.5 17L3 9.5L10.5 2Z" fill="#21a1ce"/>
                <path d="M10.5 17L18 24.5L10.5 32L3 24.5L10.5 17Z" fill="#21a1ce"/>
                <path d="M24.5 9.5L32 17L24.5 24.5L17 17L24.5 9.5Z" fill="#21a1ce"/>
                <text x="40" y="20" font-family="Arial" font-size="16" font-weight="bold" fill="#000">Remaleh</text>
              </svg>
            `;
          }}
        />
      </header>

      <div className="bg-gradient-to-br from-[#21a1ce] to-[#1a80a3] text-white text-center py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Stay Safe in Our Connected World</h1>
        <p className="text-xl">Your Digital Well-Being Is Our Paramount Commitment</p>
      </div>

      {activeTab === 'check' && (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center mb-4">
              <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                <MessageSquare className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-bold">Advanced Text Message Analysis</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Comprehensive scam detection using multiple AI services, link analysis, and breach checking
            </p>

            <form onSubmit={handleScamCheck}>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32"
                placeholder="Paste your message here for comprehensive security analysis..."
                value={scamMessage}
                onChange={(e) => setScamMessage(e.target.value)}
              ></textarea>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#21a1ce] to-[#1a80a3] text-white py-3 px-6 rounded-lg font-medium w-full"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing Message...' : 'Analyze Message'}
              </button>
            </form>

            {scamResult && (
              <div className="mt-6">
                <div dangerouslySetInnerHTML={{ __html: scamResult }} />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'passwords' && (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center mb-4">
              <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                <Lock className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-bold">Password Still Safe?</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Check if your email has been involved in any known data breaches
            </p>

            <form onSubmit={handleBreachCheck}>
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

            {breachResult && (
              <div className="mt-6">
                {breachResult.breached ? (
                  <div className="p-4 rounded-lg bg-red-100 border border-red-200">
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-full bg-red-200 mr-3">
                        <AlertCircle className="text-red-500" size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-red-700">Email Found in Data Breaches</h3>
                    </div>
                    <p className="mb-4 text-red-600">
                      Your email was found in {breachResult.breaches.length} known data breach(es).
                    </p>
                    <div className="space-y-3">
                      {breachResult.breaches.map((breach, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <h4 className="font-medium">{breach.name}</h4>
                          <p className="text-sm text-gray-600">Domain: {breach.domain}</p>
                          <p className="text-sm text-gray-600">Date: {breach.date}</p>
                          <p className="text-sm text-gray-600">
                            Compromised data: {breach.data.join(', ')}
                          </p>
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
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-green-100 border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-full bg-green-200 mr-3">
                        <Shield className="text-green-500" size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-green-700">No Breaches Found</h3>
                    </div>
                    <p className="text-green-600">
                      Great news! Your email was not found in any known data breaches.
                    </p>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-medium text-blue-800">Stay Protected:</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Continue using strong, unique passwords</li>
                        <li>• Keep two-factor authentication enabled</li>
                        <li>• Regularly monitor your accounts</li>
                        <li>• Stay informed about new security threats</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'learn' && (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center mb-4">
              <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                <BookOpen className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-bold">Cyber Sensei</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Learn essential cybersecurity skills to protect yourself and your family
            </p>

            {!selectedLearningTopic ? (
              <div className="grid gap-4">
                <div 
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedLearningTopic('passwords')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Lock className="text-[#21a1ce] mr-3" size={24} />
                      <div>
                        <h3 className="font-medium">Password Protection</h3>
                        <p className="text-sm text-gray-600">Learn to create and manage strong passwords</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>

                <div 
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedLearningTopic('phishing')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="text-[#21a1ce] mr-3" size={24} />
                      <div>
                        <h3 className="font-medium">Email & Text Scams</h3>
                        <p className="text-sm text-gray-600">Identify and avoid phishing attempts</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>

                <div 
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedLearningTopic('devices')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="text-[#21a1ce] mr-3" size={24} />
                      <div>
                        <h3 className="font-medium">Device & Home Security</h3>
                        <p className="text-sm text-gray-600">Secure your devices and home network</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>

                <div 
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedLearningTopic('social')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="text-[#21a1ce] mr-3" size={24} />
                      <div>
                        <h3 className="font-medium">Social Media & Privacy</h3>
                        <p className="text-sm text-gray-600">Protect your privacy on social platforms</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>

                <div 
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedLearningTopic('phone')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="text-[#21a1ce] mr-3" size={24} />
                      <div>
                        <h3 className="font-medium">Phone & App Safety</h3>
                        <p className="text-sm text-gray-600">Keep your mobile devices secure</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <button 
                  className="flex items-center text-[#21a1ce] mb-4 hover:underline"
                  onClick={() => setSelectedLearningTopic(null)}
                >
                  <ChevronLeft size={20} className="mr-1" />
                  Back to topics
                </button>

                {selectedLearningTopic === 'passwords' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Password Protection</h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold mb-2">Why Strong Passwords Matter</h4>
                      <p className="text-sm">
                        Passwords are your first line of defense against cybercriminals. A strong password can be the difference between keeping your accounts safe and having your identity stolen.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">Creating Strong Passwords</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Use at least 12-16 characters</p>
                            <p className="text-sm text-gray-600">Longer passwords are exponentially harder to crack</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Mix character types</p>
                            <p className="text-sm text-gray-600">Combine uppercase, lowercase, numbers, and symbols</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Use unique passwords</p>
                            <p className="text-sm text-gray-600">Never reuse passwords across different accounts</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-bold mb-2">Australian Example</h4>
                      <p className="text-sm">
                        Instead of "password123", try "KangarooJumping2025!Sydney" - it's long, memorable, and includes Australian references that are meaningful to you.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">Password Managers</h4>
                      <p className="text-sm mb-3">
                        Password managers generate and store unique passwords for all your accounts. Popular options include:
                      </p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• LastPass</li>
                        <li>• 1Password</li>
                        <li>• Bitwarden (free option)</li>
                        <li>• Dashlane</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-bold mb-2">What NOT to Do</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Don't use personal information (birthdays, names, addresses)</li>
                        <li>• Don't use common words or patterns</li>
                        <li>• Don't share passwords with others</li>
                        <li>• Don't write passwords on sticky notes</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedLearningTopic === 'phishing' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Email & Text Scams</h3>
                    
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-bold mb-2">What is Phishing?</h4>
                      <p className="text-sm">
                        Phishing is when criminals send fake emails or texts pretending to be from legitimate companies to steal your personal information, passwords, or money.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">Warning Signs to Look For</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="bg-red-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Urgent language</p>
                            <p className="text-sm text-gray-600">"Act now!" "Your account will be closed!" "Immediate action required!"</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-red-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Generic greetings</p>
                            <p className="text-sm text-gray-600">"Dear Customer" instead of your actual name</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-red-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Suspicious links</p>
                            <p className="text-sm text-gray-600">Hover over links to see where they really go</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-red-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Poor grammar and spelling</p>
                            <p className="text-sm text-gray-600">Legitimate companies proofread their communications</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-bold mb-2">Australian Example</h4>
                      <p className="text-sm">
                        "Your ATO tax refund is ready! Click here to claim $1,247.50 immediately or it will expire in 24 hours." 
                        <br /><br />
                        <strong>Red flags:</strong> The ATO doesn't send refund notifications via email, uses urgent language, and asks you to click links.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">How to Verify Suspicious Messages</h4>
                      <div className="space-y-2 text-sm">
                        <p>• Contact the company directly using official phone numbers</p>
                        <p>• Log into your account through the official website (not email links)</p>
                        <p>• Check the sender's email address carefully for misspellings</p>
                        <p>• Ask yourself: "Was I expecting this message?"</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold mb-2">What to Do if You've Been Targeted</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Don't click any links or download attachments</li>
                        <li>• Report the message to the company being impersonated</li>
                        <li>• Forward phishing emails to the ACCC's Scamwatch</li>
                        <li>• If you clicked a link, change your passwords immediately</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedLearningTopic === 'devices' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Device & Home Security</h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold mb-2">Why Device Security Matters</h4>
                      <p className="text-sm">
                        Your devices contain personal photos, banking apps, emails, and more. Securing them protects your entire digital life.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">Computer Security</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Keep software updated</p>
                            <p className="text-sm text-gray-600">Enable automatic updates for your operating system and apps</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Use antivirus software</p>
                            <p className="text-sm text-gray-600">Windows Defender is built-in and effective for most users</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Enable firewall</p>
                            <p className="text-sm text-gray-600">Your computer's firewall blocks unauthorized access</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">Home Wi-Fi Security</h4>
                      <div className="space-y-2 text-sm">
                        <p>• Change default router passwords</p>
                        <p>• Use WPA3 encryption (or at least WPA2)</p>
                        <p>• Create a strong Wi-Fi password</p>
                        <p>• Set up a guest network for visitors</p>
                        <p>• Keep router firmware updated</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-bold mb-2">Backup Your Data</h4>
                      <p className="text-sm">
                        Follow the 3-2-1 rule: 3 copies of important data, on 2 different types of media, with 1 copy stored offsite (like cloud storage).
                      </p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-bold mb-2">Public Wi-Fi Safety</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Avoid accessing sensitive accounts on public Wi-Fi</li>
                        <li>• Use a VPN when possible</li>
                        <li>• Turn off auto-connect to Wi-Fi networks</li>
                        <li>• Use your phone's hotspot instead when possible</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedLearningTopic === 'social' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Social Media & Privacy</h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold mb-2">Your Digital Footprint</h4>
                      <p className="text-sm">
                        Everything you post online creates a permanent digital footprint. Even "private" posts can become public through data breaches or account compromises.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">Privacy Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Review privacy settings regularly</p>
                            <p className="text-sm text-gray-600">Social media platforms often change their privacy policies</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Limit who can see your posts</p>
                            <p className="text-sm text-gray-600">Set posts to "Friends only" rather than "Public"</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Control who can find you</p>
                            <p className="text-sm text-gray-600">Limit search visibility and friend requests</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">What Not to Share</h4>
                      <div className="space-y-2 text-sm">
                        <p>• Full birth dates (use just day/month)</p>
                        <p>• Home addresses or specific locations</p>
                        <p>• Travel plans while you're away</p>
                        <p>• Photos of important documents</p>
                        <p>• Financial information</p>
                        <p>• Children's full names and schools</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-bold mb-2">Think Before You Post</h4>
                      <p className="text-sm">
                        Ask yourself: "Would I be comfortable if my employer, family, or a stranger saw this?" If not, don't post it.
                      </p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-bold mb-2">Recognizing Social Media Scams</h4>
                      <ul className="text-sm space-y-1">
                        <li>• "You've won a prize!" messages</li>
                        <li>• Fake friend requests from people you already know</li>
                        <li>• "This video is going viral!" links</li>
                        <li>• Requests for money from "friends" in trouble</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedLearningTopic === 'phone' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Phone & App Safety</h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold mb-2">Your Phone is a Computer</h4>
                      <p className="text-sm">
                        Modern smartphones contain more personal information than most computers. They need the same level of security protection.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">Basic Phone Security</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Use a strong lock screen</p>
                            <p className="text-sm text-gray-600">PIN, password, fingerprint, or face recognition</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Keep your OS updated</p>
                            <p className="text-sm text-gray-600">Enable automatic updates for security patches</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Enable remote wipe</p>
                            <p className="text-sm text-gray-600">So you can erase your phone if it's lost or stolen</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">App Safety Tips</h4>
                      <div className="space-y-2 text-sm">
                        <p>• Only download apps from official stores (Google Play, Apple App Store)</p>
                        <p>• Read app permissions before installing</p>
                        <p>• Regularly review and uninstall unused apps</p>
                        <p>• Be cautious with apps requesting excessive permissions</p>
                        <p>• Keep apps updated</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-bold mb-2">Real-world Example: SIM Swapping</h4>
                      <p className="text-sm">
                        Sarah received a text saying her Telstra service would be suspended. She called Telstra directly and discovered it was a scam. The criminals were trying to get her to provide information that could be used for SIM swapping - taking control of her phone number.
                      </p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-bold mb-2">Warning Signs of Phone Scams</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Unexpected texts about account problems</li>
                        <li>• Calls claiming to be from tech support</li>
                        <li>• Apps asking for unnecessary permissions</li>
                        <li>• Sudden loss of phone service (possible SIM swap)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">Mobile Device Security</h4>
                      <div className="space-y-2 text-sm">
                        <p>• Use two-factor authentication on important accounts</p>
                        <p>• Be cautious on public Wi-Fi</p>
                        <p>• Don't leave your phone unattended in public</p>
                        <p>• Consider using a VPN for sensitive activities</p>
                        <p>• Backup your phone data regularly</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'help' && (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center mb-4">
              <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                <MessageSquare className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-bold">Help Me!</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Get instant help with cybersecurity questions from our AI assistant
            </p>

            <div className="border border-gray-200 rounded-lg h-96 flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageSquare className="mx-auto mb-2 text-gray-300" size={48} />
                    <p>Ask me anything about cybersecurity!</p>
                    <p className="text-sm mt-2">Try asking about passwords, phishing, or device security.</p>
                  </div>
                )}
                
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-[#21a1ce] text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.sender === 'assistant' && (
                        <div className="flex items-center mb-1">
                          <Shield className="w-4 h-4 mr-1 text-[#21a1ce]" />
                          <span className="text-xs text-[#21a1ce] font-medium">
                            {message.source || 'AI Assistant'}
                          </span>
                        </div>
                      )}
                      <div 
                        className="text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: message.sender === 'assistant' ? formatChatMessage(message.text) : message.text 
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-1 text-[#21a1ce]" />
                        <span className="text-xs text-[#21a1ce] font-medium mr-2">AI Assistant</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleChatSubmit} className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your cybersecurity question..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#21a1ce]"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !inputMessage.trim()}
                    className="bg-[#21a1ce] text-white px-4 py-2 rounded-lg hover:bg-[#1a80a3] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                {chatError && (
                  <p className="text-red-500 text-sm mt-2">
                    Connection error. Please check your internet and try again.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button
            onClick={() => handleTabChange('check')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'check' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
            }`}
          >
            <MessageSquare size={20} />
            <span className="text-xs mt-1">Check that Text</span>
          </button>
          
          <button
            onClick={() => handleTabChange('passwords')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'passwords' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
            }`}
          >
            <Lock size={20} />
            <span className="text-xs mt-1">Password Still Safe?</span>
          </button>
          
          <button
            onClick={() => handleTabChange('learn')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'learn' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
            }`}
          >
            <BookOpen size={20} />
            <span className="text-xs mt-1">Cyber Sensei</span>
          </button>
          
          <button
            onClick={() => handleTabChange('help')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'help' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
            }`}
          >
            <Shield size={20} />
            <span className="text-xs mt-1">Help Me!</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-8">
        <div className="flex items-center justify-center mb-2">
          <Shield className="text-[#21a1ce] mr-2" size={20} />
          <span className="font-medium">Remaleh - Your Digital Guardian</span>
        </div>
        <p className="text-sm text-gray-400">
          Protecting Australian families in the digital world
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Visit our blog at <a href="https://www.remaleh.com.au/blog" className="text-[#21a1ce] hover:underline">remaleh.com.au/blog</a> for more cybersecurity tips
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Copyright © 2025 Remaleh
        </p>
      </footer>
    </div>
  );
}

export default App;

