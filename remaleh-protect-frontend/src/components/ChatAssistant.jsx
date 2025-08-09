import React from 'react'
import { MessageSquare, Shield } from 'lucide-react'
import { useChatAssistant } from '../hooks/useChatAssistant'
import { MobileCard, MobileCardHeader, MobileCardContent } from './ui/mobile-card'
import { MobileInput } from './ui/mobile-input'
import { Button } from './ui/button'

export default function ChatAssistant() {
  const {
    chatMessages,
    inputMessage,
    isTyping,
    chatError,
    setInputMessage,
    formatChatMessage,
    handleChatSubmit,
  } = useChatAssistant()

  return (
    <div className="p-4 md:p-6">
      <MobileCard className="mb-6">
        <MobileCardHeader>
          <div className="flex items-center mb-3">
            <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
              <MessageSquare className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">AI Security Assistant</h2>
              <p className="text-sm md:text-base text-gray-600">Get instant help with cybersecurity questions</p>
            </div>
          </div>
        </MobileCardHeader>
        
        <MobileCardContent>
          <div className="border border-gray-200 rounded-lg h-80 md:h-96 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="mx-auto mb-2 text-gray-300" size={48} />
                  <p className="text-sm md:text-base">Ask me anything about cybersecurity!</p>
                  <p className="text-xs md:text-sm mt-2 text-gray-400">Try asking about passwords, phishing, or device security.</p>
                </div>
              )}

              {chatMessages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    message.sender === 'user' ? 'bg-[#21a1ce] text-white' : 'bg-gray-100 text-gray-800'
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
                        __html: message.sender === 'assistant' ? formatChatMessage(message.text) : message.text,
                      }}
                    />
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1 text-[#21a1ce]" />
                      <span className="text-xs text-[#21a1ce] font-medium mr-2">AI Assistant</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChatSubmit} className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <MobileInput
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your cybersecurity question..."
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isTyping || !inputMessage.trim()}
                  className="bg-[#21a1ce] hover:bg-[#1a80a3] text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </Button>
              </div>
              {chatError && <p className="text-red-500 text-sm mt-2">Connection error. Please check your internet and try again.</p>}
            </form>
          </div>
        </MobileCardContent>
      </MobileCard>
    </div>
  )
}
