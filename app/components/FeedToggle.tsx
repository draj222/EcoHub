"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiUsers, FiClock } from "react-icons/fi";

export default function FeedToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  // Get current filter from URL or default to "latest"
  const filter = searchParams.get("filter") || "latest";
  
  // Only show the toggle if the user is logged in
  if (!session) {
    return null;
  }
  
  const handleFilterChange = (newFilter: string) => {
    // Create a new URLSearchParams object with the current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or add the filter param
    params.set("filter", newFilter);
    
    // Navigate to the new URL with the updated params
    router.push(`/?${params.toString()}`);
  };
  
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button 
            onClick={() => handleFilterChange("for-you")}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              filter === "for-you" 
                ? "border-green-500 text-green-500" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FiUsers className="inline mr-2" />
            For You
          </button>
          <button 
            onClick={() => handleFilterChange("latest")}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              filter === "latest" 
                ? "border-green-500 text-green-500" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FiClock className="inline mr-2" />
            Latest
          </button>
        </div>
      </div>
    </div>
  );
} 