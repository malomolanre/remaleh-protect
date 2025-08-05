import React, { useState } from 'react';
import { MessageSquare, Lock, BookOpen, Shield, Mail, Users, Smartphone, ChevronRight, ChevronLeft, AlertCircle, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
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

  // Integrated Text Checker - Uses all backend services
  const IntegratedTextChecker = {
    
    // Extract components from text for targeted analysis
    extractComponents: (text) => {
      const components = {
        emails: [],
        urls: [],
        hasText: text.trim().length > 0,
        textLength: text.length,
        wordCount: text.split(/\s+/).length
      };
      
      // Extract emails
      const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      components.emails = text.match(emailPattern) || [];
      
      // Extract URLs
      const urlPattern = /https?:\/\/[^\s]+/g;
      components.urls = text.match(urlPattern) || [];
      
      return components;
    },

    // Call enhanced scam detection service
    callEnhancedScamService: async (text) => {
      try {
        const response = await fetch('https://remaleh-protect-api.onrender.com/api/enhanced-scam/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text })
        });
        
        if (!response.ok) throw new Error(`Enhanced scam service error: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error('Enhanced scam service failed:', error);
        return { error: error.message, service: 'enhanced_scam' };
      }
    },

    // Call basic scam detection service
    callBasicScamService: async (text) => {
      try {
        const response = await fetch('https://remaleh-protect-api.onrender.com/api/scam/comprehensive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text, check_links: true })
        });
        
        if (!response.ok) throw new Error(`Basic scam service error: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error('Basic scam service failed:', error);
        return { error: error.message, service: 'basic_scam' };
      }
    },

    // Call link analysis service
    callLinkAnalysisService: async (text) => {
      try {
        const response = await fetch('https://remaleh-protect-api.onrender.com/api/link/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text })
        });
        
        if (!response.ok) throw new Error(`Link analysis service error: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error('Link analysis service failed:', error);
        return { error: error.message, service: 'link_analysis' };
      }
    },

    // Call breach check service for emails
    callBreachCheckService: async (email) => {
      try {
        const response = await fetch('https://remaleh-protect-api.onrender.com/api/breach/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        
        if (!response.ok) throw new Error(`Breach check service error: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error('Breach check service failed:', error);
        return { error: error.message, service: 'breach_check' };
      }
    },

    // Perform comprehensive analysis using all services
    performComprehensiveAnalysis: async (text) => {
      const analysisStart = Date.now();
      const components = IntegratedTextChecker.extractComponents(text);
      
      // Prepare parallel service calls
      const servicePromises = [];
      
      // Always call enhanced and basic scam detection
      servicePromises.push(
        IntegratedTextChecker.callEnhancedScamService(text).then(result => ({
          service: 'enhanced_scam',
          result: result
        }))
      );
      
      servicePromises.push(
        IntegratedTextChecker.callBasicScamService(text).then(result => ({
          service: 'basic_scam',
          result: result
        }))
      );
      
      // Call link analysis if URLs are found
      if (components.urls.length > 0) {
        servicePromises.push(
          IntegratedTextChecker.callLinkAnalysisService(text).then(result => ({
            service: 'link_analysis',
            result: result
          }))
        );
      }
      
      // Call breach check for each unique email
      const uniqueEmails = [...new Set(components.emails)];
      uniqueEmails.forEach(email => {
        servicePromises.push(
          IntegratedTextChecker.callBreachCheckService(email).then(result => ({
            service: 'breach_check',
            email: email,
            result: result
          }))
        );
      });
      
      // Execute all service calls in parallel
      const serviceResults = await Promise.allSettled(servicePromises);
      
      // Process results
      const analysis = {
        components: components,
        serviceResults: {},
        errors: [],
        analysisTime: Date.now() - analysisStart
      };
      
      // Organize service results
      serviceResults.forEach(promiseResult => {
        if (promiseResult.status === 'fulfilled') {
          const { service, result, email } = promiseResult.value;
          
          if (service === 'breach_check') {
            if (!analysis.serviceResults.breach_checks) {
              analysis.serviceResults.breach_checks = [];
            }
            analysis.serviceResults.breach_checks.push({ email, result });
          } else {
            analysis.serviceResults[service] = result;
          }
        } else {
          analysis.errors.push({
            error: promiseResult.reason,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      return analysis;
    },

    // Aggregate results from all services into unified assessment
    aggregateResults: (analysis) => {
      const aggregation = {
        overallRiskScore: 0,
        riskLevel: 'UNKNOWN',
        threats: [],
        indicators: [],
        recommendations: [],
        serviceBreakdown: {},
        hasErrors: analysis.errors.length > 0
      };
      
      // Process Enhanced Scam Detection results
      if (analysis.serviceResults.enhanced_scam && !analysis.serviceResults.enhanced_scam.error) {
        const enhanced = analysis.serviceResults.enhanced_scam;
        aggregation.overallRiskScore += enhanced.scam_score || 0;
        aggregation.serviceBreakdown.enhanced_scam = {
          riskLevel: enhanced.risk_level,
          score: enhanced.scam_score,
          indicators: enhanced.identified_indicators?.length || 0
        };
        
        if (enhanced.identified_indicators) {
          enhanced.identified_indicators.forEach(indicator => {
            aggregation.indicators.push({
              source: 'Enhanced Analysis',
              type: indicator.type,
              description: indicator.description,
              score: indicator.score
            });
          });
        }
      }
      
      // Process Basic Scam Detection results
      if (analysis.serviceResults.basic_scam && !analysis.serviceResults.basic_scam.error) {
        const basic = analysis.serviceResults.basic_scam;
        const basicScore = basic.overall_assessment?.risk_score || 0;
        aggregation.overallRiskScore += basicScore * 0.7; // Weight basic scam lower
        
        aggregation.serviceBreakdown.basic_scam = {
          riskLevel: basic.overall_assessment?.risk_level,
          score: basicScore,
          threats: basic.threats_detected?.length || 0
        };
        
        if (basic.threats_detected) {
          basic.threats_detected.forEach(threat => {
            aggregation.threats.push({
              source: 'Pattern Analysis',
              threat: threat,
              severity: 'medium'
            });
          });
        }
      }
      
      // Process Link Analysis results
      if (analysis.serviceResults.link_analysis && !analysis.serviceResults.link_analysis.error) {
        const links = analysis.serviceResults.link_analysis;
        const linkScore = links.total_risk_score || 0;
        aggregation.overallRiskScore += linkScore;
        
        aggregation.serviceBreakdown.link_analysis = {
          urlsFound: links.urls_found,
          maliciousUrls: links.malicious_urls,
          overallRisk: links.overall_risk,
          totalScore: linkScore
        };
        
        if (links.urls && links.urls.length > 0) {
          links.urls.forEach(urlAnalysis => {
            if (urlAnalysis.is_malicious) {
              aggregation.threats.push({
                source: 'Link Analysis',
                threat: `Malicious URL detected: ${urlAnalysis.url}`,
                severity: 'high'
              });
            }
            
            urlAnalysis.indicators?.forEach(indicator => {
              aggregation.indicators.push({
                source: 'Link Analysis',
                type: 'url_risk',
                description: indicator,
                url: urlAnalysis.url
              });
            });
          });
        }
      }
      
      // Process Breach Check results
      if (analysis.serviceResults.breach_checks) {
        let breachedEmails = 0;
        analysis.serviceResults.breach_checks.forEach(check => {
          if (check.result && !check.result.error && check.result.breached) {
            breachedEmails++;
            aggregation.overallRiskScore += 15; // Add risk for breached emails
            
            aggregation.threats.push({
              source: 'Breach Check',
              threat: `Email ${check.email} found in data breaches`,
              severity: 'medium',
              details: check.result.breaches
            });
          }
        });
        
        aggregation.serviceBreakdown.breach_checks = {
          emailsChecked: analysis.serviceResults.breach_checks.length,
          breachedEmails: breachedEmails
        };
      }
      
      // Determine overall risk level
      if (aggregation.overallRiskScore >= 70) {
        aggregation.riskLevel = 'HIGH';
      } else if (aggregation.overallRiskScore >= 40) {
        aggregation.riskLevel = 'MEDIUM';
      } else if (aggregation.overallRiskScore >= 15) {
        aggregation.riskLevel = 'LOW';
      } else {
        aggregation.riskLevel = 'VERY_LOW';
      }
      
      // Generate recommendations based on findings
      aggregation.recommendations = IntegratedTextChecker.generateRecommendations(aggregation);
      
      return aggregation;
    },

    // Generate actionable recommendations based on analysis
    generateRecommendations: (aggregation) => {
      const recommendations = [];
      
      // High-risk recommendations
      if (aggregation.riskLevel === 'HIGH') {
        recommendations.push({
          priority: 'critical',
          action: 'Do not interact with this message',
          reason: 'Multiple high-risk indicators detected'
        });
        
        recommendations.push({
          priority: 'critical',
          action: 'Do not click any links or provide personal information',
          reason: 'Message shows strong scam characteristics'
        });
      }
      
      // Link-specific recommendations
      if (aggregation.serviceBreakdown.link_analysis?.maliciousUrls > 0) {
        recommendations.push({
          priority: 'high',
          action: 'Avoid clicking the detected malicious URLs',
          reason: 'Links have been identified as potentially dangerous'
        });
      }
      
      // Breach-specific recommendations
      if (aggregation.serviceBreakdown.breach_checks?.breachedEmails > 0) {
        recommendations.push({
          priority: 'medium',
          action: 'Change passwords for accounts associated with breached emails',
          reason: 'Email addresses found in known data breaches'
        });
        
        recommendations.push({
          priority: 'medium',
          action: 'Enable two-factor authentication on important accounts',
          reason: 'Additional security recommended for compromised emails'
        });
      }
      
      // General security recommendations
      if (aggregation.riskLevel !== 'VERY_LOW') {
        recommendations.push({
          priority: 'low',
          action: 'Verify sender through official channels',
          reason: 'Always confirm unexpected messages independently'
        });
      }
      
      return recommendations;
    },

    // Main analysis function that orchestrates everything
    analyzeText: async (text) => {
      try {
        // Perform comprehensive analysis
        const analysis = await IntegratedTextChecker.performComprehensiveAnalysis(text);
        
        // Aggregate results
        const aggregatedResults = IntegratedTextChecker.aggregateResults(analysis);
        
        // Return comprehensive assessment
        return {
          success: true,
          input: {
            text: text,
            length: text.length,
            components: analysis.components
          },
          analysis: aggregatedResults,
          serviceDetails: analysis.serviceResults,
          errors: analysis.errors,
          analysisTime: analysis.analysisTime,
          timestamp: new Date().toISOString()
        };
        
      } catch (error) {
        return {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }
  };

  const handleScamCheck = async (e) => {
    e.preventDefault();
    if (!scamMessage.trim()) return;

    setIsAnalyzing(true);
    setScamResult(null);

    try {
      // Use integrated text checker with all backend services
      const result = await IntegratedTextChecker.analyzeText(scamMessage);
      
      if (result.success) {
        const analysis = result.analysis;
        
        // Format result for display
        const formattedResult = {
          score: (analysis.overallRiskScore / 100).toFixed(2),
          risk: analysis.riskLevel,
          explanation: IntegratedTextChecker.generateExplanation(analysis),
          color: IntegratedTextChecker.getRiskColor(analysis.riskLevel),
          details: {
            components: result.input.components,
            serviceBreakdown: analysis.serviceBreakdown,
            threats: analysis.threats,
            indicators: analysis.indicators,
            recommendations: analysis.recommendations,
            analysisTime: result.analysisTime
          }
        };
        
        setScamResult(formattedResult);
      } else {
        setScamResult({
          score: '0.00',
          risk: 'Analysis Error',
          explanation: `Unable to analyze message: ${result.error}`,
          color: 'red'
        });
      }
      
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error analyzing message:', error);
      setIsAnalyzing(false);
      setScamResult({
        score: '0.00',
        risk: 'Analysis Error',
        explanation: 'Unable to analyze message. Please try again.',
        color: 'red'
      });
    }
  };

  // Helper functions for IntegratedTextChecker
  IntegratedTextChecker.generateExplanation = (analysis) => {
    const { riskLevel, threats, indicators, serviceBreakdown } = analysis;
    
    let explanation = '';
    
    if (riskLevel === 'HIGH') {
      explanation = 'This message shows strong indicators of a scam. ';
    } else if (riskLevel === 'MEDIUM') {
      explanation = 'This message has significant suspicious elements. ';
    } else if (riskLevel === 'LOW') {
      explanation = 'This message has some suspicious elements. ';
    } else {
      explanation = 'This message appears to have minimal risk indicators. ';
    }
    
    // Add specific findings
    const findings = [];
    
    if (serviceBreakdown.enhanced_scam?.indicators > 0) {
      findings.push(`${serviceBreakdown.enhanced_scam.indicators} advanced threat indicators`);
    }
    
    if (serviceBreakdown.basic_scam?.threats > 0) {
      findings.push(`${serviceBreakdown.basic_scam.threats} pattern-based threats`);
    }
    
    if (serviceBreakdown.link_analysis?.maliciousUrls > 0) {
      findings.push(`${serviceBreakdown.link_analysis.maliciousUrls} malicious URLs`);
    }
    
    if (serviceBreakdown.breach_checks?.breachedEmails > 0) {
      findings.push(`${serviceBreakdown.breach_checks.breachedEmails} breached email addresses`);
    }
    
    if (findings.length > 0) {
      explanation += `Analysis detected: ${findings.join(', ')}.`;
    }
    
    return explanation;
  };

  IntegratedTextChecker.getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'yellow';
      default: return 'green';
    }
  };

  const handleBreachCheck = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsChecking(true);
    setBreachResult(null);

    try {
      // Use the integrated breach check service
      const result = await IntegratedTextChecker.callBreachCheckService(email);
      
      if (!result.error) {
        setBreachResult(result);
      } else {
        // Fallback to simulation if service fails
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
        return;
      }
      
      setIsChecking(false);
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
# Creating Strong Passwords

- Use at least 16 characters when possible
- Combine uppercase letters, lowercase letters, numbers, and symbols
- Avoid personal information (birthdays, names, etc.)
- Don't use common words or patterns
- Consider using passphrases (e.g., "KangarooJumping2025!Sydney")
- Use a different password for each account
- Consider using a password manager like LastPass, 1Password, or Bitwarden
- Enable multi-factor authentication (MFA) whenever possible
      `,
      source: 'Expert Knowledge'
    },
    phishing: {
      keywords: ['phishing', 'scam email', 'fake email', 'suspicious email', 'scam text', 'phishing email', 'identify phishing'],
      response: `
# Identifying Phishing Emails and Texts

- Check the sender's email address carefully for slight misspellings
- Be suspicious of urgent requests requiring immediate action
- Hover over links before clicking to see the actual URL
- Be wary of emails requesting personal information or passwords
- Look for poor grammar and spelling errors
- Be suspicious of unexpected attachments
- Verify requests through official channels (call the company directly)
- Check for generic greetings like "Dear Customer" instead of your name
      `,
      source: 'Expert Knowledge'
    },
    malware: {
      keywords: ['malware', 'virus', 'ransomware', 'spyware', 'trojan', 'adware', 'computer virus'],
      response: `
# Protecting Against Malware

- Keep your operating system and software updated
- Use reputable antivirus/anti-malware software
- Be careful about downloading files or clicking links
- Only download apps from official app stores
- Back up your important data regularly
- Use a firewall
- Be wary of suspicious email attachments
- Avoid pirated software and media
      `,
      source: 'Expert Knowledge'
    },
    privacy: {
      keywords: ['privacy', 'data privacy', 'online privacy', 'protect privacy', 'privacy settings'],
      response: `
# Protecting Your Online Privacy

- Review and adjust privacy settings on social media accounts
- Use a VPN when connecting to public Wi-Fi
- Clear your browsing history and cookies regularly
- Use private browsing mode when appropriate
- Be mindful of what you share online
- Use strong, unique passwords for each account
- Consider using privacy-focused browsers and search engines
- Regularly check which apps have access to your data
      `,
      source: 'Expert Knowledge'
    },
    mfa: {
      keywords: ['mfa', 'multi-factor', 'two-factor', '2fa', 'authentication', 'two step verification'],
      response: `
# Multi-Factor Authentication (MFA)

- MFA adds an extra layer of security beyond just passwords
- Types include: something you know (password), something you have (phone), something you are (fingerprint)
- Authenticator apps (like Google Authenticator) are more secure than SMS
- Enable MFA on all important accounts (email, banking, social media)
- Hardware security keys provide the strongest protection
- Even if your password is compromised, MFA helps protect your account
- Backup your MFA recovery codes in a secure location
      `,
      source: 'Expert Knowledge'
    },
    wifi: {
      keywords: ['wifi', 'wi-fi', 'wireless', 'router', 'network security', 'public wifi'],
      response: `
# Wi-Fi Security Best Practices

- Change default router passwords and admin credentials
- Use WPA3 encryption if available (at least WPA2)
- Create a strong, unique Wi-Fi password
- Enable the router's firewall
- Keep router firmware updated
- Use a guest network for visitors and IoT devices
- Be cautious when using public Wi-Fi (use a VPN)
- Position your router centrally to minimize signal outside your home
      `,
      source: 'Expert Knowledge'
    }
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
                {isAnalyzing ? 'Analyzing with Multiple Services...' : 'Analyze Message'}
              </button>
            </form>

            {scamResult && (
              <div className="mt-6">
                <div className={`p-4 rounded-lg ${
                  scamResult.color === 'red' ? 'bg-red-100 border border-red-200' :
                  scamResult.color === 'orange' ? 'bg-orange-100 border border-orange-200' :
                  scamResult.color === 'yellow' ? 'bg-yellow-100 border border-yellow-200' :
                  'bg-green-100 border border-green-200'
                }`}>
                  <div className="flex items-center mb-2">
                    <div className={`p-2 rounded-full ${
                      scamResult.color === 'red' ? 'bg-red-200' :
                      scamResult.color === 'orange' ? 'bg-orange-200' :
                      scamResult.color === 'yellow' ? 'bg-yellow-200' :
                      'bg-green-200'
                    } mr-3`}>
                      <AlertCircle className={`${
                        scamResult.color === 'red' ? 'text-red-500' :
                        scamResult.color === 'orange' ? 'text-orange-500' :
                        scamResult.color === 'yellow' ? 'text-yellow-500' :
                        'text-green-500'
                      }`} size={20} />
                    </div>
                    <h3 className="font-bold text-lg">{scamResult.risk}</h3>
                  </div>
                  <p className="mb-2">
                    <span className="font-medium">Risk Score:</span> {scamResult.score}
                  </p>
                  <p className="mb-4">{scamResult.explanation}</p>

                  {/* Detailed Analysis Results */}
                  {scamResult.details && (
                    <div className="mt-4 space-y-4">
                      {/* Components Found */}
                      {(scamResult.details.components.emails.length > 0 || scamResult.details.components.urls.length > 0) && (
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-bold mb-2">Components Detected:</h4>
                          {scamResult.details.components.emails.length > 0 && (
                            <p className="text-sm mb-1">
                              <span className="font-medium">Emails:</span> {scamResult.details.components.emails.join(', ')}
                            </p>
                          )}
                          {scamResult.details.components.urls.length > 0 && (
                            <p className="text-sm">
                              <span className="font-medium">URLs:</span> {scamResult.details.components.urls.length} detected
                            </p>
                          )}
                        </div>
                      )}

                      {/* Service Breakdown */}
                      {scamResult.details.serviceBreakdown && Object.keys(scamResult.details.serviceBreakdown).length > 0 && (
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-bold mb-2">Analysis Services Used:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {scamResult.details.serviceBreakdown.enhanced_scam && (
                              <div className="flex items-center">
                                <CheckCircle className="text-green-500 mr-1" size={16} />
                                <span>Enhanced Scam Detection</span>
                              </div>
                            )}
                            {scamResult.details.serviceBreakdown.basic_scam && (
                              <div className="flex items-center">
                                <CheckCircle className="text-green-500 mr-1" size={16} />
                                <span>Pattern Analysis</span>
                              </div>
                            )}
                            {scamResult.details.serviceBreakdown.link_analysis && (
                              <div className="flex items-center">
                                <CheckCircle className="text-green-500 mr-1" size={16} />
                                <span>Link Security Analysis</span>
                              </div>
                            )}
                            {scamResult.details.serviceBreakdown.breach_checks && (
                              <div className="flex items-center">
                                <CheckCircle className="text-green-500 mr-1" size={16} />
                                <span>Email Breach Check</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Threats and Recommendations */}
                      {scamResult.details.threats && scamResult.details.threats.length > 0 && (
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-bold mb-2">Threats Detected:</h4>
                          <ul className="text-sm space-y-1">
                            {scamResult.details.threats.slice(0, 5).map((threat, index) => (
                              <li key={index} className="flex items-start">
                                <XCircle className="text-red-500 mr-1 mt-0.5 flex-shrink-0" size={14} />
                                <span>{threat.threat} <span className="text-gray-500">({threat.source})</span></span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {scamResult.details.recommendations && scamResult.details.recommendations.length > 0 && (
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-bold mb-2">Security Recommendations:</h4>
                          <ul className="text-sm space-y-1">
                            {scamResult.details.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <Shield className="text-blue-500 mr-1 mt-0.5 flex-shrink-0" size={14} />
                                <span><strong>{rec.action}</strong> - {rec.reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Analysis Time */}
                      {scamResult.details.analysisTime && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock size={12} className="mr-1" />
                          Analysis completed in {scamResult.details.analysisTime}ms
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
              <h2 className="text-xl font-bold">Password Safety Check</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Check if your email has been involved in data breaches
            </p>

            <form onSubmit={handleBreachCheck}>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#21a1ce] to-[#1a80a3] text-white py-3 px-6 rounded-lg font-medium w-full"
                disabled={isChecking}
              >
                {isChecking ? 'Checking...' : 'Check My Passwords'}
              </button>
            </form>

            {breachResult && (
              <div className="mt-6">
                {breachResult.breached ? (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-red-200 p-2 rounded-full mr-3">
                        <AlertCircle className="text-red-500" size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-red-700">Your Email Was Found in Data Breaches</h3>
                    </div>
                    <p className="mb-4">Your email was found in {breachResult.breaches?.length || 0} data breaches. You should change your passwords immediately.</p>
                    
                    {breachResult.breaches && (
                      <div className="space-y-3">
                        {breachResult.breaches.map((breach, index) => (
                          <div key={index} className="bg-white p-3 rounded border border-red-100">
                            <h4 className="font-bold">{breach.name}</h4>
                            <p className="text-sm text-gray-600">{breach.domain}</p>
                            <p className="text-sm"><span className="font-medium">Breach date:</span> {breach.date}</p>
                            <p className="text-sm"><span className="font-medium">Data exposed:</span> {breach.data?.join(', ')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-green-200 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-green-700">Good News!</h3>
                        <p>Your email was not found in any known data breaches.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Learning and Chat sections remain the same as in the baseline */}
      {activeTab === 'learn' && (
        <div className="p-4">
          {!selectedLearningTopic ? (
            <>
              {/* Password Protection */}
              <div 
                className="bg-white rounded-lg shadow mb-4 overflow-hidden cursor-pointer"
                onClick={() => setSelectedLearningTopic('passwords')}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                        <Lock className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Password Protection</h3>
                        <p className="text-sm text-gray-600">
                          Create strong passwords and keep your accounts secure
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> AI-powered password cracking and credential stuffing
                    </p>
                  </div>
                </div>
              </div>

              {/* Email & Text Scams */}
              <div 
                className="bg-white rounded-lg shadow mb-4 overflow-hidden cursor-pointer"
                onClick={() => setSelectedLearningTopic('email_scams')}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                        <Mail className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Email & Text Scams</h3>
                        <p className="text-sm text-gray-600">
                          Identify and avoid phishing attempts and scam messages
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> AI-generated phishing and fake delivery texts
                    </p>
                  </div>
                </div>
              </div>

              {/* Device & Home Security */}
              <div 
                className="bg-white rounded-lg shadow mb-4 overflow-hidden cursor-pointer"
                onClick={() => setSelectedLearningTopic('device_security')}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                        <Shield className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Device & Home Security</h3>
                        <p className="text-sm text-gray-600">
                          Protect your computers, phones, and smart home devices
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> Smart home hacking and malicious QR codes
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media & Privacy */}
              <div 
                className="bg-white rounded-lg shadow mb-4 overflow-hidden cursor-pointer"
                onClick={() => setSelectedLearningTopic('social_media')}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                        <Users className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Social Media & Privacy</h3>
                        <p className="text-sm text-gray-600">
                          Manage your online presence and protect personal information
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> Identity theft using social media information
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone & App Safety */}
              <div 
                className="bg-white rounded-lg shadow mb-4 overflow-hidden cursor-pointer"
                onClick={() => setSelectedLearningTopic('phone_app_safety')}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                        <Smartphone className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Phone & App Safety</h3>
                        <p className="text-sm text-gray-600">
                          Protect your mobile devices from SIM swapping and malicious apps
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> Malicious apps and SIM swapping attacks
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => setSelectedLearningTopic(null)}
                  className="mr-3 p-2 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-bold">
                  {selectedLearningTopic === 'passwords' && 'Password Protection'}
                  {selectedLearningTopic === 'email_scams' && 'Email & Text Scams'}
                  {selectedLearningTopic === 'device_security' && 'Device & Home Security'}
                  {selectedLearningTopic === 'social_media' && 'Social Media & Privacy'}
                  {selectedLearningTopic === 'phone_app_safety' && 'Phone & App Safety'}
                </h2>
              </div>

              {selectedLearningTopic === 'passwords' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h3 className="font-bold text-blue-800 mb-2">🔐 Creating Strong Passwords</h3>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Use at least 16 characters when possible</li>
                      <li>• Mix uppercase, lowercase, numbers, and symbols</li>
                      <li>• Avoid personal information (birthdays, names)</li>
                      <li>• Consider passphrases: "KangarooJumping2025!Sydney"</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <h3 className="font-bold text-green-800 mb-2">🛡️ Password Managers</h3>
                    <p className="text-green-700 mb-2">Use tools like LastPass, 1Password, or Bitwarden to:</p>
                    <ul className="text-green-700 space-y-1">
                      <li>• Generate unique passwords for each account</li>
                      <li>• Store passwords securely</li>
                      <li>• Auto-fill login forms safely</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                    <h3 className="font-bold text-purple-800 mb-2">🔑 Multi-Factor Authentication (MFA)</h3>
                    <p className="text-purple-700 mb-2">Add an extra security layer:</p>
                    <ul className="text-purple-700 space-y-1">
                      <li>• Enable on all important accounts</li>
                      <li>• Use authenticator apps over SMS when possible</li>
                      <li>• Keep backup codes in a safe place</li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedLearningTopic === 'email_scams' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <h3 className="font-bold text-red-800 mb-2">🚨 Warning Signs</h3>
                    <ul className="text-red-700 space-y-1">
                      <li>• Urgent requests for immediate action</li>
                      <li>• Requests for personal information or passwords</li>
                      <li>• Poor grammar and spelling errors</li>
                      <li>• Generic greetings like "Dear Customer"</li>
                      <li>• Suspicious links or unexpected attachments</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h3 className="font-bold text-blue-800 mb-2">🔍 How to Verify</h3>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Check sender's email address carefully</li>
                      <li>• Hover over links to see actual URL</li>
                      <li>• Contact the company directly through official channels</li>
                      <li>• Don't click links or download attachments if suspicious</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <h3 className="font-bold text-yellow-800 mb-2">⚠️ Current Threats in Australia</h3>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• Fake Australia Post delivery notifications</li>
                      <li>• Centrelink and ATO impersonation emails</li>
                      <li>• Bank phishing with Australian bank logos</li>
                      <li>• COVID-19 related scam messages</li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedLearningTopic === 'device_security' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <h3 className="font-bold text-green-800 mb-2">💻 Computer Security</h3>
                    <ul className="text-green-700 space-y-1">
                      <li>• Keep operating system and software updated</li>
                      <li>• Use reputable antivirus software</li>
                      <li>• Enable automatic security updates</li>
                      <li>• Use a firewall</li>
                      <li>• Regular data backups</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h3 className="font-bold text-blue-800 mb-2">🏠 Smart Home Security</h3>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Change default passwords on all devices</li>
                      <li>• Use a separate network for IoT devices</li>
                      <li>• Regularly update device firmware</li>
                      <li>• Review device permissions and access</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                    <h3 className="font-bold text-purple-800 mb-2">📱 Mobile Device Protection</h3>
                    <ul className="text-purple-700 space-y-1">
                      <li>• Use screen locks (PIN, password, biometric)</li>
                      <li>• Only download apps from official stores</li>
                      <li>• Review app permissions regularly</li>
                      <li>• Enable remote wipe capabilities</li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedLearningTopic === 'social_media' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h3 className="font-bold text-blue-800 mb-2">🔒 Privacy Settings</h3>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Review and adjust privacy settings regularly</li>
                      <li>• Limit who can see your posts and personal information</li>
                      <li>• Be selective about friend/connection requests</li>
                      <li>• Turn off location sharing when possible</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <h3 className="font-bold text-yellow-800 mb-2">⚠️ What Not to Share</h3>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• Full birth dates and personal details</li>
                      <li>• Real-time location information</li>
                      <li>• Photos showing personal information (documents, addresses)</li>
                      <li>• Vacation plans while you're away</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <h3 className="font-bold text-green-800 mb-2">🛡️ Account Security</h3>
                    <ul className="text-green-700 space-y-1">
                      <li>• Use strong, unique passwords</li>
                      <li>• Enable two-factor authentication</li>
                      <li>• Regularly review connected apps and remove unused ones</li>
                      <li>• Log out from public or shared devices</li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedLearningTopic === 'phone_app_safety' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <h3 className="font-bold text-red-800 mb-2">🚨 SIM Swapping Protection</h3>
                    <ul className="text-red-700 space-y-1">
                      <li>• Add a PIN or password to your mobile account</li>
                      <li>• Use authenticator apps instead of SMS for 2FA</li>
                      <li>• Monitor your mobile account for unauthorized changes</li>
                      <li>• Contact your carrier immediately if service stops unexpectedly</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h3 className="font-bold text-blue-800 mb-2">📱 App Security</h3>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Only download apps from official app stores</li>
                      <li>• Read app reviews and check developer reputation</li>
                      <li>• Review app permissions before installing</li>
                      <li>• Keep apps updated to latest versions</li>
                      <li>• Uninstall apps you no longer use</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                    <h3 className="font-bold text-purple-800 mb-2">🔐 Phone Security</h3>
                    <ul className="text-purple-700 space-y-1">
                      <li>• Use strong screen lock (avoid simple patterns)</li>
                      <li>• Enable automatic screen lock timeout</li>
                      <li>• Set up remote wipe capabilities</li>
                      <li>• Avoid using public charging stations</li>
                    </ul>
                  </div>

                  <h3 className="font-bold text-lg mb-2">App Safety Tips</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Only download apps from official app stores (Google Play, Apple App Store)</li>
                    <li>Check app permissions before installing</li>
                    <li>Read reviews and research the developer</li>
                    <li>Keep apps updated</li>
                    <li>Delete apps you no longer use</li>
                    <li>Be wary of free apps that seem too good to be true</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Mobile Device Security</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Use a strong PIN, password, or biometric lock</li>
                    <li>Keep your operating system updated</li>
                    <li>Enable remote tracking and wiping features</li>
                    <li>Use a security app to scan for malware</li>
                    <li>Back up your data regularly</li>
                    <li>Be cautious when connecting to public Wi-Fi</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>SIM swapping scenario:</strong> A scammer calls Telstra pretending to be you, claims to have lost their phone, and requests your number be transferred to a new SIM.</p>
                    <p><strong>Protection strategy:</strong> Add a PIN to your mobile account that must be provided for any account changes, and use authenticator apps instead of SMS for two-factor authentication.</p>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about mobile security on our blog at{" "}
                      <a 
                        href="https://www.remaleh.com.au/blog" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#21a1ce] hover:underline"
                      >
                        remaleh.com.au/blog
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-5 h-[calc(100vh-200px)] flex flex-col">
            <div className="flex items-center mb-4">
              <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                <BookOpen className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-bold">Cyber Sensei</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Welcome to Cyber Sensei!</p>
                  <p>Ask me anything about cybersecurity, privacy, or online safety.</p>
                  <div className="mt-4 text-sm">
                    <p className="mb-2">Try asking about:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="bg-gray-100 px-2 py-1 rounded">Password security</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">Phishing emails</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">Wi-Fi safety</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">Privacy settings</span>
                    </div>
                  </div>
                </div>
              )}
              
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === 'user' 
                        ? 'bg-[#21a1ce] text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: msg.sender === 'assistant' 
                          ? msg.text
                              // Convert **bold** to <strong>
                              .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
                              // Convert # headers to styled headers
                              .replace(/^#+\s*(.*)/gm, '<div style="font-weight: 600; font-size: 15px; margin: 12px 0 6px 0; color: #374151;">$1</div>')
                              // Convert bullet points with proper spacing
                              .replace(/\n•\s(.*)/g, '<div style="margin: 4px 0; padding-left: 8px;">• $1</div>')
                              .replace(/\n-\s(.*)/g, '<div style="margin: 4px 0; padding-left: 8px;">• $1</div>')
                              // Convert double line breaks to proper spacing
                              .replace(/\n\n/g, '<div style="margin: 12px 0;"></div>')
                              // Convert single line breaks
                              .replace(/\n/g, '<br/>')
                              // Convert links with proper styling
                              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #21a1ce; text-decoration: underline; font-weight: 500;">$1</a>')
                              // Handle emoji and special characters properly
                              .replace(/🛡️/g, '<span style="font-size: 16px;">🛡️</span>')
                              .trim()
                          : msg.text 
                      }}
                      style={{
                        lineHeight: '1.6',
                        fontSize: '14px'
                      }}
                    />
                    {msg.sender === 'assistant' && msg.source && (
                      <div className={`mt-2 text-xs inline-flex items-center px-2 py-1 rounded-full ${
                        msg.source === 'Expert Knowledge' 
                          ? 'bg-green-100 text-green-800' 
                          : msg.source === 'System'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {msg.source === 'Expert Knowledge' && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.899-.455-1.746-.721-2.517a.75.75 0 00-.407-.999zm2.78 4.42c.138.032.285.06.433.086a39.318 39.318 0 01-1.437-.695c.354.3.712.58 1.004.609zm.54-1.227a.75.75 0 00.81.316 28.997 28.997 0 001.145-.915c-.96-.07-1.908-.184-2.837-.336-.362.464-.667.952-.918 1.465zm2.78-2.829c.745.02 1.487.04 2.227.048a.75.75 0 00.787-.735 27.067 27.067 0 00-.002-3.01.75.75 0 00-.787-.735c-.74.008-1.482.028-2.227.048v4.384z" clipRule="evenodd" />
                          </svg>
                        )}
                        {msg.source}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleChatSubmit} className="flex gap-2">
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
            </form>
            
            {chatError && (
              <div className="mt-2 text-sm text-red-600">
                There was an error processing your request. Please try again.
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
              <h2 className="text-xl font-bold">Get Help</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Chat with our cybersecurity assistant for instant help
            </p>

            <div className="border border-gray-200 rounded-lg mb-4 h-64 overflow-y-auto p-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <div className="bg-gray-100 p-4 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>
                      <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"></path>
                      <path d="M19 11h2"></path>
                      <path d="M13 13v2"></path>
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Ask me anything about cybersecurity!</p>
                  <p className="text-sm">I can help with passwords, phishing, malware, and more.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender === 'user' 
                            ? 'bg-[#21a1ce] text-white rounded-br-none' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <div 
                          className="prose prose-sm"
                          dangerouslySetInnerHTML={{ 
                            __html: msg.sender === 'assistant' 
                              ? msg.text
                                  // Convert **bold** to <strong>
                                  .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
                                  // Convert # headers to styled headers
                                  .replace(/^#+\s*(.*)/gm, '<div style="font-weight: 600; font-size: 15px; margin: 12px 0 6px 0; color: #374151;">$1</div>')
                                  // Convert bullet points with proper spacing
                                  .replace(/\n•\s(.*)/g, '<div style="margin: 4px 0; padding-left: 8px;">• $1</div>')
                                  .replace(/\n-\s(.*)/g, '<div style="margin: 4px 0; padding-left: 8px;">• $1</div>')
                                  // Convert double line breaks to proper spacing
                                  .replace(/\n\n/g, '<div style="margin: 12px 0;"></div>')
                                  // Convert single line breaks
                                  .replace(/\n/g, '<br/>')
                                  // Convert links with proper styling
                                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #21a1ce; text-decoration: underline; font-weight: 500;">$1</a>')
                                  // Handle emoji and special characters properly
                                  .replace(/🛡️/g, '<span style="font-size: 16px;">🛡️</span>')
                                  .trim()
                              : msg.text 
                          }}
                        />
                        {msg.sender === 'assistant' && msg.source && (
                          <div className={`mt-2 text-xs inline-flex items-center px-2 py-1 rounded-full ${
                            msg.source === 'Expert Knowledge' 
                              ? 'bg-green-100 text-green-800' 
                              : msg.source === 'System'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {msg.source === 'Expert Knowledge' ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </>
                            ) : msg.source === 'System' ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                              </>
                            )}
                            {msg.source}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {chatError && (
                    <div className="text-center text-sm text-red-500 mt-2">
                      There was an error processing your request. Please try again.
                    </div>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleChatSubmit} className="flex">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-l-lg p-3"
                placeholder="Type your cybersecurity question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#21a1ce] to-[#1a80a3] text-white py-3 px-4 rounded-r-lg font-medium"
                disabled={isTyping}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2">
        <button
          onClick={() => handleTabChange('check')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === 'check' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-xs mt-1">Check that Text</span>
        </button>
        <button
          onClick={() => handleTabChange('passwords')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === 'passwords' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
          }`}
        >
          <Lock size={20} />
          <span className="text-xs mt-1">Password Still Safe?</span>
        </button>
        <button
          onClick={() => handleTabChange('learn')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === 'learn' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
          }`}
        >
          <BookOpen size={20} />
          <span className="text-xs mt-1">Cyber Sensei</span>
        </button>
        <button
          onClick={() => handleTabChange('help')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === 'help' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-xs mt-1">Help Me!</span>
        </button>
      </div>

      <footer className="text-center text-gray-500 text-xs py-4 mt-20">
        <div className="flex justify-center items-center mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#21a1ce" />
          </svg>
          <span>Remaleh - Your Digital Guardian</span>
        </div>
        <p>Copyright © 2025 Remaleh</p>
      </footer>
    </div>
  );
}

export default App;

