'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/app/components/Header'
import { FiMessageSquare, FiUser, FiEdit, FiX, FiSearch } from 'react-icons/fi'

interface Conversation {
  id: string
  name: string
  image: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface User {
  id: string
  name: string
  image: string | null
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [followedUsers, setFollowedUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  useEffect(() => {
    // Redirect if not logged in
    if (status === 'unauthenticated') {
      router.push('/signin?redirect=/messages')
      return
    }
    
    if (status === 'authenticated') {
      // Initial fetch
      fetchConversations()
      
      // Set up an interval to periodically refresh conversations
      const refreshInterval = setInterval(() => {
        fetchConversations()
      }, 10000) // Refresh every 10 seconds
      
      // Clean up on unmount
      return () => clearInterval(refreshInterval)
    }
  }, [status, router])
  
  // Add a focus effect to refresh conversations when tab is focused
  useEffect(() => {
    // Function to refresh conversations when tab regains focus
    const handleFocus = () => {
      if (status === 'authenticated') {
        fetchConversations()
      }
    }
    
    // Add event listener for when the window regains focus
    window.addEventListener('focus', handleFocus)
    
    // Clean up
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [status])
  
  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/messages')
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      
      const data = await response.json()
      setConversations(data.conversations)
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchFollowedUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch('/api/users/following')
      
      if (!response.ok) {
        throw new Error('Failed to fetch followed users')
      }
      
      const data = await response.json()
      setFollowedUsers(data.users)
    } catch (err) {
      console.error('Error fetching followed users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }
  
  const handleComposeMessage = () => {
    setShowComposeModal(true)
    fetchFollowedUsers()
  }
  
  const startConversation = (userId: string) => {
    router.push(`/messages/${userId}`)
    setShowComposeModal(false)
  }
  
  const filteredUsers = followedUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    
    // If today, return time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // If this year, return month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
    
    // Otherwise, return full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            <button
              onClick={handleComposeMessage}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
            >
              <FiEdit className="mr-2" />
              Compose
            </button>
          </div>
          
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 flex justify-center">
              <div className="animate-pulse">Loading conversations...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              {error}
            </div>
          ) : conversations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="flex justify-center mb-4">
                <FiMessageSquare className="text-gray-400 text-4xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No messages yet</h2>
              <p className="text-gray-500 mb-4">
                When you connect with other users, your conversations will appear here.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleComposeMessage}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
                >
                  <FiEdit className="mr-2" />
                  Start a conversation
                </button>
                <Link 
                  href="/forum" 
                  className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Explore Forums
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <Link 
                      href={`/messages/${conversation.id}`}
                      className="block hover:bg-gray-50 transition"
                    >
                      <div className="px-6 py-5 flex items-center">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {conversation.image ? (
                            <Image
                              src={conversation.image}
                              alt={conversation.name || 'User'}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiUser className="text-gray-400 text-xl" />
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                              {conversation.name || 'Unknown User'}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {formatDate(conversation.lastMessageTime)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {conversation.lastMessage}
                            </p>
                            
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-600 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800">New Message</h3>
              <button 
                onClick={() => setShowComposeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Search for people you follow..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="p-4 text-center">
                  <div className="animate-pulse">Loading users...</div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No matching users found' : 'You are not following anyone yet'}
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <li key={user.id}>
                      <button
                        onClick={() => startConversation(user.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center"
                      >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || 'User'}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiUser className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">
                            {user.name || 'Unknown User'}
                          </h4>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 