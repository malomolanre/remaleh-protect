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

  const handleScamCheck = async (e) => {
    e.preventDefault();
    if (!scamMessage.trim()) return;

    setIsAnalyzing(true);
    setScamResult(null);

    try {
      // Simulate API call
      setTimeout(() => {
        const randomScore = Math.random();
        let result;

        if (randomScore > 0.7) {
          result = {
            score: randomScore.toFixed(2),
            risk: 'High Risk',
            explanation: 'This message contains multiple warning signs of a scam, including urgency, requests for personal information, and suspicious links.',
            color: 'red'
          };
        } else if (randomScore > 0.4) {
          result = {
            score: randomScore.toFixed(2),
            risk: 'Medium Risk',
            explanation: 'This message has some suspicious elements that could indicate a scam. Proceed with caution.',
            color: 'orange'
          };
        } else {
          result = {
            score: randomScore.toFixed(2),
            risk: 'Low Risk',
            explanation: 'This message appears to be legitimate, but always remain vigilant.',
            color: 'green'
          };
        }

        setScamResult(result);
        setIsAnalyzing(false);
      }, 1500);
    } catch (error) {
      console.error('Error analyzing message:', error);
      setIsAnalyzing(false);
    }
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
              <h2 className="text-xl font-bold">Check Text Message</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Analyze messages for scams and threats using advanced AI
            </p>

            <form onSubmit={handleScamCheck}>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32"
                placeholder="Paste your message here to check for scams..."
                value={scamMessage}
                onChange={(e) => setScamMessage(e.target.value)}
              ></textarea>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#21a1ce] to-[#1a80a3] text-white py-3 px-6 rounded-lg font-medium w-full"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Check Message'}
              </button>
            </form>

            {scamResult && (
              <div className="mt-6">
                <div className={`p-4 rounded-lg ${
                  scamResult.color === 'red' ? 'bg-red-100 border border-red-200' :
                  scamResult.color === 'orange' ? 'bg-orange-100 border border-orange-200' :
                  'bg-green-100 border border-green-200'
                }`}>
                  <div className="flex items-center mb-2">
                    <div className={`p-2 rounded-full ${
                      scamResult.color === 'red' ? 'bg-red-200' :
                      scamResult.color === 'orange' ? 'bg-orange-200' :
                      'bg-green-200'
                    } mr-3`}>
                      <AlertCircle className={`${
                        scamResult.color === 'red' ? 'text-red-500' :
                        scamResult.color === 'orange' ? 'text-orange-500' :
                        'text-green-500'
                      }`} size={20} />
                    </div>
                    <h3 className="font-bold text-lg">{scamResult.risk}</h3>
                  </div>
                  <p className="mb-2">
                    <span className="font-medium">Risk Score:</span> {scamResult.score}
                  </p>
                  <p>{scamResult.explanation}</p>
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
                    <p className="mb-4">Your email was found in {breachResult.breaches.length} data breaches. You should change your passwords immediately.</p>
                    
                    <div className="space-y-3">
                      {breachResult.breaches.map((breach, index) => (
                        <div key={index} className="bg-white p-3 rounded border border-red-100">
                          <h4 className="font-bold">{breach.name}</h4>
                          <p className="text-sm text-gray-600">{breach.domain}</p>
                          <p className="text-sm"><span className="font-medium">Breach date:</span> {breach.date}</p>
                          <p className="text-sm"><span className="font-medium">Data exposed:</span> {breach.data.join(', ')}</p>
                        </div>
                      ))}
                    </div>
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
                      <span className="font-bold">⚠️ Current threat:</span> SIM swapping attacks and fake mobile apps
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectedLearningTopic(null)}
                className="flex items-center text-[#21a1ce] mb-4 hover:underline"
              >
                <ChevronLeft size={20} className="mr-1" />
                Back to all topics
              </button>

              {/* Password Protection Content */}
              {selectedLearningTopic === 'passwords' && (
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                      <Lock className="text-white" size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Password Protection</h2>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <h3 className="font-bold text-red-700">Current Threat Alert</h3>
                        <p className="text-red-600">
                          AI-powered password cracking tools can now guess common passwords and patterns in seconds. Credential stuffing attacks are targeting Australians who reuse passwords across multiple sites.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Creating Strong Passwords</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Use at least 16 characters when possible</li>
                    <li>Combine uppercase letters, lowercase letters, numbers, and symbols</li>
                    <li>Avoid personal information (birthdays, names, etc.)</li>
                    <li>Don't use common words or patterns</li>
                    <li>Consider using passphrases (e.g., "KangarooJumping2025!Sydney")</li>
                    <li>Use a different password for each account</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Password Managers</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Use a reputable password manager to generate and store strong passwords</li>
                    <li>Popular options include LastPass, 1Password, Bitwarden, and Dashlane</li>
                    <li>Only need to remember one master password</li>
                    <li>Many offer secure sharing features for families</li>
                    <li>Look for password managers with breach monitoring</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Multi-Factor Authentication (MFA)</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Enable MFA on all important accounts</li>
                    <li>Authenticator apps (like Google Authenticator) are more secure than SMS</li>
                    <li>Consider hardware security keys for maximum protection</li>
                    <li>Even if your password is compromised, MFA provides another layer of security</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>Weak password:</strong> "Sydney2025" or "Kangaroo1"</p>
                    <p className="mb-2"><strong>Strong password:</strong> "j8T!p2&amp;KoalaEuc@lyptus"</p>
                    <p><strong>Strong passphrase:</strong> "SunnyBeach-Waves-Crashing-2025!"</p>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about password security on our blog at{" "}
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

              {/* Email & Text Scams Content */}
              {selectedLearningTopic === 'email_scams' && (
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                      <Mail className="text-white" size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Email & Text Scams</h2>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <h3 className="font-bold text-red-700">Current Threat Alert</h3>
                        <p className="text-red-600">
                          AI-generated phishing emails now have perfect grammar and mimic legitimate communications from Australian banks, government agencies, and businesses. Fake Australia Post and StarTrack delivery texts are increasing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Common Australian Phishing Scams</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Fake Australia Post/StarTrack delivery notifications</li>
                    <li>ATO tax refund or debt collection scams</li>
                    <li>Commonwealth Bank, ANZ, Westpac, and NAB security alert scams</li>
                    <li>myGov account suspension notices</li>
                    <li>NBN connection issues or upgrades</li>
                    <li>Telstra or Optus bill payment or service cancellation</li>
                    <li>COVID-19 related government payments or information</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Warning Signs</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Urgent requests requiring immediate action</li>
                    <li>Threats of account suspension or legal action</li>
                    <li>Requests for personal information, passwords, or payment details</li>
                    <li>Links to websites that look similar but aren't quite right</li>
                    <li>Generic greetings like "Dear Customer" instead of your name</li>
                    <li>Offers that seem too good to be true</li>
                    <li>Pressure to act quickly or miss out</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">How to Protect Yourself</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Never click links in suspicious emails or texts</li>
                    <li>Go directly to the official website by typing the URL</li>
                    <li>Call the organization using a number from their official website</li>
                    <li>Check email sender addresses carefully</li>
                    <li>Be suspicious of unexpected attachments</li>
                    <li>Report scams to Scamwatch.gov.au</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>Scam text:</strong> "Your Australia Post package is held at our depot. Last attempt to deliver tomorrow. Confirm delivery address: [suspicious link]"</p>
                    <p><strong>What to do:</strong> Don't click the link. If you're expecting a package, go directly to the Australia Post website and use your tracking number to check its status.</p>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about email and text scams on our blog at{" "}
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

              {/* Device & Home Security Content */}
              {selectedLearningTopic === 'device_security' && (
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                      <Shield className="text-white" size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Device & Home Security</h2>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <h3 className="font-bold text-red-700">Current Threat Alert</h3>
                        <p className="text-red-600">
                          Smart home devices with weak security are being targeted by hackers to spy on families and access home networks. Malicious QR codes in public places are being used to steal information from mobile devices.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Securing Your Home Network</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Change default router passwords and admin credentials</li>
                    <li>Use WPA3 encryption if available (at least WPA2)</li>
                    <li>Update router firmware regularly</li>
                    <li>Create a separate guest network for visitors and IoT devices</li>
                    <li>Consider a network security device like a Firewalla</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Smart Home Device Security</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Change default passwords on all devices</li>
                    <li>Keep devices updated with the latest firmware</li>
                    <li>Disable features you don't use</li>
                    <li>Check privacy settings and data collection policies</li>
                    <li>Consider using a dedicated IoT security hub</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Protecting Your Computers and Phones</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Keep operating systems and apps updated</li>
                    <li>Use reputable antivirus/anti-malware software</li>
                    <li>Back up important data regularly</li>
                    <li>Be cautious about downloading apps and software</li>
                    <li>Use screen locks and encryption</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Family Tips</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Create a family security plan and discuss it regularly</li>
                    <li>Help elderly family members set up automatic updates</li>
                    <li>Teach children about safe downloading practices</li>
                    <li>Consider parental controls for younger family members</li>
                  </ul>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about device security on our blog at{" "}
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

              {/* Social Media & Privacy Content */}
              {selectedLearningTopic === 'social_media' && (
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                      <Users className="text-white" size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Social Media & Privacy</h2>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <h3 className="font-bold text-red-700">Current Threat Alert</h3>
                        <p className="text-red-600">
                          Identity thieves are using information shared on social media to answer security questions, create targeted phishing attacks, and impersonate Australians online.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">What Not to Share on Social Media</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Full date of birth</li>
                    <li>Home address or detailed location information</li>
                    <li>Phone numbers</li>
                    <li>Travel plans (until after you return)</li>
                    <li>Children's full names and schools</li>
                    <li>Financial information</li>
                    <li>Identity documents (even partially visible)</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Privacy Settings to Check</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Profile visibility (who can see your profile)</li>
                    <li>Post visibility (who can see what you share)</li>
                    <li>Friend/connection request settings</li>
                    <li>Photo tagging permissions</li>
                    <li>Search engine visibility</li>
                    <li>Data sharing with third-party apps</li>
                    <li>Location sharing settings</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Protecting Your Digital Footprint</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Regularly search for yourself online to see what information is public</li>
                    <li>Set up Google Alerts for your name</li>
                    <li>Request removal of sensitive information from search results</li>
                    <li>Use privacy-focused browsers and search engines</li>
                    <li>Consider using a VPN for additional privacy</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Family Privacy Tips</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Discuss privacy with all family members, including children</li>
                    <li>Be cautious about sharing photos of children online</li>
                    <li>Help elderly relatives configure privacy settings</li>
                    <li>Consider using family privacy protection services</li>
                    <li>Report suspicious activity to the ACCC or OAIC</li>
                  </ul>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about online privacy on our blog at{" "}
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

              {/* Phone & App Safety Content */}
              {selectedLearningTopic === 'phone_app_safety' && (
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                      <Smartphone className="text-white" size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Phone & App Safety</h2>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <h3 className="font-bold text-red-700">Current Threat Alert</h3>
                        <p className="text-red-600">
                          SIM swapping attacks are targeting Telstra, Optus, and Vodafone customers to take over phone numbers and bypass SMS-based two-factor authentication. Fake mobile apps in unofficial app stores are stealing personal information.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Protecting Against SIM Swapping</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Add a PIN or password to your mobile account</li>
                    <li>Use app-based two-factor authentication instead of SMS</li>
                    <li>Be alert for unexpected "SIM not provisioned" messages</li>
                    <li>Contact your provider immediately if you lose mobile service unexpectedly</li>
                    <li>Consider using a separate email for account recovery</li>
                  </ul>

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
            </>
          )}
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
                              ? msg.text.replace(/^#+\s*(.*)/gm, '<strong>$1</strong>')
                                      .replace(/\n\n/g, '<br/><br/>')
                                      .replace(/\n-\s(.*)/g, '<br/>• $1')
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

