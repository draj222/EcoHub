"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMessageSquare, FiThumbsUp, FiUser, FiCalendar, FiMessageCircle } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Project, Post, FeedItem } from "@/app/interfaces";

// Type guard functions
const isPost = (item: FeedItem): item is Post => {
  return item.type === 'post';
};

const isProject = (item: FeedItem): item is Project => {
  return !item.type || item.type === 'project';
};

export default function ProjectFeed() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "latest";
  
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFeed();
  }, [filter]);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      let endpoint = "/api/projects";
      
      // Use feed API for authenticated users viewing "for-you" content
      if (session && filter === "for-you") {
        endpoint = "/api/feed";
      } else {
        // Add filter param for other views
        endpoint = `/api/projects?filter=${filter}`;
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error("Failed to fetch feed");
      }
      
      const data = await response.json();
      setFeedItems(data);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError("Failed to load feed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (feedItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
        {filter === "for-you" ? (
          <>
            <p className="text-gray-600 mb-4">
              Your feed is empty. Start following users to see their projects and posts here.
            </p>
            <Link 
              href="/explore"
              className="text-green-500 hover:text-green-700 font-medium"
            >
              Explore users to follow
            </Link>
          </>
        ) : (
          <p className="text-gray-600">
            No projects found. Check back later!
          </p>
        )}
      </div>
    );
  }

  const renderFeedItem = (item: FeedItem) => {
    if (isPost(item)) {
      const hasUserImage = item.user.image && 
        !item.user.image.includes('api.dicebear.com') && 
        item.user.image.trim() !== '';

      const userImageSrc = hasUserImage && item.user.image ? item.user.image : '';

      return (
        <Link 
          key={item.id}
          href={`/forum/posts/${item.id}`}
          className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
        >
          <div className="p-6">
            <div className="mb-2 text-xs">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {item.topic.name}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {item.title}
            </h3>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {item.content.substring(0, 150)}...
            </p>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                    {hasUserImage ? (
                      <Image
                        src={userImageSrc}
                        alt={item.user.name || "User"}
                        fill
                        className="object-cover"
                        style={{ aspectRatio: "1/1" }}
                        priority
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <span>{item.user.name}</span>
                </div>
                
                <div className="flex items-center">
                  <FiCalendar className="mr-1" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <FiMessageCircle className="mr-1" />
                  <span>{item.commentsCount}</span>
                </div>
                
                <div className="flex items-center">
                  <FiThumbsUp className="mr-1" />
                  <span>{item.likesCount}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      );
    } else if (isProject(item)) {
      const hasUserImage = item.user.image && 
        !item.user.image.includes('api.dicebear.com') && 
        item.user.image.trim() !== '';

      const userImageSrc = hasUserImage && item.user.image ? item.user.image : '';

      return (
        <Link 
          key={item.id}
          href={`/projects/${item.id}`}
          className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
        >
          {item.imageUrl && (
            <div className="relative h-48 w-full">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {item.title}
            </h3>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                    {hasUserImage ? (
                      <Image
                        src={userImageSrc}
                        alt={item.user.name || "User"}
                        fill
                        className="object-cover"
                        style={{ aspectRatio: "1/1" }}
                        priority
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <span>{item.user.name}</span>
                </div>
                
                <div className="flex items-center">
                  <FiCalendar className="mr-1" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <FiMessageSquare className="mr-1" />
                  <span>{item.commentsCount || 0}</span>
                </div>
                
                <div className="flex items-center">
                  <FiThumbsUp className="mr-1" />
                  <span>{item.likesCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      );
    }
    
    // Default fallback in case the type is unknown
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {feedItems.map(renderFeedItem)}
    </div>
  );
} 