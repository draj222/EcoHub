'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { FiArrowLeft, FiSend, FiUser } from 'react-icons/fi'
import ProjectEmbed from '@/app/components/messaging/ProjectEmbed'

interface MessageMetadata {
  type: string;
  projectId?: string;
  projectTitle?: string;
}

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  metadata?: MessageMetadata | null;
  sender: {
    id: string
    name: string
    image: string | null
  }
}

interface User {
  id: string
  name: string
  image: string | null
}

export default function ConversationPage({ 
  params 
}: { 
  params: { userId: string } 
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Redirect if not logged in
    if (status === 'unauthenticated') {
      router.push('/signin?redirect=/messages')
      return
    }
    
    if (status === 'authenticated') {
      fetchMessages()
      
      // Set up an interval to periodically refresh messages
      const refreshInterval = setInterval(() => {
        fetchMessages()
      }, 15000) // Refresh every 15 seconds
      
      // Clean up on unmount
      return () => clearInterval(refreshInterval)
    }
  }, [status, router, params.userId])
  
  // Add a focus effect to refresh messages when tab is focused
  useEffect(() => {
    // Function to refresh messages when tab regains focus
    const handleFocus = () => {
      if (status === 'authenticated') {
        fetchMessages()
      }
    }
    
    // Add event listener for when the window regains focus
    window.addEventListener('focus', handleFocus)
    
    // Clean up
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [status, params.userId])
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/messages/conversation?userId=${params.userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      
      const data = await response.json()
      setMessages(data.messages)
      setOtherUser(data.user)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return
    
    try {
      setSending(true)
      const response = await fetch('/api/messages/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: params.userId,
          content: newMessage,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }
      
      // After sending, clear input and refresh the entire conversation
      setNewMessage('')
      await fetchMessages()
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  const formatMessageDate = (dateString: string, index: number) => {
    const date = new Date(dateString)
    const formattedDate = date.toLocaleDateString([], { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
    
    if (index === 0) {
      return formattedDate
    }
    
    const prevDate = new Date(messages[index - 1].createdAt)
    if (date.toDateString() !== prevDate.toDateString()) {
      return formattedDate
    }
    
    return null
  }

  const renderMessageContent = (message: Message) => {
    // Check if this is a project share message
    if (
      message.metadata && 
      message.metadata.type === 'project_share' && 
      message.metadata.projectId && 
      message.metadata.projectTitle
    ) {
      return (
        <>
          <p>{message.content}</p>
          <div className="mt-2">
            <ProjectEmbed 
              projectId={message.metadata.projectId} 
              projectTitle={message.metadata.projectTitle} 
            />
          </div>
        </>
      );
    }
    
    // Regular text message
    return message.content;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white rounded-t-xl shadow-sm p-4 flex items-center border-b">
            <Link 
              href="/messages"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <FiArrowLeft size={20} />
            </Link>
            
            {otherUser ? (
              <div className="flex items-center">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                  {otherUser.image ? (
                    <Image
                      src={otherUser.image}
                      alt={otherUser.name || 'User'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-medium text-gray-900">
                    {otherUser.name || 'Unknown User'}
                  </h2>
                </div>
              </div>
            ) : (
              <div className="h-10 flex items-center">
                <div className="animate-pulse w-40 h-6 bg-gray-200 rounded"></div>
              </div>
            )}
          </div>
          
          {/* Messages */}
          <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-pulse">Loading messages...</div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                {error}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={message.id}>
                    {formatMessageDate(message.createdAt, index) && (
                      <div className="flex justify-center my-4">
                        <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                          {formatMessageDate(message.createdAt, index)}
                        </div>
                      </div>
                    )}
                    
                    <div 
                      className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex max-w-[80%]">
                        {message.senderId !== session?.user?.id && (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 mr-2 flex-shrink-0 self-end">
                            {message.sender.image ? (
                              <Image
                                src={message.sender.image}
                                alt={message.sender.name || 'User'}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiUser className="text-gray-400 text-sm" />
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <div 
                            className={`px-4 py-2 rounded-lg ${
                              message.senderId === session?.user?.id
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-800'
                            }`}
                          >
                            {renderMessageContent(message)}
                          </div>
                          <div 
                            className={`text-xs text-gray-500 mt-1 ${
                              message.senderId === session?.user?.id ? 'text-right' : 'text-left'
                            }`}
                          >
                            {formatDate(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="bg-white rounded-b-xl shadow-sm p-4 border-t">
            <form onSubmit={sendMessage} className="flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                disabled={sending}
              />
              <button
                type="submit"
                className={`ml-2 p-2 rounded-full ${
                  sending || !newMessage.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                disabled={sending || !newMessage.trim()}
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}