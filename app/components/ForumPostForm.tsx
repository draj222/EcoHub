"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import Link from "next/link";

interface Topic {
  id: string;
  name: string;
  slug: string;
  category: string;
}

export default function ForumPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topicId, setTopicId] = useState(searchParams.get("topicId") || "");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/signin?redirect=/forum/posts/create");
      return;
    }

    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/forum/topics');
        
        if (!response.ok) {
          throw new Error("Failed to fetch topics");
        }
        
        const topicsData = await response.json();
        setTopics(topicsData);
        
        // If topicId from URL isn't valid, clear it
        if (topicId && !topicsData.some((t: Topic) => t.id === topicId)) {
          setTopicId("");
        }
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError("Failed to load topics");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchTopics();
    }
  }, [router, status, topicId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !topicId) {
      setError("All fields are required");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // Create the post via API
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          topicId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }
      
      const newPost = await response.json();
      
      // For mocking purposes, we'll handle both real post IDs and mock ones
      const postId = newPost.id;
      
      // Redirect to the newly created post
      router.push(`/forum/posts/${postId}`);
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">Loading...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/forum"
          className="flex items-center text-gray-600 hover:text-green-600 transition"
        >
          <FiArrowLeft className="mr-2" /> Back to Forum
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Create New Forum Post
          </h1>
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <select
                id="topic"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                required
              >
                <option value="" disabled>Select a topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name} ({topic.category})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="Enter a descriptive title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition min-h-[300px] resize-y"
                placeholder="Share your thoughts, questions, or ideas..."
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-6 rounded-lg hover:from-green-500 hover:to-green-700 transition flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Post...</span>
                  </>
                ) : (
                  <>
                    <FiSend />
                    <span>Create Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 