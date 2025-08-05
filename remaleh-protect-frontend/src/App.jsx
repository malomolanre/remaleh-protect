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

  // Enhanced message formatting function
  const formatMessage = (text) => {
    if (!text) return '';
    
    let formatted = text
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert bullet points
      .replace(/^• /gm, '<br/>• ')
      .replace(/^- /gm, '<br/>• ')
      // Convert headers (### Header)
      .replace(/^### (.*$)/gm, '<h3 style="font-weight: bold; margin: 10px 0;">$1</h3>')
      // Convert links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #21a1ce; text-decoration: underline;">$1</a>')
      // Convert line breaks
      .replace(/\n/g, '<br/>');
    
    return formatted;
  };

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
        enhancedScam: null,
        linkAnalysis: null,
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

      // 2. Enhanced Scam Detection (NEW SERVICE CALL)
      servicePromises.push(
        fetch('https://remaleh-protect-api.onrender.com/api/enhanced-scam/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: scamMessage })
        })
        .then(response => response.json())
        .then(data => {
          serviceResults.enhancedScam = data;
        })
        .catch(error => {
          console.error('Enhanced scam detection failed:', error);
          serviceResults.enhancedScam = { error: 'Service unavailable' };
        })
      );

      // 3. Link Analysis (NEW SERVICE CALL - only if URLs found)
      if (urls.length > 0) {
        servicePromises.push(
          fetch('https://remaleh-protect-api.onrender.com/api/link/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: scamMessage })
          })
          .then(response => response.json())
          .then(data => {
            serviceResults.linkAnalysis = data;
          })
          .catch(error => {
            console.error('Link analysis failed:', error);
            serviceResults.linkAnalysis = { error: 'Service unavailable' };
          })
        );
      }

      // 4. Breach Check (CORRECTED ENDPOINT - only if emails found)
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

      // 5. Enhanced Local Analysis (Delivery Scam Detection)
      const localAnalysis = analyzeDeliveryScams(scamMessage);
      serviceResults.localAnalysis = localAnalysis;

      // Wait for all service calls to complete
      await Promise.all(servicePromises);
      
      const endTime = Date.now();
      const analysisTime = ((endTime - startTime) / 1000).toFixed(1);

      // Aggregate results from all services
      const aggregatedResult = aggregateAnalysisResults(serviceResults, emails, urls, analysisTime);
      
      setScamResult(formatMessage(aggregatedResult));
      setIsAnalyzing(false);

    } catch (error) {
      console.error('Error analyzing message:', error);
      setScamResult(formatMessage(`
        <div style="color: red; padding: 15px; border: 1px solid red; border-radius: 5px; background-color: #ffeaea;">
          <strong>Analysis Error</strong><br/>
          Unable to complete analysis. Please try again later.
        </div>
      `));
      setIsAnalyzing(false);
    }
  };

  // Enhanced delivery scam detection
  const analyzeDeliveryScams = (text) => {
    const textLower = text.toLowerCase();
    let riskScore = 0;
    const riskFactors = [];

    // Delivery scam keywords (20 points each)
    const deliveryKeywords = ['parcel', 'package', 'delivery', 'held', 'postal code', 'tracking'];
    deliveryKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        riskScore += 20;
        riskFactors.push(`Delivery scam indicator: "${keyword}"`);
      }
    });

    // Brand impersonation (25 points each)
    const brandKeywords = ['auspost', 'australia post', 'dhl', 'fedex', 'ups', 'tnt', 'toll'];
    brandKeywords.forEach(brand => {
      if (textLower.includes(brand)) {
        riskScore += 25;
        riskFactors.push(`Brand impersonation: "${brand}"`);
      }
    });

    // Suspicious domains (35 points each)
    const suspiciousDomains = ['.buzz', '.tk', '.ml', '.ga', '.cf'];
    suspiciousDomains.forEach(domain => {
      if (textLower.includes(domain)) {
        riskScore += 35;
        riskFactors.push(`Highly suspicious domain: ${domain}`);
      }
    });

    // Urgency indicators (15 points each)
    const urgencyKeywords = ['within 24 hours', 'expires today', 'immediate', 'urgent', 'act now'];
    urgencyKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        riskScore += 15;
        riskFactors.push(`Creates false urgency: ${keyword}`);
      }
    });

    // Suspicious instructions (15 points each)
    const suspiciousInstructions = ['reply with y', 'exit and reopen', 'copy and paste', 'activate the link'];
    suspiciousInstructions.forEach(instruction => {
      if (textLower.includes(instruction)) {
        riskScore += 15;
        riskFactors.push(`Suspicious instruction: "${instruction}"`);
      }
    });

    return {
      riskScore: Math.min(riskScore, 100),
      riskFactors: riskFactors,
      analysis: 'Enhanced local pattern analysis'
    };
  };

  // Aggregate results from all services
  const aggregateAnalysisResults = (serviceResults, emails, urls, analysisTime) => {
    const { basicScam, enhancedScam, linkAnalysis, breachCheck, localAnalysis } = serviceResults;
    
    // Calculate overall risk score
    let overallRisk = 0;
    let riskFactors = [];
    
    // Add local analysis risk
    if (localAnalysis) {
      overallRisk += localAnalysis.riskScore;
      riskFactors = riskFactors.concat(localAnalysis.riskFactors);
    }

    // Add enhanced scam analysis if available
    if (enhancedScam && enhancedScam.result && !enhancedScam.error) {
      overallRisk += (enhancedScam.result.risk_score || 0) * 100;
      if (enhancedScam.result.indicators) {
        riskFactors = riskFactors.concat(enhancedScam.result.indicators);
      }
    }

    // Add basic scam analysis if available
    if (basicScam && basicScam.overall_assessment && !basicScam.error) {
      overallRisk += basicScam.overall_assessment.risk_score || 0;
      if (basicScam.threats_detected) {
        riskFactors = riskFactors.concat(basicScam.threats_detected);
      }
    }

    // Determine risk level
    const finalRisk = Math.min(overallRisk, 100);
    let riskLevel, riskColor, riskIcon;
    
    if (finalRisk >= 70) {
      riskLevel = 'HIGH RISK';
      riskColor = 'red';
      riskIcon = '🚨';
    } else if (finalRisk >= 50) {
      riskLevel = 'MEDIUM-HIGH RISK';
      riskColor = 'orange';
      riskIcon = '⚠️';
    } else if (finalRisk >= 30) {
      riskLevel = 'MEDIUM RISK';
      riskColor = 'orange';
      riskIcon = '⚠️';
    } else if (finalRisk >= 15) {
      riskLevel = 'LOW-MEDIUM RISK';
      riskColor = 'yellow';
      riskIcon = '⚡';
    } else {
      riskLevel = 'LOW RISK';
      riskColor = 'green';
      riskIcon = '✅';
    }

    // Build comprehensive result
    let result = `
      <div style="border: 2px solid ${riskColor}; border-radius: 8px; padding: 20px; background-color: ${riskColor === 'red' ? '#ffeaea' : riskColor === 'orange' ? '#fff3e0' : riskColor === 'yellow' ? '#fffbf0' : '#eafaf1'};">
        <h3 style="color: ${riskColor}; margin: 0 0 10px 0; font-size: 18px;">
          ${riskIcon} **${riskLevel}** (Score: ${Math.round(finalRisk)})
        </h3>
        <p style="margin: 10px 0;">
          ${finalRisk >= 50 ? 'This message shows strong indicators of a scam.' : finalRisk >= 30 ? 'This message has some suspicious elements.' : 'This message appears relatively safe, but stay vigilant.'}
        </p>
      </div>

      <div style="margin: 20px 0;">
        <h4 style="margin: 10px 0; font-weight: bold;">Components Detected:</h4>
        <ul style="margin: 5px 0; padding-left: 20px;">
          <li>**URLs:** ${urls.length} detected</li>
          <li>**Emails:** ${emails.length} detected</li>
        </ul>
      </div>

      <div style="margin: 20px 0;">
        <h4 style="margin: 10px 0; font-weight: bold;">Analysis Services Used:</h4>
        <ul style="margin: 5px 0; padding-left: 20px;">
          <li>${basicScam && !basicScam.error ? '✅' : '❌'} **Basic Scam Detection** ${basicScam && basicScam.error ? '(unavailable)' : ''}</li>
          <li>${enhancedScam && !enhancedScam.error ? '✅' : '❌'} **Enhanced Scam Analysis** ${enhancedScam && enhancedScam.error ? '(unavailable)' : ''}</li>
          <li>${linkAnalysis && !linkAnalysis.error ? '✅' : urls.length === 0 ? '➖' : '❌'} **Link Analysis** ${linkAnalysis && linkAnalysis.error ? '(unavailable)' : urls.length === 0 ? '(no URLs to analyze)' : ''}</li>
          <li>${breachCheck && !breachCheck.error ? '✅' : emails.length === 0 ? '➖' : '❌'} **Breach Check** ${breachCheck && breachCheck.error ? '(unavailable)' : emails.length === 0 ? '(no emails to check)' : ''}</li>
          <li>✅ **Enhanced Pattern Analysis**</li>
        </ul>
      </div>
    `;

    // Add threat details if any found
    if (riskFactors.length > 0) {
      result += `
        <div style="margin: 20px 0;">
          <h4 style="margin: 10px 0; font-weight: bold;">Threats Detected:</h4>
          <ul style="margin: 5px 0; padding-left: 20px;">
      `;
      
      riskFactors.slice(0, 8).forEach(factor => {
        result += `<li>${factor}</li>`;
      });
      
      result += `</ul></div>`;
    }

    // Add service-specific results
    if (linkAnalysis && linkAnalysis.result && !linkAnalysis.error) {
      result += `
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <h4 style="margin: 0 0 10px 0; font-weight: bold;">Link Analysis Results:</h4>
          <p>**Overall URL Risk:** ${linkAnalysis.result.overall_risk}</p>
          <p>**URLs Analyzed:** ${linkAnalysis.result.urls_found}</p>
        </div>
      `;
    }

    if (breachCheck && breachCheck.result && !breachCheck.error) {
      result += `
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <h4 style="margin: 0 0 10px 0; font-weight: bold;">Breach Check Results:</h4>
          <p>**Emails Checked:** ${emails.length}</p>
          <p>**Breach Status:** ${breachCheck.result.breached ? 'Found in breaches' : 'No breaches found'}</p>
        </div>
      `;
    }

    // Add recommendations
    if (finalRisk >= 50) {
      result += `
        <div style="margin: 20px 0; padding: 15px; background-color: #ffeaea; border: 1px solid red; border-radius: 5px;">
          <h4 style="margin: 0 0 10px 0; font-weight: bold; color: red;">⚠️ Recommendations:</h4>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>**Do not click any links** in this message</li>
            <li>**Do not provide personal information** if contacted</li>
            <li>**Verify independently** by contacting the organization directly</li>
            <li>**Report this message** to relevant authorities</li>
          </ul>
        </div>
      `;
    }

    result += `
      <div style="margin: 20px 0; font-size: 12px; color: #666;">
        <p>**Analysis completed in ${analysisTime}s** | Powered by Remaleh Protect</p>
      </div>
    `;

    return result;
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
            breached: false,
            message: 'Good news! This email address was not found in any known data breaches.'
          });
        }
        setIsChecking(false);
      }, 1500);
    } catch (error) {
      console.error('Error checking breach:', error);
      setIsChecking(false);
    }
  };


  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsTyping(true);
    setChatError(false);

    try {
      const apiResponse = await fetch('https://remaleh-protect-api.onrender.com/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
      setIsTyping(false);
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        content: data.response || 'I received your message but had trouble generating a response.',
        source: data.source || 'Unknown'
      }]);

    } catch (error) {
      console.error('Chat API Error:', error);
      setIsTyping(false);
      setChatError(true);
      
      // Fallback response
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        content: "I'm sorry, but I'm having trouble connecting to my knowledge base right now. For immediate cybersecurity assistance, please visit our contact page or try again in a few moments.",
        source: 'Fallback'
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#21a1ce] to-[#1a80a3] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <Shield className="mr-3" size={32} />
            <h1 className="text-2xl font-bold">Remaleh</h1>
          </div>
          <div className="text-center mt-4">
            <h2 className="text-3xl font-bold mb-2">Stay Safe in Our Connected World</h2>
            <p className="text-lg opacity-90">Your Digital Well-Being Is Our Paramount Commitment</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'check' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="text-[#21a1ce] mr-3" size={24} />
                <h3 className="text-xl font-bold">Advanced Text Message Analysis</h3>
              </div>
              <p className="text-gray-600 mb-6">
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

        {activeTab === 'password' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <Lock className="text-[#21a1ce] mr-3" size={24} />
                <h3 className="text-xl font-bold">Password Breach Check</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Check if your email address has been involved in any known data breaches
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
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-bold text-red-800 mb-2">⚠️ Breaches Found</h4>
                      <p className="text-red-700 mb-4">Your email was found in the following data breaches:</p>
                      {breachResult.breaches.map((breach, index) => (
                        <div key={index} className="bg-white p-3 rounded border mb-2">
                          <h5 className="font-semibold">{breach.name}</h5>
                          <p className="text-sm text-gray-600">Domain: {breach.domain}</p>
                          <p className="text-sm text-gray-600">Date: {breach.date}</p>
                          <p className="text-sm text-gray-600">Compromised data: {breach.data.join(', ')}</p>
                        </div>
                      ))}
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <h5 className="font-semibold text-yellow-800">Recommended Actions:</h5>
                        <ul className="text-sm text-yellow-700 mt-2">
                          <li>• Change your password immediately</li>
                          <li>• Enable two-factor authentication</li>
                          <li>• Monitor your accounts for suspicious activity</li>
                          <li>• Consider using a password manager</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-green-800 mb-2">✅ No Breaches Found</h4>
                      <p className="text-green-700">{breachResult.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <BookOpen className="text-[#21a1ce] mr-3" size={24} />
                <h3 className="text-xl font-bold">Cyber Sensei - Learn & Stay Protected</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Master cybersecurity with expert guidance tailored for Australian families
              </p>

              {!selectedLearningTopic ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#21a1ce] hover:shadow-md cursor-pointer transition-all"
                    onClick={() => setSelectedLearningTopic('passwords')}
                  >
                    <Lock className="text-[#21a1ce] mb-2" size={24} />
                    <h4 className="font-bold mb-2">Password Protection</h4>
                    <p className="text-sm text-gray-600">Learn to create and manage strong, unique passwords</p>
                  </div>

                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#21a1ce] hover:shadow-md cursor-pointer transition-all"
                    onClick={() => setSelectedLearningTopic('phishing')}
                  >
                    <Mail className="text-[#21a1ce] mb-2" size={24} />
                    <h4 className="font-bold mb-2">Email & Text Scams</h4>
                    <p className="text-sm text-gray-600">Identify and avoid phishing attempts and fraudulent messages</p>
                  </div>

                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#21a1ce] hover:shadow-md cursor-pointer transition-all"
                    onClick={() => setSelectedLearningTopic('devices')}
                  >
                    <Shield className="text-[#21a1ce] mb-2" size={24} />
                    <h4 className="font-bold mb-2">Device & Home Security</h4>
                    <p className="text-sm text-gray-600">Secure your devices, WiFi, and smart home systems</p>
                  </div>

                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#21a1ce] hover:shadow-md cursor-pointer transition-all"
                    onClick={() => setSelectedLearningTopic('social')}
                  >
                    <Users className="text-[#21a1ce] mb-2" size={24} />
                    <h4 className="font-bold mb-2">Social Media & Privacy</h4>
                    <p className="text-sm text-gray-600">Protect your privacy and family on social platforms</p>
                  </div>

                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#21a1ce] hover:shadow-md cursor-pointer transition-all"
                    onClick={() => setSelectedLearningTopic('mobile')}
                  >
                    <Smartphone className="text-[#21a1ce] mb-2" size={24} />
                    <h4 className="font-bold mb-2">Phone & App Safety</h4>
                    <p className="text-sm text-gray-600">Keep your mobile devices and apps secure</p>
                  </div>
                </div>
              ) : (
                <div>
                  <button 
                    className="flex items-center text-[#21a1ce] mb-4 hover:underline"
                    onClick={() => setSelectedLearningTopic(null)}
                  >
                    <ChevronLeft size={20} />
                    Back to Topics
                  </button>

                  {selectedLearningTopic === 'passwords' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold">Password Protection Mastery</h3>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold mb-2">Why Strong Passwords Matter</h4>
                        <p className="text-sm">
                          Weak passwords are the #1 cause of account breaches. A strong password is your first line of defense against cybercriminals who use automated tools to guess millions of password combinations per second.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold mb-3">Creating Unbreakable Passwords</h4>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Use the "Passphrase Method"</p>
                              <p className="text-sm text-gray-600">Combine 4-6 random words: "Coffee!Bicycle#Mountain9Sky"</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Minimum 12 characters</p>
                              <p className="text-sm text-gray-600">Longer passwords are exponentially harder to crack</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Mix character types</p>
                              <p className="text-sm text-gray-600">Include uppercase, lowercase, numbers, and symbols</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Unique for every account</p>
                              <p className="text-sm text-gray-600">Never reuse passwords across different services</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold mb-2">Password Manager Recommendation</h4>
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
                          <li>• Report the scam to ACCC Scamwatch</li>
                          <li>• Forward phishing emails to the real company</li>
                          <li>• If you clicked a link, change your passwords immediately</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedLearningTopic === 'devices' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold">Device & Home Security</h3>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold mb-2">Your Digital Fortress</h4>
                        <p className="text-sm">
                          Every device in your home is a potential entry point for cybercriminals. Securing them properly creates multiple layers of protection for your family.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold mb-3">Essential Device Security</h4>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Keep everything updated</p>
                              <p className="text-sm text-gray-600">Enable automatic updates for operating systems and apps</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Use screen locks</p>
                              <p className="text-sm text-gray-600">Set PINs, patterns, or biometric locks on all devices</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Install reputable antivirus</p>
                              <p className="text-sm text-gray-600">Protect computers with quality security software</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Backup regularly</p>
                              <p className="text-sm text-gray-600">Use cloud services or external drives for important data</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-bold mb-2">WiFi Security Checklist</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Change default router passwords</li>
                          <li>• Use WPA3 encryption (or WPA2 if WPA3 unavailable)</li>
                          <li>• Create a strong WiFi password</li>
                          <li>• Set up a guest network for visitors</li>
                          <li>• Regularly update router firmware</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold mb-3">Smart Home Security</h4>
                        <div className="space-y-2 text-sm">
                          <p>• Change default passwords on all smart devices</p>
                          <p>• Keep smart home apps updated</p>
                          <p>• Review device permissions regularly</p>
                          <p>• Consider network segmentation for IoT devices</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedLearningTopic === 'social' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold">Social Media & Privacy</h3>
                      
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-bold mb-2">Privacy in the Social Age</h4>
                        <p className="text-sm">
                          Social media platforms collect vast amounts of personal data. Understanding privacy settings and safe sharing practices protects you and your family from identity theft, stalking, and targeted scams.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold mb-3">Essential Privacy Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="bg-purple-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Make profiles private</p>
                              <p className="text-sm text-gray-600">Only allow friends/followers to see your posts and information</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-purple-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Limit personal information</p>
                              <p className="text-sm text-gray-600">Don't share phone numbers, addresses, or birthdates publicly</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-purple-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Review friend/follower requests</p>
                              <p className="text-sm text-gray-600">Only connect with people you know in real life</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-purple-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Disable location tracking</p>
                              <p className="text-sm text-gray-600">Turn off location services for social media apps</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-bold mb-2">What Never to Share</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Full birthdates (identity theft risk)</li>
                          <li>• Home addresses or specific locations</li>
                          <li>• Travel plans while you're away</li>
                          <li>• Photos of important documents</li>
                          <li>• Children's school or activity locations</li>
                          <li>• Financial information or purchases</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold mb-3">Teaching Kids Social Media Safety</h4>
                        <div className="space-y-2 text-sm">
                          <p>• Discuss the permanence of online posts</p>
                          <p>• Teach them about cyberbullying and how to report it</p>
                          <p>• Set age-appropriate time limits</p>
                          <p>• Monitor their friend lists and interactions</p>
                          <p>• Create family social media agreements</p>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold mb-2">Regular Privacy Checkups</h4>
                        <p className="text-sm mb-2">Review these settings monthly:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Who can see your posts and profile information</li>
                          <li>• What data the platform collects about you</li>
                          <li>• Which apps have access to your social media accounts</li>
                          <li>• Your advertising preferences and data usage</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedLearningTopic === 'mobile' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold">Phone & App Safety</h3>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold mb-2">Your Mobile Security Command Center</h4>
                        <p className="text-sm">
                          Your smartphone contains more personal information than your wallet, computer, and filing cabinet combined. Securing it properly is essential for protecting your digital life.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold mb-3">Essential Mobile Security</h4>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Use strong screen locks</p>
                              <p className="text-sm text-gray-600">Enable PINs, patterns, fingerprints, or face recognition</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Enable automatic updates</p>
                              <p className="text-sm text-gray-600">Keep your operating system and apps current</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Download from official stores</p>
                              <p className="text-sm text-gray-600">Only use Google Play Store or Apple App Store</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium">Review app permissions</p>
                              <p className="text-sm text-gray-600">Only grant necessary permissions to apps</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-bold mb-2">App Safety Tips</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Read app reviews and ratings before downloading</li>
                          <li>• Check what permissions apps request</li>
                          <li>• Regularly review and delete unused apps</li>
                          <li>• Be cautious with apps requesting excessive permissions</li>
                          <li>• Avoid "free" apps that seem too good to be true</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-bold mb-2">SIM Swapping Protection</h4>
                        <p className="text-sm mb-2">
                          SIM swapping is when criminals transfer your phone number to their device. Protect yourself:
                        </p>
                        <ul className="text-sm space-y-1">
                          <li>• Set up a PIN with your mobile carrier</li>
                          <li>• Don't share personal information on social media</li>
                          <li>• Use authenticator apps instead of SMS for 2FA when possible</li>
                          <li>• Monitor your accounts for unusual activity</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold mb-3">Lost or Stolen Phone Response</h4>
                        <div className="space-y-2 text-sm">
                          <p>• Immediately contact your carrier to suspend service</p>
                          <p>• Use Find My Device (Android) or Find My iPhone (iOS)</p>
                          <p>• Change passwords for important accounts</p>
                          <p>• Report the theft to police if applicable</p>
                          <p>• Monitor bank and credit card statements</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold mb-2">Public WiFi Safety</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Avoid accessing sensitive accounts on public WiFi</li>
                          <li>• Use your phone's hotspot instead when possible</li>
                          <li>• Consider using a VPN for public WiFi connections</li>
                          <li>• Turn off auto-connect to WiFi networks</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="text-[#21a1ce] mr-3" size={24} />
                <h3 className="text-xl font-bold">Help Me!</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Get instant help with cybersecurity questions from our AI assistant
              </p>

              <div className="border border-gray-300 rounded-lg h-96 overflow-y-auto p-4 mb-4 bg-gray-50">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
                    <p>Ask me anything about cybersecurity!</p>
                    <p className="text-sm mt-2">Try: "How do I create a strong password?"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-[#21a1ce] text-white' 
                            : 'bg-white border border-gray-200'
                        }`}>
                          {message.type === 'bot' && (
                            <div className="flex items-center mb-1">
                              <Shield className="mr-1" size={14} />
                              <span className="text-xs text-gray-500">
                                {message.source === 'Expert Knowledge' && '👑 Expert Knowledge'}
                                {message.source === 'AI Assistant' && '🤖 AI Assistant'}
                                {message.source === 'Fallback' && '⚠️ Offline Mode'}
                              </span>
                            </div>
                          )}
                          <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white border border-gray-200">
                          <div className="flex items-center">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit}>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-l-lg p-3"
                    placeholder="Type your cybersecurity question..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#21a1ce] to-[#1a80a3] text-white px-6 rounded-r-lg font-medium disabled:opacity-50"
                    disabled={isTyping || !inputMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </form>

              {chatError && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <AlertCircle className="inline mr-1" size={16} />
                    Connection issue detected. Responses may be limited.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around max-w-md mx-auto">
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
            onClick={() => handleTabChange('password')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'password' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
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
            <MessageSquare size={20} />
            <span className="text-xs mt-1">Help Me!</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-20 bg-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="mr-2" size={24} />
              <h3 className="text-xl font-bold">Remaleh - Your Digital Guardian</h3>
            </div>
            <p className="text-slate-300 mb-4">Protecting Australian families in the digital world</p>
            <p className="text-sm text-slate-400">
              Visit our blog at <a href="https://remaleh.com.au/blog" className="text-[#21a1ce] hover:underline">remaleh.com.au/blog</a> for more cybersecurity tips
            </p>
            <p className="text-xs text-slate-500 mt-4">Copyright © 2025 Remaleh</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

