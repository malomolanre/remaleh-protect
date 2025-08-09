import { useState } from 'react'
import { Shield } from 'lucide-react'
import { API } from '../lib/api'

const CYBER_KB = {
  passwords: {
    keywords: ['password', 'passwords', 'strong password', 'secure password', 'passphrase', 'password manager'],
    response: `**Password Protection**\n\n• Use at least 16 characters when possible\n• Combine uppercase letters, lowercase letters, numbers, and symbols\n• Avoid personal information (birthdays, names, etc.)\n• Don't use common words or patterns\n• Consider using passphrases (e.g., "KangarooJumping2025!Sydney")\n• Use a different password for each account\n• Consider using a password manager like LastPass, 1Password, or Bitwarden\n• Enable multi-factor authentication (MFA) whenever possible`,
    source: 'Expert Knowledge'
  },
}

export function useChatAssistant() {
  const [chatMessages, setChatMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatError, setChatError] = useState(false)

  const formatChatMessage = (text) => {
    if (!text) return ''
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^• /gm, '<br>• ')
      .replace(/^\* /gm, '<br>• ')
      .replace(/^- /gm, '<br>• ')
      .replace(/^### (.*$)/gm, '<h4 style="margin: 15px 0 8px 0; color: #374151; font-size: 16px;">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 style="margin: 15px 0 10px 0; color: #1f2937; font-size: 18px;">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 style="margin: 15px 0 10px 0; color: #111827; font-size: 20px;">$1</h2>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #21a1ce; text-decoration: underline;">$1</a>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    setChatError(false)

    const userMessage = { text: inputMessage, sender: 'user' }
    setChatMessages(prev => [...prev, userMessage])

    const messageToProcess = inputMessage

    setInputMessage('')
    setIsTyping(true)

    try {
      let responseFound = false
      let response = ''
      let source = ''
      const lowercaseInput = messageToProcess.toLowerCase()

      for (const key in CYBER_KB) {
        const { keywords, response: kbResponse, source: kbSource } = CYBER_KB[key]
        for (const k of keywords) {
          if (lowercaseInput.includes(k.toLowerCase())) {
            response = kbResponse
            source = kbSource
            responseFound = true
            break
          }
        }
        if (responseFound) break
      }

      if (!responseFound) {
        try {
          const apiResponse = await fetch(`${API}/api/chat/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageToProcess })
          })
          if (!apiResponse.ok) throw new Error(`API status ${apiResponse.status}`)
          const data = await apiResponse.json()
          if (data.success) {
            response = data.response
            source = data.source === 'expert_knowledge' ? 'Expert Knowledge' : 'AI Analysis'
            responseFound = true
          }
        } catch (apiError) {
          // fallthrough to default
        }
      }

      if (!responseFound) {
        response = "I don't have specific information about that topic yet. For complex cybersecurity questions, I recommend consulting with a security professional."
        source = 'AI Analysis'
      }

      setTimeout(() => {
        const botMessage = { text: response, sender: 'assistant', source }
        setChatMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 600)
    } catch (err) {
      setChatError(true)
      const errorMessage = { text: 'Sorry, I encountered an error processing your request. Please try again.', sender: 'assistant', source: 'System' }
      setChatMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
    }
  }

  return {
    chatMessages,
    inputMessage,
    isTyping,
    chatError,
    setInputMessage,
    formatChatMessage,
    handleChatSubmit,
  }
}