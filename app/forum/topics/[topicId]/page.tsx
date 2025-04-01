"use client";

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { FiArrowLeft, FiChevronRight, FiMessageSquare, FiUser, FiPlus } from 'react-icons/fi'

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  topic: {
    id: string;
    name: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  _count: {
    posts: number;
    members: number;
  };
}

export default function TopicPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params?.topicId as string;
  const { data: session, status } = useSession();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    
    const fetchTopicData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching topic data for:", topicId);
        
        // Fetch topic data
        const topicResponse = await fetch(`/api/forum/topics/${topicId}`);
        
        if (!topicResponse.ok) {
          const errorData = await topicResponse.json();
          const errorMessage = errorData?.error || `Failed to fetch topic (${topicResponse.status})`;
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
        
        const topicData = await topicResponse.json();
        console.log("Topic data received:", topicData);
        setTopic(topicData);
        
        // Fetch membership status if user is logged in
        if (session?.user) {
          try {
            const membershipResponse = await fetch(`/api/forum/topics/member?topicId=${topicData.id}`);
            if (membershipResponse.ok) {
              const { joined } = await membershipResponse.json();
              setIsMember(joined);
            }
          } catch (membershipError) {
            console.error("Error checking membership:", membershipError);
            // Non-critical error, don't set main error state
          }
        }
        
        await fetchPosts(topicData.id);
        
      } catch (err: any) {
        console.error("Error fetching topic data:", err);
        setError(err.message || "Failed to load topic");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicData();
  }, [topicId, session]);

  const fetchPosts = async (topicId: string, page = 1) => {
    try {
      setLoadingPosts(true);
      console.log(`Fetching posts for topic: ${topicId}, page: ${page}`);
      
      const postsResponse = await fetch(
        `/api/forum/topics/${topicId}/posts?page=${page}&limit=10`
      );
      
      if (!postsResponse.ok) {
        throw new Error(`Failed to fetch posts (${postsResponse.status})`);
      }
      
      const { posts: postsData, pagination } = await postsResponse.json();
      
      setPosts(postsData);
      setCurrentPage(pagination.page);
      setTotalPages(pagination.pages);
      
    } catch (err) {
      console.error("Error fetching posts:", err);
      // Don't set the main error state, as we still want to display the topic
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleJoinToggle = async () => {
    if (!session) {
      router.push('/signin?callbackUrl=' + encodeURIComponent(`/forum/topics/${topicId}`));
      return;
    }
    
    try {
      setIsJoining(true);
      
      const action = isMember ? 'leave' : 'join';
      const response = await fetch(`/api/forum/topics/member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topic?.id,
          action,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} topic`);
      }
      
      setIsMember(!isMember);
      
      // Update the member count locally
      if (topic) {
        setTopic({
          ...topic,
          _count: {
            ...topic._count,
            members: topic._count.members + (isMember ? -1 : 1),
          },
        });
      }
      
    } catch (err) {
      console.error("Error toggling membership:", err);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-48 bg-gray-200 rounded mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-24 bg-gray-200 rounded mb-4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="bg-red-50 text-red-600 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-2">Topic Not Found</h2>
              <p>{error || "We couldn't find the topic you're looking for."}</p>
            </div>
            <Link 
              href="/forum"
              className="text-green-600 hover:text-green-700 flex items-center"
            >
              <FiArrowLeft className="mr-2" /> Back to Forum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center mb-6 text-sm text-gray-500">
            <Link href="/forum" className="hover:text-green-600">Forum</Link>
            <FiChevronRight className="mx-2" />
            <span className="text-gray-700 font-medium">{topic.name}</span>
          </div>
          
          {/* Topic Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{topic.name}</h1>
                  <div className="mt-1 inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {topic.category}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <button
                    onClick={handleJoinToggle}
                    disabled={isJoining}
                    className={`px-4 py-2 rounded-full transition ${
                      isMember
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {isJoining
                      ? "Processing..."
                      : isMember
                      ? "Leave Topic"
                      : "Join Topic"}
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{topic.description}</p>
              
              <div className="flex items-center text-sm text-gray-500">
                <div className="mr-4 flex items-center">
                  <FiMessageSquare className="mr-1" />
                  <span>{topic._count?.posts || 0} Posts</span>
                </div>
                <div className="flex items-center">
                  <FiUser className="mr-1" />
                  <span>{topic._count?.members || 0} Members</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Create Post Button */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Posts</h2>
            
            <Link 
              href={`/forum/posts/create?topicId=${topic.id}`}
              className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-500 hover:to-green-700 transition flex items-center"
            >
              <FiPlus className="mr-2" /> New Post
            </Link>
          </div>
          
          {/* Posts List */}
          {loadingPosts ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/posts/${post.id}`}
                  className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {post.title}
                    </h3>
                    
                    <div className="text-gray-600 mb-4 line-clamp-2">
                      {post.content}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <span>By {post.user.name}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <FiMessageSquare className="mr-1" />
                          <span>{post._count.comments} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => fetchPosts(topic.id, page)}
                      className={`px-3 py-1 rounded-md transition ${
                        currentPage === page
                          ? "bg-green-500 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
              <p className="text-gray-500 mb-4">No posts in this topic yet.</p>
              <Link
                href={`/forum/posts/create?topicId=${topic.id}`}
                className="text-green-600 hover:text-green-700"
              >
                Be the first to create a post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 