import React, { useState, useEffect } from 'react'
import { BookOpen, Play, CheckCircle, Lock, ArrowLeft, Target, Award, Clock } from 'lucide-react'
import { MobileCard, MobileCardHeader, MobileCardContent } from './ui/mobile-card'
import { MobileButton } from './ui/mobile-button'
import { useAuth } from '../hooks/useAuth'

export default function LearnHub({ setActiveTab }) {
  const { isAuthenticated } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)

  return (
    <div className="space-y-4 p-4">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => setActiveTab('learn')}
          className="p-2 mr-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Learn Hub</h1>
          <p className="text-gray-600 text-sm">Master digital security skills</p>
        </div>
      </div>

      <MobileCard className="mb-6">
        <MobileCardHeader>
          <div className="flex items-center mb-3">
            <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Cyber Sensei</h2>
              <p className="text-sm md:text-base text-gray-600">Learn essential cybersecurity skills to protect yourself and your family</p>
            </div>
          </div>
        </MobileCardHeader>
        
        <MobileCardContent>
          {!selected ? (
            <div className="grid gap-4">
              <Card onClick={() => setSelected('passwords')} icon={<Lock className="text-[#21a1ce] mr-3" size={24} />} title="Password Protection" subtitle="Learn to create and manage strong passwords" />
              <Card onClick={() => setSelected('phishing')} icon={<Mail className="text-[#21a1ce] mr-3" size={24} />} title="Email &amp; Text Scams" subtitle="Identify and avoid phishing attempts" />
              <Card onClick={() => setSelected('devices')} icon={<Shield className="text-[#21a1ce] mr-3" size={24} />} title="Device &amp; Home Security" subtitle="Secure your devices and home network" />
              <Card onClick={() => setSelected('social')} icon={<Users className="text-[#21a1ce] mr-3" size={24} />} title="Social Media &amp; Privacy" subtitle="Protect your privacy on social platforms" />
              <Card onClick={() => setSelected('phone')} icon={<Smartphone className="text-[#21a1ce] mr-3" size={24} />} title="Phone &amp; App Safety" subtitle="Keep your mobile devices secure" />
            </div>
          ) : (
            <div>
              <button className="flex items-center text-[#21a1ce] mb-4 hover:underline text-sm md:text-base" onClick={() => setSelected(null)}>
                <ChevronLeft size={20} className="mr-1" />
                Back to topics
              </button>
              {selected === 'passwords' && <PasswordsContent />}
              {selected === 'phishing' && <PhishingContent />}
              {selected === 'devices' && <DevicesContent />}
              {selected === 'social' && <SocialContent />}
              {selected === 'phone' && <PhoneContent />}
            </div>
          )}
        </MobileCardContent>
      </MobileCard>
    </div>
  )
}

function Card({ onClick, icon, title, subtitle }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <div>
            <h3 className="font-medium text-sm md:text-base">{title}</h3>
            <p className="text-xs md:text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        <ChevronRight className="text-gray-400" size={20} />
      </div>
    </div>
  )
}

function PasswordsContent() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Password Protection</h3>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-bold mb-2">Why Strong Passwords Matter</h4>
        <p className="text-sm">Passwords are your first line of defense against cybercriminals. A strong password can be the difference between keeping your accounts safe and having your identity stolen.</p>
      </div>
      <div>
        <h4 className="font-bold mb-3">Creating Strong Passwords</h4>
        <div className="space-y-3">
          <Bullet title="Use at least 12-16 characters" desc="Longer passwords are exponentially harder to crack" />
          <Bullet title="Mix character types" desc="Combine uppercase, lowercase, numbers, and symbols" />
          <Bullet title="Use unique passwords" desc="Never reuse passwords across different accounts" />
        </div>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-bold mb-2">Australian Example</h4>
        <p className="text-sm">Instead of &quot;password123&quot;, try &quot;KangarooJumping2025!Sydney&quot; - it&apos;s long, memorable, and includes Australian references that are meaningful to you.</p>
      </div>
      <div>
        <h4 className="font-bold mb-3">Password Managers</h4>
        <p className="text-sm mb-3">Password managers generate and store unique passwords for all your accounts. Popular options include:</p>
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
  )
}

function PhishingContent() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Email &amp; Text Scams</h3>
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h4 className="font-bold mb-2">What is Phishing?</h4>
        <p className="text-sm">Phishing is when criminals send fake emails or texts pretending to be from legitimate companies to steal your personal information, passwords, or money.</p>
      </div>
      <div>
        <h4 className="font-bold mb-3">Warning Signs to Look For</h4>
        <div className="space-y-3">
          <Bullet danger={true} title="Urgent language" desc="&apos;Act now!&apos; &apos;Your account will be closed!&apos; &apos;Immediate action required!&apos;" />
          <Bullet danger={true} title="Generic greetings" desc="&apos;Dear Customer&apos; instead of your actual name" />
          <Bullet danger={true} title="Suspicious links" desc="Hover over links to see where they really go" />
          <Bullet danger={true} title="Poor grammar and spelling" desc="Legitimate companies proofread their communications" />
        </div>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-bold mb-2">Australian Example</h4>
        <p className="text-sm">&quot;Your ATO tax refund is ready! Click here to claim $1,247.50 immediately or it will expire in 24 hours.&quot;<br/><br/><strong>Red flags:</strong> The ATO doesn&apos;t send refund notifications via email, uses urgent language, and asks you to click links.</p>
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
  )
}

function DevicesContent() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Device &amp; Home Security</h3>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-bold mb-2">Why Device Security Matters</h4>
        <p className="text-sm">Your devices contain personal photos, banking apps, emails, and more. Securing them protects your entire digital life.</p>
      </div>
      <div>
        <h4 className="font-bold mb-3">Computer Security</h4>
        <div className="space-y-3">
          <Bullet title="Keep software updated" desc="Enable automatic updates for your operating system and apps" />
          <Bullet title="Use antivirus software" desc="Windows Defender is built-in and effective for most users" />
          <Bullet title="Enable firewall" desc="Your computer&apos;s firewall blocks unauthorized access" />
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
        <p className="text-sm">Follow the 3-2-1 rule: 3 copies of important data, on 2 different types of media, with 1 copy stored offsite (like cloud storage).</p>
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
  )
}

function SocialContent() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Social Media &amp; Privacy</h3>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-bold mb-2">Your Digital Footprint</h4>
        <p className="text-sm">Everything you post online creates a permanent digital footprint. Even &quot;private&quot; posts can become public through data breaches or account compromises.</p>
      </div>
      <div>
        <h4 className="font-bold mb-3">Privacy Settings</h4>
        <div className="space-y-3">
          <Bullet title="Review privacy settings regularly" desc="Social media platforms often change their privacy policies" />
          <Bullet title="Limit who can see your posts" desc="Set posts to &apos;Friends only&apos; rather than &apos;Public&apos;" />
          <Bullet title="Control who can find you" desc="Limit search visibility and friend requests" />
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
        <p className="text-sm">Ask yourself: &quot;Would I be comfortable if my employer, family, or a stranger saw this?&quot; If not, don&apos;t post it.</p>
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
  )
}

function PhoneContent() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Phone &amp; App Safety</h3>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-bold mb-2">Your Phone is a Computer</h4>
        <p className="text-sm">Modern smartphones contain more personal information than most computers. They need the same level of security protection.</p>
      </div>
      <div>
        <h4 className="font-bold mb-3">Basic Phone Security</h4>
        <div className="space-y-3">
          <Bullet title="Use a strong lock screen" desc="PIN, password, fingerprint, or face recognition" />
          <Bullet title="Keep your OS updated" desc="Enable automatic updates for security patches" />
          <Bullet title="Enable remote wipe" desc="So you can erase your phone if it&apos;s lost or stolen" />
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
        <p className="text-sm">Sarah received a text saying her Telstra service would be suspended. She called Telstra directly and discovered it was a scam. The criminals were trying to get her to provide information that could be used for SIM swapping - taking control of her phone number.</p>
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
  )
}

function Bullet({ title, desc, danger }) {
  return (
    <div className="flex items-start">
      <div className={`p-1 rounded-full mr-3 mt-1 ${danger ? 'bg-red-100' : 'bg-green-100'}`}>
        <div className={`w-2 h-2 rounded-full ${danger ? 'bg-red-500' : 'bg-green-500'}`}></div>
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  )
}
