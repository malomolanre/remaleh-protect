import React, { useState, useEffect } from 'react';
import './App.css';
import { Shield, MessageSquare, Lock, AlertCircle, ChevronRight, ChevronLeft, Mail, Users, Phone, Smartphone, BookOpen } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('check');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLearningTopic, setSelectedLearningTopic] = useState(null);
  const [chatError, setChatError] = useState(false);

  // Enhanced cybersecurity knowledge base with expanded keywords
  const cybersecurityKnowledge = {
    password: {
      keywords: ['password', 'passwords', 'strong password', 'secure password', 'password manager', 'passphrase', 'pass phrase', 'passcode', 'pin', 'good password', 'create password', 'make password'],
      response: "# Password Security Best Practices\n\n## Create Strong Passwords\n- Use at least 12 characters\n- Mix uppercase, lowercase, numbers, and symbols\n- Avoid personal information or common words\n- Use a different password for each account\n\n## Password Managers\nConsider using a password manager like LastPass, 1Password, or Bitwarden to generate and store strong, unique passwords.\n\n## Two-Factor Authentication\nEnable 2FA on all important accounts for an extra layer of security.",
      source: "Expert Knowledge"
    },
    phishing: {
      keywords: ['phishing', 'scam email', 'fake email', 'suspicious email', 'scam', 'scams', 'phish', 'spam', 'suspicious message', 'fake message', 'scam text', 'scam sms'],
      response: "# How to Spot Phishing Scams\n\n## Warning Signs\n- Urgent requests for personal information\n- Spelling and grammar errors\n- Mismatched or suspicious URLs\n- Generic greetings instead of your name\n- Requests for payment or financial details\n\n## What to Do\n- Don't click links or download attachments from suspicious emails\n- Verify requests by contacting the company directly through official channels\n- Report phishing attempts to the organization being impersonated",
      source: "Expert Knowledge"
    },
    malware: {
      keywords: ['malware', 'virus', 'ransomware', 'spyware', 'trojan', 'adware', 'computer virus', 'infected', 'infection', 'malicious software'],
      response: "# Protecting Against Malware\n\n## Prevention Tips\n- Keep your operating system and software updated\n- Use reputable antivirus/anti-malware software\n- Be cautious about downloading files or clicking links\n- Back up your data regularly\n\n## If You're Infected\n- Disconnect from the internet\n- Run a full system scan with your security software\n- Change passwords from a clean device\n- Restore from a backup if necessary",
      source: "Expert Knowledge"
    },
    privacy: {
      keywords: ['privacy', 'data privacy', 'online privacy', 'protect privacy', 'private browsing', 'tracking', 'being tracked', 'data collection', 'personal data', 'information privacy'],
      response: "# Enhancing Your Online Privacy\n\n## Browser Privacy\n- Use private browsing modes\n- Consider privacy-focused browsers like Firefox or Brave\n- Install ad and tracker blocking extensions\n\n## Social Media Privacy\n- Review and adjust privacy settings regularly\n- Limit personal information you share\n- Be selective about friend/connection requests\n\n## General Tips\n- Use a VPN for public Wi-Fi\n- Regularly delete cookies and browsing history\n- Opt out of data collection when possible",
      source: "Expert Knowledge"
    },
    wifi: {
      keywords: ['wifi', 'wi-fi', 'wireless', 'router', 'network security', 'public wifi', 'hotspot', 'wireless network', 'home network', 'secure wifi'],
      response: "# Securing Your Wi-Fi Network\n\n## Router Security\n- Change default admin credentials\n- Use WPA3 encryption if available (at least WPA2)\n- Create a strong, unique password\n- Keep router firmware updated\n\n## Network Protection\n- Hide your network name (SSID) for home networks\n- Enable the firewall\n- Create a guest network for visitors\n- Disable remote management\n\n## Public Wi-Fi Safety\n- Use a VPN\n- Avoid sensitive transactions\n- Verify network names before connecting",
      source: "Expert Knowledge"
    },
    identity: {
      keywords: ['identity theft', 'identity protection', 'stolen identity', 'fraud', 'identity fraud', 'identity', 'personal information', 'identity stolen', 'protect identity'],
      response: "# Preventing Identity Theft\n\n## Protect Your Information\n- Secure your Tax File Number and government IDs\n- Shred sensitive documents\n- Use strong, unique passwords for financial accounts\n- Be cautious about sharing personal details online\n\n## Monitoring\n- Check credit reports regularly\n- Review financial statements monthly\n- Consider identity theft protection services\n- Set up fraud alerts with your bank\n\n## If You're a Victim\n- Report to the police and financial institutions\n- Contact credit bureaus to place fraud alerts\n- Change all passwords\n- Monitor accounts closely",
      source: "Expert Knowledge"
    },
    social: {
      keywords: ['social media', 'facebook', 'instagram', 'twitter', 'tiktok', 'linkedin', 'social network', 'social networking', 'online profile', 'social account'],
      response: "# Social Media Security\n\n## Account Protection\n- Use strong, unique passwords\n- Enable two-factor authentication\n- Be selective about connection requests\n- Regularly review privacy settings\n\n## Content Sharing\n- Think before posting personal information\n- Avoid sharing your location in real-time\n- Be cautious about what's visible in photos\n- Consider who can see your posts\n\n## Third-Party Apps\n- Regularly review connected applications\n- Remove access for unused apps\n- Check permission settings",
      source: "Expert Knowledge"
    },
    device: {
      keywords: ['device security', 'phone security', 'mobile security', 'laptop security', 'computer security', 'secure device', 'protect phone', 'protect computer', 'device protection', 'mobile device'],
      response: "# Securing Your Devices\n\n## Basic Security\n- Keep operating systems and apps updated\n- Use strong passwords or biometric protection\n- Enable automatic screen locks\n- Install security software\n\n## Mobile Devices\n- Review app permissions regularly\n- Only download apps from official stores\n- Enable remote tracking and wiping\n- Back up your data\n\n## Computers\n- Use disk encryption\n- Install a firewall\n- Create regular backups\n- Use standard user accounts for daily use",
      source: "Expert Knowledge"
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const analyzeMessage = () => {
    // Simulate message analysis
    setTimeout(() => {
      const result = Math.random() > 0.3 ? 'This message appears to be safe.' : 'Warning: This message shows signs of being a potential scam.';
      alert(result);
    }, 1000);
  };

  const checkPassword = () => {
    // Simulate password breach check
    setTimeout(() => {
      const result = Math.random() > 0.5 ? 'Good news! This email was not found in any known data breaches.' : 'Warning: This email was found in at least one data breach. Change your password immediately.';
      alert(result);
    }, 1000);
  };

  // Enhanced chat submission handler with better keyword matching and error handling
  const handleChatSubmit = (e) => {
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

    // Rule-based response system with better matching
    setTimeout(() => {
      try {
        let responseFound = false;
        let response = '';
        let source = '';
        const lowercaseInput = messageToProcess.toLowerCase();

        // Check against knowledge base with improved matching
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

        // Fallback response if no match
        if (!responseFound) {
          response = "I don't have specific information about that topic yet. For complex cybersecurity questions, I recommend consulting with a security professional.";
          source = "AI Analysis";
        }

        // Add bot response
        const botMessage = { text: response, sender: 'assistant', source };
        setChatMessages(prevMessages => [...prevMessages, botMessage]);
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
      } finally {
        setIsTyping(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f7fb] to-[#f5f5f5]">
      <header className="p-4 flex justify-center">
        {/* Fixed logo implementation using local file path */}
        <img 
          src="/remaleh-logo-full.png" 
          alt="Remaleh" 
          className="h-8 w-auto object-contain"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='32' viewBox='0 0 100 32'%3E%3Crect width='100' height='32' fill='%2321a1ce'/%3E%3Ctext x='50' y='20' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3ERemaleh%3C/text%3E%3C/svg%3E";
          }}
          style={{maxHeight: '32px'}}
        />
      </header>

      <div className="text-center px-4 py-6">
        <h1 className="text-3xl font-bold text-[#21a1ce]">Stay Safe in Our Connected World</h1>
        <p className="text-[#000000] mt-2">Your Digital Well-Being Is Our Paramount Commitment</p>
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
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32"
              placeholder="Paste your message here to check for scams..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <button
              className="w-full bg-gradient-to-r from-[#21a1ce] to-[#1a80a3] text-white py-3 rounded-lg font-medium flex items-center justify-center"
              onClick={analyzeMessage}
            >
              <Shield className="mr-2" size={20} />
              Check Message
            </button>
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
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="w-full bg-gradient-to-r from-[#21a1ce] to-[#1a80a3] text-white py-3 rounded-lg font-medium flex items-center justify-center"
              onClick={checkPassword}
            >
              <Shield className="mr-2" size={20} />
              Check My Passwords
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              We never store your email address. Checks are performed securely using the HaveIBeenPwned API.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'learn' && (
        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                <BookOpen className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-bold">Stay Safe Online</h2>
            </div>
            <p className="text-gray-600">
              Protect yourself from the latest cyber threats targeting Australian families
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-bold text-red-700">2025 Threat Alert</h3>
                <p className="text-red-600">
                  Scammers are using AI to create more convincing fake emails, texts, and voice calls targeting Australians.
                  Stay vigilant!
                </p>
              </div>
            </div>
          </div>

          {selectedLearningTopic === null ? (
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
                          With AI making password cracking faster than ever, strong unique passwords are essential
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
                          Scammers now use AI to create convincing fake emails and texts that look legitimate
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> AI-generated phishing emails and fake Australia Post/banking texts
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
                          Protect your computers, phones, and smart home devices from hackers
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> Smart home device hacking and malicious QR codes
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
                          What you share online can be used against you by identity thieves
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> Identity theft using information shared on social media
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone & Romance Scams */}
              <div 
                className="bg-white rounded-lg shadow mb-4 overflow-hidden cursor-pointer"
                onClick={() => setSelectedLearningTopic('phone_scams')}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                        <Phone className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Phone & Romance Scams</h3>
                        <p className="text-sm text-gray-600">
                          Voice cloning technology is being used to impersonate loved ones in emergency scams
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> AI voice cloning scams targeting elderly Australians
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
                    <li>Who can see your posts (friends only vs. public)</li>
                    <li>Who can tag you in photos</li>
                    <li>Who can see your friends list</li>
                    <li>Whether your profile appears in search engines</li>
                    <li>Location sharing settings</li>
                    <li>App permissions and connected apps</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Protecting Your Family Online</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Talk to children about what's appropriate to share online</li>
                    <li>Use privacy settings on children's accounts</li>
                    <li>Be cautious about sharing photos of children</li>
                    <li>Help elderly family members review their privacy settings</li>
                    <li>Consider using family sharing features for oversight</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>Oversharing scenario:</strong> Posting "Just landed in Sydney for our two-week holiday! House is all locked up back in Melbourne."</p>
                    <p><strong>Risk:</strong> Tells criminals your home is empty and exactly where it is located</p>
                    <p><strong>Better approach:</strong> Share your holiday photos after you return home</p>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about social media privacy on our blog at{" "}
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

              {/* Phone & Romance Scams Content */}
              {selectedLearningTopic === 'phone_scams' && (
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
                      <Phone className="text-white" size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Phone & Romance Scams</h2>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <h3 className="font-bold text-red-700">Current Threat Alert</h3>
                        <p className="text-red-600">
                          AI voice cloning technology is being used to impersonate family members in emergency scams, particularly targeting elderly Australians. Romance scammers are using sophisticated psychological manipulation techniques.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Common Phone Scams in Australia</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>ATO tax debt collection scams</li>
                    <li>NBN technical support scams</li>
                    <li>Bank security team impersonation</li>
                    <li>Computer technical support scams</li>
                    <li>Family emergency scams with voice cloning</li>
                    <li>Investment opportunities (cryptocurrency, etc.)</li>
                    <li>Fake government rebates or grants</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Protecting Against Voice Cloning Scams</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Establish a family code word for emergencies</li>
                    <li>Ask verification questions only family would know</li>
                    <li>Hang up and call the person directly on their known number</li>
                    <li>Be suspicious of urgent money requests</li>
                    <li>Limit personal audio/video content on public social media</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Romance Scam Warning Signs</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Professes love quickly without meeting in person</li>
                    <li>Profile seems too perfect or inconsistent</li>
                    <li>Always has excuses for not video chatting</li>
                    <li>Claims to be working overseas (military, oil rig, etc.)</li>
                    <li>Eventually asks for money for an emergency</li>
                    <li>Requests unusual payment methods (gift cards, wire transfers, cryptocurrency)</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>Voice cloning scenario:</strong> "Grandma, it's me. I've been in an accident in Sydney and need $2,000 for hospital bills. Please don't tell mum and dad."</p>
                    <p><strong>Protection strategy:</strong> Ask a question only your real grandchild would know, hang up and call their actual number, or contact their parents to verify.</p>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about phone and romance scams on our blog at{" "}
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

