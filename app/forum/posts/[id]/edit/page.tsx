"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import Header from "@/app/components/Header";
import Link from "next/link";

export default function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push(`/signin?redirect=/forum/posts/${params.id}/edit`);
      return;
    }

    const fetchPost = async () => {
      try {
        // In a real implementation, fetch from API
        // For now, set mock data
        const mockPost = {
          id: params.id,
          title: "Hydro Research Paper",
          content: "Cool Machine Learning approach of this stuff\n\nyou know",
          userId: "user1" // This should match the current user's ID for edit permission
        };
        
        // Verify user is the author
        if (session?.user?.id !== mockPost.userId) {
          setError("You don't have permission to edit this post");
          return;
        }
        
        setTitle(mockPost.title);
        setContent(mockPost.content);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchPost();
    }
  }, [params.id, router, session, status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }
    
    setIsSaving(true);
    setSaveSuccess(false);
    setError("");
    
    try {
      // In a real implementation, send to API
      // For demonstration, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      
      // Redirect back to post page after a short delay
      setTimeout(() => {
        router.push(`/forum/posts/${params.id}`);
      }, 1500);
    } catch (err) {
      console.error("Error updating post:", err);
      setError("Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

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

  if (error && error === "You don't have permission to edit this post") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 text-red-500 p-4 rounded-lg">
              {error}
            </div>
            <div className="mt-4">
              <Link 
                href={`/forum/posts/${params.id}`}
                className="text-green-600 hover:text-green-800 transition flex items-center"
              >
                <FiArrowLeft className="mr-2" /> Back to post
              </Link>
            </div>
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
              href={`/forum/posts/${params.id}`}
              className="flex items-center text-gray-600 hover:text-green-600 transition"
            >
              <FiArrowLeft className="mr-2" /> Back to post
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Edit Forum Post
              </h1>
              
              {saveSuccess && (
                <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg">
                  Post updated successfully! Redirecting...
                </div>
              )}
              
              {error && error !== "You don't have permission to edit this post" && (
                <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-lg">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-6 rounded-lg hover:from-green-500 hover:to-green-700 transition flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 