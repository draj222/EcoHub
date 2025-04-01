"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Link from "next/link";
import Image from "next/image";
import { 
  FiMessageSquare, 
  FiUser, 
  FiClock, 
  FiThumbsUp, 
  FiEdit, 
  FiArrowLeft
} from "react-icons/fi";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  topicId: string;
  topic: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  user: {
    id: string;
    name: string;
    image: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

export default function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Fetch real post data from API
        const response = await fetch(`/api/forum/posts/${params.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch post: ${response.statusText}`);
        }
        
        const postData = await response.json();
        
        if (!postData) {
          setError("Post not found");
          setIsLoading(false);
          return;
        }
        
        setPost(postData);
        setLikeCount(postData._count?.likes || 0);
        
        // Fetch comments
        const commentsResponse = await fetch(`/api/forum/posts/${params.id}/comments`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }

        // Check if user liked the post
        if (session?.user) {
          try {
            const likeResponse = await fetch(`/api/forum/posts/like?postId=${params.id}`);
            if (likeResponse.ok) {
              const likeData = await likeResponse.json();
              setLiked(likeData.liked);
            }
          } catch (likeError) {
            console.error("Error checking like status:", likeError);
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.id, session]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !session) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/forum/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      
      const commentData = await response.json();
      setComments(prev => [...prev, commentData]);
      setNewComment("");
      
      // Update comment count in post
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          _count: {
            ...prevPost._count,
            comments: prevPost._count.comments + 1
          }
        };
      });
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like toggle
  const handleLike = async () => {
    if (!session) {
      router.push(`/api/auth/signin?callbackUrl=/forum/posts/${params.id}`);
      return;
    }

    setIsLikeLoading(true);
    try {
      const response = await fetch('/api/forum/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: params.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like status');
      }

      const data = await response.json();
      setLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Check if current user is the author
  const isAuthor = session?.user?.id === post?.user.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error || "Post not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link 
              href={`/forum/topics/${post.topic.id}`}
              className="flex items-center text-gray-600 hover:text-green-600 transition"
            >
              <FiArrowLeft className="mr-2" /> 
              Back to {post.topic.name}
            </Link>
          </div>
          
          {/* Post Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                  {post.title}
                </h1>
                
                {isAuthor && (
                  <Link 
                    href={`/forum/posts/${post.id}/edit`}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <FiEdit />
                    <span>Edit Post</span>
                  </Link>
                )}
              </div>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  <Link href={`/profile/${post.user.id}`} className="flex items-center">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                      {post.user.image ? (
                        (() => {
                          // Check if user has a valid profile image
                          const hasUserImage = post.user.image && 
                            !post.user.image.includes('api.dicebear.com') && 
                            post.user.image.trim() !== '';
                          
                          // Get image source with type safety
                          const userImageSrc = hasUserImage && post.user.image ? post.user.image : '';
                          
                          return hasUserImage ? (
                            <Image
                              src={userImageSrc}
                              alt={post.user.name}
                              fill
                              className="object-cover"
                              style={{ aspectRatio: "1/1" }}
                              priority
                            />
                          ) : (
                            <div className="bg-green-100 w-full h-full flex items-center justify-center">
                              <FiUser className="text-green-500" />
                            </div>
                          );
                        })()
                      ) : (
                        <div className="bg-green-100 w-full h-full flex items-center justify-center">
                          <FiUser className="text-green-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{post.user.name}</p>
                      <p className="text-sm text-gray-500">
                        <FiClock className="inline mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                </div>
                
                <div className="ml-auto flex items-center space-x-4">
                  <button 
                    onClick={handleLike}
                    disabled={isLikeLoading}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                      liked 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-label={liked ? "Unlike post" : "Like post"}
                  >
                    {liked ? (
                      <FiThumbsUp className="fill-current text-green-800" />
                    ) : (
                      <FiThumbsUp />
                    )}
                    <span>{likeCount}</span>
                  </button>
                  
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                    {post.topic.category}
                  </span>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none mb-6">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">
                Comments ({post._count.comments})
              </h2>
              
              {session ? (
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0 relative w-10 h-10 rounded-full overflow-hidden">
                      {session.user?.image ? (
                        (() => {
                          // Check if user has a valid profile image
                          const hasUserImage = session.user.image && 
                            !session.user.image.includes('api.dicebear.com') && 
                            session.user.image.trim() !== '';
                          
                          // Get image source with type safety
                          const userImageSrc = hasUserImage && session.user.image ? session.user.image : '';
                          
                          return hasUserImage ? (
                            <Image
                              src={userImageSrc}
                              alt={session.user.name || "User"}
                              fill
                              className="object-cover"
                              style={{ aspectRatio: "1/1" }}
                              priority
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <FiUser className="text-gray-500" />
                            </div>
                          );
                        })()
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FiUser className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition h-24 resize-none"
                        required
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting || !newComment.trim()}
                          className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-500 hover:to-green-700 transition disabled:opacity-50"
                        >
                          {isSubmitting ? "Posting..." : "Post Comment"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 mb-2">Sign in to join the conversation</p>
                  <Link
                    href={`/signin?redirect=/forum/posts/${post.id}`}
                    className="text-green-500 hover:text-green-700 font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              )}
              
              {comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4">
                      <div className="flex-shrink-0 relative w-10 h-10 rounded-full overflow-hidden">
                        {comment.user.image ? (
                          <Image
                            src={comment.user.image}
                            alt={comment.user.name}
                            fill
                            className="object-cover"
                            style={{ aspectRatio: "1/1" }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <FiUser className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{comment.user.name}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 