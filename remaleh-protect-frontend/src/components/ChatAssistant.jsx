import React from 'react'
import { MessageSquare, Shield } from 'lucide-react'
import { useChatAssistant } from '../hooks/useChatAssistant'

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
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center mb-4">
          <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
            <MessageSquare className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold">Help Me!</h2>
        </div>
        <p className="text-gray-600 mb-4">Get instant help with cybersecurity questions from our AI assistant</p>

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
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
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
            {chatError && <p className="text-red-500 text-sm mt-2">Connection error. Please check your internet and try again.</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
