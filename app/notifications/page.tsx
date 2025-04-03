'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FiUser } from 'react-icons/fi'
import Link from 'next/link'
import ProfileImageDebug from '@/app/components/ProfileImageDebug'

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
  contentTitle?: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?error=Please sign in to view your notifications')
      return
    }

    if (status === 'authenticated') {
      fetchNotifications()
    }
  }, [status, router])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, you would fetch from an API
      // const response = await fetch('/api/notifications')
      // const data = await response.json()
      
      // For now, set empty notifications for new users
      setNotifications([])
      
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
      
      // In a real implementation, you would update on the server
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' })
    } catch (error) {
      console.error('Failed to mark notification as read', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
      
      // In a real implementation, you would update on the server
      // await fetch('/api/notifications/read-all', { method: 'PUT' })
    } catch (error) {
      console.error('Failed to mark all notifications as read', error)
    }
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-green-600 hover:text-green-800"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`border-b border-gray-100 ${!notification.read ? 'bg-green-50' : ''}`}
                >
                  <Link
                    href={notification.link || '#'}
                    className="block px-6 py-4 hover:bg-gray-50 transition"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden mr-4 bg-green-100 flex items-center justify-center">
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
                        <p className="text-sm text-gray-900 mb-1">
                          {notification.message}
                        </p>
                        {notification.contentTitle && (notification.type === 'like' || notification.type === 'comment') && (
                          <p className="text-xs text-gray-600 mt-1 italic">
                            "{notification.contentTitle}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-green-500 rounded-full mt-2"></span>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
} 