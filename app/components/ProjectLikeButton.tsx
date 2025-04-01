"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FiHeart } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface ProjectLikeButtonProps {
  projectId: string;
  initialLikes: number;
}

export default function ProjectLikeButton({ projectId, initialLikes }: ProjectLikeButtonProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user has already liked this project
    const checkLikeStatus = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch(`/api/projects/like?projectId=${projectId}`);
        const data = await response.json();
        setIsLiked(data.liked);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [session, projectId]);

  const handleLike = async () => {
    if (!session?.user) {
      // Redirect to login if not logged in
      router.push("/api/auth/signin");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/projects/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      // Update state based on response
      setIsLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Error liking project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1 px-4 py-2 rounded-lg transition ${
        isLiked
          ? "bg-pink-100 text-pink-600 hover:bg-pink-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <FiHeart className={`${isLiked ? "fill-current" : ""}`} />
      <span>{likeCount}</span>
    </button>
  );
} 