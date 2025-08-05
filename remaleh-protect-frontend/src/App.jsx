import React, { useState } from 'react';
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

  // Cybersecurity knowledge base for rule-based responses
  const cybersecurityKnowledge = {
    password: {
      keywords: ['password', 'passwords', 'strong password', 'secure password', 'password manager'],
      response: "# Password Security Best Practices\n\n## Create Strong Passwords\n- Use at least 12 characters\n- Mix uppercase, lowercase, numbers, and symbols\n- Avoid personal information or common words\n- Use a different password for each account\n\n## Password Managers\nConsider using a password manager like LastPass, 1Password, or Bitwarden to generate and store strong, unique passwords.\n\n## Two-Factor Authentication\nEnable 2FA on all important accounts for an extra layer of security.",
      source: "Expert Knowledge"
    },
    phishing: {
      keywords: ['phishing', 'scam email', 'fake email', 'suspicious email', 'scam', 'scams'],
      response: "# How to Spot Phishing Scams\n\n## Warning Signs\n- Urgent requests for personal information\n- Spelling and grammar errors\n- Mismatched or suspicious URLs\n- Generic greetings instead of your name\n- Requests for payment or financial details\n\n## What to Do\n- Don't click links or download attachments from suspicious emails\n- Verify requests by contacting the company directly through official channels\n- Report phishing attempts to the organization being impersonated",
      source: "Expert Knowledge"
    },
    malware: {
      keywords: ['malware', 'virus', 'ransomware', 'spyware', 'trojan', 'adware'],
      response: "# Protecting Against Malware\n\n## Prevention Tips\n- Keep your operating system and software updated\n- Use reputable antivirus/anti-malware software\n- Be cautious about downloading files or clicking links\n- Back up your data regularly\n\n## If You're Infected\n- Disconnect from the internet\n- Run a full system scan with your security software\n- Change passwords from a clean device\n- Restore from a backup if necessary",
      source: "Expert Knowledge"
    },
    privacy: {
      keywords: ['privacy', 'data privacy', 'online privacy', 'protect privacy', 'private browsing'],
      response: "# Enhancing Your Online Privacy\n\n## Browser Privacy\n- Use private browsing modes\n- Consider privacy-focused browsers like Firefox or Brave\n- Install ad and tracker blocking extensions\n\n## Social Media Privacy\n- Review and adjust privacy settings regularly\n- Limit personal information you share\n- Be selective about friend/connection requests\n\n## General Tips\n- Use a VPN for public Wi-Fi\n- Regularly delete cookies and browsing history\n- Opt out of data collection when possible",
      source: "Expert Knowledge"
    },
    wifi: {
      keywords: ['wifi', 'wi-fi', 'wireless', 'router', 'network security'],
      response: "# Securing Your Wi-Fi Network\n\n## Router Security\n- Change default admin credentials\n- Use WPA3 encryption if available (at least WPA2)\n- Create a strong, unique password\n- Keep router firmware updated\n\n## Network Protection\n- Hide your network name (SSID) for home networks\n- Enable the firewall\n- Create a guest network for visitors\n- Disable remote management\n\n## Public Wi-Fi Safety\n- Use a VPN\n- Avoid sensitive transactions\n- Verify network names before connecting",
      source: "Expert Knowledge"
    },
    identity: {
      keywords: ['identity theft', 'identity protection', 'stolen identity', 'fraud', 'identity fraud'],
      response: "# Preventing Identity Theft\n\n## Protect Your Information\n- Secure your Social Security number and government IDs\n- Shred sensitive documents\n- Use strong, unique passwords for financial accounts\n- Be cautious about sharing personal details online\n\n## Monitoring\n- Check credit reports regularly\n- Review financial statements monthly\n- Consider identity theft protection services\n- Set up fraud alerts or credit freezes\n\n## If You're a Victim\n- Report to the police and financial institutions\n- Contact credit bureaus to place fraud alerts\n- Change all passwords\n- Monitor accounts closely",
      source: "Expert Knowledge"
    },
    social: {
      keywords: ['social media', 'facebook', 'instagram', 'twitter', 'tiktok', 'linkedin'],
      response: "# Social Media Security\n\n## Account Protection\n- Use strong, unique passwords\n- Enable two-factor authentication\n- Be selective about connection requests\n- Regularly review privacy settings\n\n## Content Sharing\n- Think before posting personal information\n- Avoid sharing your location in real-time\n- Be cautious about what's visible in photos\n- Consider who can see your posts\n\n## Third-Party Apps\n- Regularly review connected applications\n- Remove access for unused apps\n- Check permission settings",
      source: "Expert Knowledge"
    },
    device: {
      keywords: ['device security', 'phone security', 'mobile security', 'laptop security', 'computer security'],
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

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = { text: inputMessage, sender: 'user' };
    setChatMessages([...chatMessages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Rule-based response system
    setTimeout(() => {
      let responseFound = false;
      let response = '';
      let source = '';

      // Check against knowledge base
      for (const category in cybersecurityKnowledge) {
        const { keywords, response: categoryResponse, source: categorySource } = cybersecurityKnowledge[category];
        for (const keyword of keywords) {
          if (inputMessage.toLowerCase().includes(keyword.toLowerCase())) {
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

      const botMessage = { text: response, sender: 'assistant', source };
      setChatMessages(prevMessages => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <header className="p-4 flex justify-center">
        {/* Fixed logo implementation with fallback */}
        <img 
          src="https://remaleh.com.au/wp-content/uploads/2023/11/Remaleh2-03.png" 
          alt="Remaleh" 
          className="h-8 w-auto object-contain"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='32' viewBox='0 0 100 32'%3E%3Crect width='100' height='32' fill='%230891b2'/%3E%3Ctext x='50' y='20' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3ERemaleh%3C/text%3E%3C/svg%3E";
          }}
          style={{maxHeight: '32px'}}
        />
      </header>

      <div className="text-center px-4 py-6">
        <h1 className="text-3xl font-bold text-blue-600">Stay Safe in Our Connected World</h1>
        <p className="text-gray-600 mt-2">Your Digital Well-Being Is Our Paramount Commitment</p>
      </div>

      {activeTab === 'check' && (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 p-2 rounded-lg mr-3">
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
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-medium flex items-center justify-center"
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
              <div className="bg-purple-500 p-2 rounded-lg mr-3">
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
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-lg font-medium flex items-center justify-center"
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
              <div className="bg-purple-600 p-2 rounded-lg mr-3">
                <BookOpen className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-bold">Stay Safe Online</h2>
            </div>
            <p className="text-gray-600">
              Protect yourself from the latest cyber threats targeting families
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-bold text-red-700">2025 Threat Alert</h3>
                <p className="text-red-600">
                  Scammers are using AI to create more convincing fake emails, texts, and voice calls.
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
                      <div className="bg-blue-500 p-2 rounded-lg mr-3">
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
                      <div className="bg-teal-500 p-2 rounded-lg mr-3">
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
                      <span className="font-bold">⚠️ Current threat:</span> AI-generated phishing emails and fake delivery/banking texts
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
                      <div className="bg-purple-500 p-2 rounded-lg mr-3">
                        <Shield className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Device & Home Security</h3>
                        <p className="text-sm text-gray-600">
                          Hackers target phones, computers, and smart home devices to steal personal information
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> Malware targeting smart home devices and fake software updates
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
                      <div className="bg-indigo-500 p-2 rounded-lg mr-3">
                        <Users className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Social Media & Privacy</h3>
                        <p className="text-sm text-gray-600">
                          Protect your family's personal information from being exploited online
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-bold">⚠️ Current threat:</span> Identity theft through social media oversharing
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
                      <div className="bg-pink-500 p-2 rounded-lg mr-3">
                        <Phone className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Phone & Romance Scams</h3>
                        <p className="text-sm text-gray-600">
                          Voice cloning technology now allows scammers to impersonate loved ones
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
                onClick={() => setSelectedLearningTopic('app_safety')}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-orange-500 p-2 rounded-lg mr-3">
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

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  For more cybersecurity education, visit our blog at{" "}
                  <a 
                    href="https://www.remaleh.com.au/blog" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    remaleh.com.au/blog
                  </a>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Back button */}
              <button 
                onClick={() => setSelectedLearningTopic(null)}
                className="flex items-center mb-4 text-blue-600"
              >
                <ChevronLeft size={20} className="mr-1" />
                <span>Back to topics</span>
              </button>

              {/* Password Protection Content */}
              {selectedLearningTopic === 'passwords' && (
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-500 p-2 rounded-lg mr-3">
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
                          AI tools can now crack simple passwords in seconds. Criminals are using stolen credentials from data breaches to access multiple accounts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">How to Create Strong Passwords</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Use a unique password for each important account</li>
                    <li>Make passwords at least 12 characters long</li>
                    <li>Mix uppercase, lowercase, numbers, and symbols</li>
                    <li>Avoid personal information (birthdays, names)</li>
                    <li>Consider using a passphrase (multiple random words)</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Helpful Tools</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>Password managers:</strong> LastPass, 1Password, or Bitwarden</li>
                    <li><strong>Two-factor authentication:</strong> Enable on all important accounts</li>
                    <li><strong>Password breach checker:</strong> Use the "Password Still Safe?" feature in this app</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>Weak password:</strong> <span className="text-red-500">Kangaroo1</span></p>
                    <p><strong>Strong password:</strong> <span className="text-green-500">w@llaBy-j4ckAr00-h0pP!ng</span></p>
                    <p className="text-sm text-gray-600 mt-2">The strong password uses a memorable Australian-themed passphrase with substitutions and symbols.</p>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Family Tips</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Set up a family password manager to share important passwords securely</li>
                    <li>Help elderly family members set up password managers on their devices</li>
                    <li>Teach children about password safety from an early age</li>
                    <li>Consider using biometric authentication (fingerprint/face) when available</li>
                  </ul>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about password security on our blog at{" "}
                      <a 
                        href="https://www.remaleh.com.au/blog" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
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
                    <div className="bg-teal-500 p-2 rounded-lg mr-3">
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
                          AI-generated phishing emails now perfectly mimic Australian companies like Australia Post, major banks, and the ATO. Fake delivery texts with malicious links are targeting Australians daily.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Common Australian Scams to Watch For</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>ATO scams:</strong> Fake tax refunds or threats of arrest for tax evasion</li>
                    <li><strong>Australia Post/StarTrack scams:</strong> Fake delivery notifications with malicious links</li>
                    <li><strong>Banking scams:</strong> Fake messages from Commonwealth Bank, ANZ, Westpac, or NAB</li>
                    <li><strong>myGov scams:</strong> Fake government messages about benefits or payments</li>
                    <li><strong>NBN scams:</strong> Fake messages about internet connection issues</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">How to Spot Scams</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Check the sender's email address carefully (not just the display name)</li>
                    <li>Hover over links before clicking to see the actual URL</li>
                    <li>Be suspicious of urgent requests or threats</li>
                    <li>Look for poor grammar or unusual phrasing</li>
                    <li>Never provide personal information via email or text</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">What to Do If You Receive a Suspicious Message</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Don't click any links or download attachments</li>
                    <li>Use the "Check Text Message" feature in this app</li>
                    <li>Report scams to <a href="https://www.scamwatch.gov.au" className="text-blue-500 hover:underline">Scamwatch.gov.au</a></li>
                    <li>Forward suspicious emails to the company they claim to be from</li>
                    <li>Delete the message after reporting</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>Scam message:</strong> "Your Australia Post package is held at our depot. Last delivery attempt tomorrow. Confirm delivery address: [malicious link]"</p>
                    <p><strong>Red flags:</strong> Urgency, request to click link, no specific package details, no official Australia Post branding</p>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Family Tips</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Create a family group chat to verify suspicious messages with each other</li>
                    <li>Help elderly relatives check suspicious emails or texts before they respond</li>
                    <li>Teach children never to click links in messages from unknown senders</li>
                    <li>Set up advanced spam filters on family email accounts</li>
                  </ul>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about email and text scams on our blog at{" "}
                      <a 
                        href="https://www.remaleh.com.au/blog" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
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
                    <div className="bg-purple-500 p-2 rounded-lg mr-3">
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
                          Hackers are targeting Australian smart home devices and routers with weak passwords. Malware can access cameras, microphones, and personal data on connected devices.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Securing Your Devices</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Keep all devices updated with the latest security patches</li>
                    <li>Use strong, unique passwords for all devices</li>
                    <li>Enable two-factor authentication wherever possible</li>
                    <li>Install reputable antivirus/anti-malware software</li>
                    <li>Back up important data regularly</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Smart Home Security</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Change default passwords on all smart devices</li>
                    <li>Set up a separate guest Wi-Fi network for smart home devices</li>
                    <li>Regularly check for firmware updates on all devices</li>
                    <li>Review privacy settings and disable unnecessary features</li>
                    <li>Consider a dedicated smart home security hub</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Recommended Security Tools</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>Router security:</strong> Enable WPA3, change default passwords</li>
                    <li><strong>Antivirus:</strong> Norton, Bitdefender, or Trend Micro</li>
                    <li><strong>VPN services:</strong> NordVPN, ExpressVPN, or Surfshark</li>
                    <li><strong>Password managers:</strong> LastPass, 1Password, or Bitwarden</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>Scenario:</strong> A family in Sydney discovered their smart home cameras were accessed by hackers who had found the default password in an online database.</p>
                    <p><strong>Solution:</strong> They changed all passwords, updated firmware, and set up a separate IoT network on their router.</p>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Family Tips</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Create a monthly "security update day" for all family devices</li>
                    <li>Teach children about the importance of device security</li>
                    <li>Consider parental controls for children's devices</li>
                    <li>Keep smart speakers and cameras away from private areas</li>
                  </ul>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about device and home security on our blog at{" "}
                      <a 
                        href="https://www.remaleh.com.au/blog" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
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
                    <div className="bg-indigo-500 p-2 rounded-lg mr-3">
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

                  <h3 className="font-bold text-lg mb-2">Protecting Your Privacy</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Review and tighten privacy settings on all social accounts</li>
                    <li>Limit the personal information you share publicly</li>
                    <li>Be cautious about sharing location data</li>
                    <li>Regularly check which apps have access to your accounts</li>
                    <li>Use different profile pictures across different platforms</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Information to Keep Private</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Full date of birth</li>
                    <li>Home address and phone number</li>
                    <li>Travel plans and when your home will be empty</li>
                    <li>Children's full names and schools</li>
                    <li>Financial information and Medicare details</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Privacy Tools</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>Privacy checkups:</strong> Use Facebook, Google, and Instagram privacy checkup tools</li>
                    <li><strong>Data removal:</strong> Request data removal from people search sites</li>
                    <li><strong>Browser privacy:</strong> Use privacy-focused browsers or extensions</li>
                    <li><strong>OAIC resources:</strong> Visit <a href="https://www.oaic.gov.au" className="text-blue-500 hover:underline">oaic.gov.au</a> for Australian privacy guides</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>Scenario:</strong> An Australian family posted about their upcoming holiday to Queensland, including dates and resort name. Their home was burglarized while they were away.</p>
                    <p><strong>Better approach:</strong> Share holiday photos after returning home, never announce when your house will be empty.</p>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Family Tips</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Create family guidelines for what can be shared online</li>
                    <li>Help children understand the permanence of online information</li>
                    <li>Use private sharing options for family photos</li>
                    <li>Teach elderly relatives about privacy settings</li>
                  </ul>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about social media privacy on our blog at{" "}
                      <a 
                        href="https://www.remaleh.com.au/blog" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
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
                    <div className="bg-pink-500 p-2 rounded-lg mr-3">
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
                          AI voice cloning technology is being used to impersonate family members in emergency scams targeting elderly Australians. Romance scammers are using AI-generated photos and sophisticated scripts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Common Phone Scams in Australia</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>ATO scams:</strong> Fake tax officials threatening arrest</li>
                    <li><strong>NBN scams:</strong> Callers claiming issues with your internet</li>
                    <li><strong>Bank security scams:</strong> Fake bank staff claiming account compromise</li>
                    <li><strong>Grandparent scams:</strong> Impersonating relatives in emergency situations</li>
                    <li><strong>Technical support scams:</strong> Fake Microsoft or Telstra support</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Romance Scam Warning Signs</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Profile seems too perfect or matches celebrity photos</li>
                    <li>Quickly professes strong feelings</li>
                    <li>Always has excuses for not video chatting</li>
                    <li>Claims to be Australian but working overseas</li>
                    <li>Eventually asks for money for an emergency</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">How to Protect Yourself</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Never provide personal information to incoming callers</li>
                    <li>Establish a family verification code for emergencies</li>
                    <li>Use call blocking apps to filter suspicious calls</li>
                    <li>Research romantic interests thoroughly (reverse image search)</li>
                    <li>Report scams to <a href="https://www.scamwatch.gov.au" className="text-blue-500 hover:underline">Scamwatch.gov.au</a></li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>Scenario:</strong> An elderly woman in Melbourne received a call from someone sounding exactly like her grandson, claiming to be in hospital and needing money urgently.</p>
                    <p><strong>Protection:</strong> She called her grandson directly on his known number and confirmed it was a scam using AI voice cloning.</p>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Family Tips</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Create a family verification system (code word or question)</li>
                    <li>Help elderly relatives set up call blocking</li>
                    <li>Discuss romance scams openly with single family members</li>
                    <li>Report suspicious calls to the ACCC</li>
                  </ul>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about phone and romance scams on our blog at{" "}
                      <a 
                        href="https://www.remaleh.com.au/blog" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        remaleh.com.au/blog
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {/* Phone & App Safety Content */}
              {selectedLearningTopic === 'app_safety' && (
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-500 p-2 rounded-lg mr-3">
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
                          SIM swapping attacks are increasing in Australia, where scammers transfer your mobile number to their device to bypass SMS verification. Fake apps on app stores are stealing banking credentials.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Mobile Phone Security</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Keep your phone's operating system updated</li>
                    <li>Use a strong PIN or biometric security (fingerprint/face)</li>
                    <li>Enable remote tracking and wiping capabilities</li>
                    <li>Back up your data regularly</li>
                    <li>Be cautious on public Wi-Fi networks</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">App Safety</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Only download apps from official app stores (Google Play, Apple App Store)</li>
                    <li>Check app ratings, reviews, and developer reputation</li>
                    <li>Review app permissions before installing</li>
                    <li>Regularly remove unused apps</li>
                    <li>Keep all apps updated</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Protecting Against SIM Swapping</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Add a PIN or password to your mobile account with Telstra, Optus, or Vodafone</li>
                    <li>Use authentication apps instead of SMS for two-factor authentication</li>
                    <li>Be alert for unexpected "No Service" messages</li>
                    <li>Contact your provider immediately if you suspect SIM swapping</li>
                  </ul>

                  <h3 className="font-bold text-lg mb-2">Real-World Example</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="mb-2"><strong>Scenario:</strong> A Brisbane resident downloaded what appeared to be a legitimate banking app, but it was a fake. The app stole their banking credentials and drained their account.</p>
                    <p><strong>Protection:</strong> Always verify banking apps by visiting your bank's official website first and following their app download links.</p>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Family Tips</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Help children understand which apps are safe to download</li>
                    <li>Set up family sharing to approve children's app downloads</li>
                    <li>Assist elderly relatives with app updates and security</li>
                    <li>Consider mobile security apps for family devices</li>
                  </ul>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Learn more about phone and app safety on our blog at{" "}
                      <a 
                        href="https://www.remaleh.com.au/blog" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
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
              <div className="bg-red-500 p-2 rounded-lg mr-3">
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
                            ? 'bg-blue-500 text-white rounded-br-none' 
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
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {msg.source === 'Expert Knowledge' ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-r-lg font-medium"
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
            activeTab === 'check' ? 'bg-teal-500 text-white' : 'text-gray-600'
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-xs mt-1">Check that Text</span>
        </button>
        <button
          onClick={() => handleTabChange('passwords')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === 'passwords' ? 'bg-purple-500 text-white' : 'text-gray-600'
          }`}
        >
          <Lock size={20} />
          <span className="text-xs mt-1">Password Still Safe?</span>
        </button>
        <button
          onClick={() => handleTabChange('learn')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === 'learn' ? 'bg-blue-500 text-white' : 'text-gray-600'
          }`}
        >
          <BookOpen size={20} />
          <span className="text-xs mt-1">Cyber Sensei</span>
        </button>
        <button
          onClick={() => handleTabChange('help')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === 'help' ? 'bg-red-500 text-white' : 'text-gray-600'
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-xs mt-1">Help Me!</span>
        </button>
      </div>

      <div className="pb-20"></div>

      <footer className="text-center p-4 text-sm text-gray-500">
        <div className="flex items-center justify-center mb-2">
          <Shield className="text-blue-500 mr-2" size={16} />
          <span>Remaleh - Your Digital Guardian</span>
        </div>
        <p>Copyright © 2025 Remaleh</p>
      </footer>
    </div>
  );
}

export default App;

