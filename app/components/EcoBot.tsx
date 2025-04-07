'use client'

import { useState, useRef, useEffect } from 'react'
import { FiMessageCircle, FiX, FiSend, FiChevronDown } from 'react-icons/fi'
import { useSession } from 'next-auth/react'

type Message = {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function EcoBot() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi there! I\'m EcoBot, your sustainability and eco-project assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])
  
  const toggleChat = () => {
    setIsOpen(!isOpen)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputMessage.trim()) return
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setApiError(null)
    
    try {
      // Format the message history for the API
      const historyForApi = messages
        .slice(-6) // Use recent messages for context
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Call API to get bot response
      const response = await fetch('/api/ecobot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          history: historyForApi
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to get response from EcoBot: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Add bot response to chat
      const botMessage: Message = {
        id: Date.now().toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error getting bot response:', error)
      
      // Set error message
      setApiError(error instanceof Error ? error.message : 'Unknown error')
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I had trouble processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  // Chat bot UI - fixed to bottom right corner
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed State - just the chat button */}
      {!isOpen ? (
        <button 
          onClick={toggleChat}
          className="bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all flex items-center"
        >
          <FiMessageCircle size={24} />
          <span className="ml-2 font-medium">Chat with EcoBot</span>
        </button>
      ) : (
        // Expanded State - full chat interface
        <div className="bg-white rounded-lg shadow-xl flex flex-col w-80 sm:w-96 h-[500px] border border-gray-200">
          {/* Chat Header */}
          <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <div className="font-semibold">EcoBot Assistant</div>
            <div className="flex space-x-2">
              <button onClick={toggleChat} className="text-white hover:text-gray-200">
                <FiChevronDown size={20} />
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <FiX size={20} />
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}
              >
                <div className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-gray-500 text-sm py-2">
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 inline-block">
                    <div className="flex space-x-1">
                      <div className="animate-bounce delay-75">.</div>
                      <div className="animate-bounce delay-150">.</div>
                      <div className="animate-bounce delay-300">.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {apiError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-xs">
                <p>Error connecting to EcoBot: {apiError}</p>
                <p className="mt-1">Using local responses instead.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ask EcoBot about sustainability..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 transition-all disabled:opacity-50"
              disabled={isLoading || !inputMessage.trim()}
            >
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </div>
  )
} 