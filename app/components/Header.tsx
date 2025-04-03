'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiPlus, FiBell } from 'react-icons/fi'
import { useRouter, usePathname } from 'next/navigation'
import ProfileImageDebug from './ProfileImageDebug'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasNewNotifications, setHasNewNotifications] = useState(false)
  const [profileImageKey, setProfileImageKey] = useState(Date.now())
  const pathname = usePathname()
  const notificationRef = useRef<HTMLDivElement>(null)
  const sseRef = useRef<EventSource | null>(null)
  
  // Notification interface
  interface Notification {
    id: string;
    type: 'follow' | 'post' | 'like' | 'comment';
    message: string;
    read: boolean;
    createdAt: string;
    fromUser: {
      id: string;
      name: string | null;
      image: string | null;
    };
    link?: string;
    contentTitle?: string; // Title of the post/project being liked/commented on
  }
  
  // Refresh the component when session changes
  useEffect(() => {
    // Force image refresh when session changes
    setProfileImageKey(Date.now())
  }, [session?.user?.image])
  
  // Fetch notifications when logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchNotifications();
      
      // Set up SSE connection for real-time notifications
      if (!sseRef.current) {
        const eventSource = new EventSource('/api/notifications/sse')
        sseRef.current = eventSource
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data)
          
          // Handle initial connection message
          if (data.type === 'connected') {
            console.log('Connected to notification stream')
            return
          }
          
          // Handle new notification
          console.log('Received new notification:', data)
          setNotifications(prev => [data, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Optional: Show notification to user
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(data.message, {
              icon: '/images/logo.png',
              body: data.contentTitle || ''
            })
          }
        }
        
        eventSource.onerror = (error) => {
          console.error('SSE Error:', error)
          if (sseRef.current) {
            sseRef.current.close()
            sseRef.current = null
          }
        }
      }
      
      // Clean up on component unmount
      return () => {
        if (sseRef.current) {
          sseRef.current.close()
          sseRef.current = null
        }
      }
    }
  }, [status, session]);
  
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }
  
  const markAsRead = (notificationId: string) => {
    // Update local state
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // Check if all notifications are now read
    if (notifications.every(notification => notification.read)) {
      setHasNewNotifications(false);
    }
    
    // TODO: Call API to update read status on server
  };
  
  const markAllAsRead = () => {
    // Update all notifications to read
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setHasNewNotifications(false);
    
    // TODO: Call API to update all notifications as read on server
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
    if (profileMenuOpen) setProfileMenuOpen(false)
    if (notificationsOpen) setNotificationsOpen(false)
  }
  
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen)
    if (notificationsOpen) setNotificationsOpen(false)
  }
  
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
    if (profileMenuOpen) setProfileMenuOpen(false)
  }
  
  const handleSignOut = () => {
    signOut()
  }

  // Determine if the user has a valid profile image
  const hasUserImage = session?.user?.image && 
    session.user.image.trim() !== '';

  // Get the image source with type safety
  const userImageSrc = hasUserImage && session?.user?.image ? session.user.image : '';
  const isBase64Image = userImageSrc.startsWith('data:image');
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-green-600 tracking-tight">EcoHub</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-green-600">Home</Link>
            <Link href="/projects" className="text-gray-600 hover:text-green-600">Projects</Link>
            <Link href="/community" className="text-gray-600 hover:text-green-600">Volunteer</Link>
            {session && (
              <Link href="/messages" className="text-gray-600 hover:text-green-600">Messages</Link>
            )}
            <Link href="/about" className="text-gray-600 hover:text-green-600">About</Link>
          </nav>
          
          {/* Auth Buttons or Profile */}
          <div className="flex items-center">
            {session ? (
              <>
                {/* Notification Bell */}
                <div className="relative mr-4">
                  <button
                    onClick={toggleNotifications}
                    className="relative p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                    aria-label="Notifications"
                  >
                    <FiBell className="h-6 w-6 text-gray-600" />
                    {hasNewNotifications && (
                      <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-medium">Notifications</h3>
                        {hasNewNotifications && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(notification => (
                            <Link
                              key={notification.id}
                              href={notification.link || '#'}
                              className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${!notification.read ? 'bg-green-50' : ''}`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start">
                                <div className="relative h-8 w-8 rounded-full overflow-hidden mr-3 bg-green-100 flex items-center justify-center">
                                  {notification.fromUser.image ? (
                                    <ProfileImageDebug
                                      imageUrl={notification.fromUser.image}
                                      userName={notification.fromUser.name || undefined}
                                      size="sm"
                                    />
                                  ) : (
                                    <FiUser className="text-green-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900">
                                    {notification.message}
                                  </p>
                                  {notification.contentTitle && (notification.type === 'like' || notification.type === 'comment') && (
                                    <p className="text-xs text-gray-600 mt-1 italic">
                                      "{notification.contentTitle}"
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                                )}
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* User Profile */}
                <div className="relative ml-3">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center focus:outline-none"
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-green-100">
                      {hasUserImage ? (
                        <ProfileImageDebug
                          imageUrl={userImageSrc}
                          userName={session.user.name || undefined}
                          size="sm"
                          className="border-0"
                        />
                      ) : (
                        <div className="bg-green-100 w-full h-full flex items-center justify-center">
                          <FiUser className="text-green-500" />
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {/* Profile Dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium">{session.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <FiUser className="inline mr-2" />
                        Profile
                      </Link>
                      <Link
                        href="/projects/create"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <FiPlus className="inline mr-2" />
                        New Project
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <FiSettings className="inline mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiLogOut className="inline mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/signin"
                  className="bg-white border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="ml-4 md:hidden text-gray-600 hover:text-green-600 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-green-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/projects" 
                className="text-gray-600 hover:text-green-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link 
                href="/community" 
                className="text-gray-600 hover:text-green-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Volunteer
              </Link>
              {session && (
                <Link 
                  href="/messages" 
                  className="text-gray-600 hover:text-green-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
              )}
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-green-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              
              {!session && (
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    href="/signin"
                    className="inline-block w-full text-center bg-white border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 