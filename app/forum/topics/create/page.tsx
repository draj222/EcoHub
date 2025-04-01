"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { FiInfo, FiFileText, FiSave, FiTag } from "react-icons/fi";

// Default categories
const CATEGORIES = [
  "General",
  "Science",
  "Technology",
  "Policy",
  "Education",
  "Action"
];

export default function CreateTopicPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: CATEGORIES[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/signin?redirect=/forum/topics/create");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate a slug from the name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      
      console.log("Submitting topic:", { ...formData, slug });
      
      const response = await fetch("/api/forum/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          slug,
        }),
      });

      const responseData = await response.json();
      
      if (response.ok) {
        console.log("Topic created successfully:", responseData);
        router.push(`/forum/topics/${responseData.id}`);
      } else {
        console.error("Error creating topic:", responseData);
        throw new Error(responseData.error || "Failed to create topic");
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      alert("Failed to create topic. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Create a New Topic</h1>
          
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6">
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Topic Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter a clear, descriptive name"
                required
                maxLength={100}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Explain what this topic is about and the kind of discussions you'd like to see"
                required
                rows={4}
                maxLength={500}
              />
            </div>
            
            <div className="mb-8">
              <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                Category*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <FiInfo className="mr-1" />
                Select the category that best fits your topic
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <Link
                href="/forum"
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-6 rounded-lg hover:from-green-500 hover:to-green-700 transition flex items-center disabled:opacity-50"
              >
                <FiSave className="mr-2" />
                {isSubmitting ? "Creating..." : "Create Topic"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 