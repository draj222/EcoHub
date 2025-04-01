'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { Comment } from '@/app/types'

interface CommentSectionProps {
  projectId: string
}

export default function CommentSection({ projectId }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(`/api/projects/${projectId}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments(data)
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [projectId])

  // Mock data for demonstration until API is implemented
  useEffect(() => {
    const mockComments = [
      {
        id: '1',
        content: 'This project is incredibly innovative! I would love to see this implemented in my city.',
        user: {
          id: '1',
          name: 'Sarah Johnson',
          image: 'https://randomuser.me/api/portraits/women/32.jpg',
        },
        projectId,
        createdAt: new Date(2023, 3, 10).toISOString(),
      },
      {
        id: '2',
        content: 'Have you considered the impact on local wildlife? I would be interested in seeing more data on this aspect.',
        user: {
          id: '2',
          name: 'David Chen',
          image: 'https://randomuser.me/api/portraits/men/42.jpg',
        },
        projectId,
        createdAt: new Date(2023, 3, 12).toISOString(),
      },
      {
        id: '3',
        content: "I've been working on a similar initiative. Would love to connect and share ideas!",
        user: {
          id: '3',
          name: 'Elena Rodriguez',
          image: 'https://randomuser.me/api/portraits/women/56.jpg',
        },
        projectId,
        createdAt: new Date(2023, 3, 15).toISOString(),
      },
    ];
    
    setComments(mockComments as Comment[]);
    setLoading(false);
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments([...comments, data])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

      {session && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex space-x-4">
            <div className="flex-shrink-0 relative w-10 h-10 rounded-full overflow-hidden">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  style={{ aspectRatio: "1/1" }}
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              )}
            </div>
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="input h-24 resize-none"
                required
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-grow">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <div className="flex-shrink-0 relative w-10 h-10 rounded-full overflow-hidden">
                {comment.user.image ? (
                  <Image
                    src={comment.user.image}
                    alt={comment.user.name || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    style={{ aspectRatio: "1/1" }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{comment.user.name}</h4>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}

      {!session && (
        <div className="mt-6 text-center">
          <p className="text-gray-500 mb-2">Sign in to join the conversation</p>
          <a href="/signin" className="btn btn-primary">
            Sign In
          </a>
        </div>
      )}
    </div>
  )
} 