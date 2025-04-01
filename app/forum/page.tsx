"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import Link from "next/link";
import Image from "next/image";
import { 
  FiMessageSquare, 
  FiUser, 
  FiClock, 
  FiPlus, 
  FiBookmark, 
  FiActivity,
  FiFilter,
  FiChevronRight,
  FiThumbsUp
} from "react-icons/fi";

interface Post {
  id: string;
  title: string;
  createdAt: string;
  topic: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  user: {
    id: string;
    name: string;
    image: string | null;
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

interface TopicCategory {
  name: string;
  topics: Topic[];
}

export default function ForumPage() {
  const { data: session } = useSession();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<TopicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'topics' | 'recent'>('topics');
  
  useEffect(() => {
    const fetchForumData = async () => {
      try {
        // Fetch topics
        const topicsResponse = await fetch('/api/forum/topics');
        
        if (!topicsResponse.ok) {
          throw new Error("Failed to fetch topics");
        }
        
        const topics = await topicsResponse.json();
        
        // Group topics by category
        const categorizedTopics: {[key: string]: Topic[]} = {};
        topics.forEach((topic: Topic) => {
          if (!categorizedTopics[topic.category]) {
            categorizedTopics[topic.category] = [];
          }
          categorizedTopics[topic.category].push(topic);
        });
        
        // Convert to array format
        const formattedCategories = Object.keys(categorizedTopics).map(category => ({
          name: category,
          topics: categorizedTopics[category],
        }));
        
        setCategories(formattedCategories);
        
        // Fetch recent posts
        const postsResponse = await fetch('/api/forum/posts?limit=5');
        
        if (!postsResponse.ok) {
          throw new Error("Failed to fetch recent posts");
        }
        
        const { posts } = await postsResponse.json();
        setRecentPosts(posts);
      } catch (err) {
        console.error("Error fetching forum data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForumData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse">Loading forum data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">EcoHub Forum</h1>
          
          {session && (
            <Link 
              href="/forum/posts/create"
              className="flex items-center bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-500 hover:to-green-700 transition"
            >
              <FiPlus className="mr-2" />
              <span>Create Post</span>
            </Link>
          )}
        </div>
        
        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('topics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'topics'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition`}
            >
              <FiBookmark className="inline mr-2" />
              Topics
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recent'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition`}
            >
              <FiActivity className="inline mr-2" />
              Recent Posts
            </button>
          </nav>
        </div>

        {/* Topics View */}
        {activeTab === 'topics' && (
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category.name}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  {category.name}
                </h2>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {category.topics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/forum/topics/${topic.id}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {topic.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {topic.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiMessageSquare className="mr-1" />
                          <span>{topic._count?.posts || 0} Posts</span>
                          
                          <span className="mx-2">•</span>
                          
                          <FiUser className="mr-1" />
                          <span>{topic._count?.members || 0} Members</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Posts View */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            {recentPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 text-center">
                <p className="text-gray-500">No posts yet. Be the first to create a post!</p>
              </div>
            ) : (
              recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/posts/${post.id}`}
                  className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Link
                        href={`/forum/topics/${post.topic.id}`}
                        className="bg-gray-100 rounded-full px-3 py-1 hover:bg-gray-200 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {post.topic.name}
                      </Link>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2 bg-gray-100 flex items-center justify-center">
                          {post.user.image ? (
                            <Image
                              src={post.user.image}
                              alt={post.user.name || "User"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <FiUser className="text-gray-400" size={14} />
                          )}
                        </div>
                        <span>{post.user.name}</span>
                      </div>
                      
                      <span className="mx-2">•</span>
                      
                      <div className="flex items-center">
                        <FiClock className="mr-1" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <FiMessageSquare className="mr-1" />
                        <span>{post._count.comments} Comments</span>
                      </div>
                      <div className="flex items-center">
                        <FiThumbsUp className="mr-1" />
                        <span>{post._count.likes} Likes</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 