"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { useSession } from "next-auth/react";
import { FiImage, FiTag, FiInfo, FiFileText, FiPlusCircle, FiUpload } from "react-icons/fi";
import Image from "next/image";

export default function CreateProjectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    tags: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/signin?error=Please sign in to create a project");
    return null;
  }

  // Clean up preview URL when component unmounts
  if (typeof window !== "undefined") {
    window.onbeforeunload = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL for the image
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let imageUrl = "";

      // First, upload the image if one was selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Failed to upload image");
        }
        
        const { fileUrl } = await uploadResponse.json();
        imageUrl = fileUrl;
      }

      // Then create the project with the image URL
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          authorId: session?.user?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create project");
      }

      const project = await response.json();
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      setError(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Create a New Project
            </h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="title"
                  className="flex items-center text-gray-700 font-medium mb-2"
                >
                  <FiInfo className="mr-2" /> Project Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Enter a descriptive title for your project"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="description"
                  className="flex items-center text-gray-700 font-medium mb-2"
                >
                  <FiFileText className="mr-2" /> Short Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="A brief summary of your project"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="content"
                  className="flex items-center text-gray-700 font-medium mb-2"
                >
                  <FiFileText className="mr-2" /> Project Details
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition h-36"
                  placeholder="Describe your project in detail - what problem does it solve? How does it work? What makes it unique?"
                />
              </div>
              
              <div>
                <label 
                  className="flex items-center text-gray-700 font-medium mb-2"
                >
                  <FiImage className="mr-2" /> Project Image
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
                    {previewUrl ? (
                      <div className="relative w-full h-40 mb-3">
                        <Image
                          src={previewUrl}
                          alt="Project preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <FiImage className="mx-auto text-gray-400 text-4xl mb-2" />
                        <p className="text-gray-500">No image selected</p>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition flex items-center justify-center"
                    >
                      <FiUpload className="mr-2" />
                      {previewUrl ? "Change Image" : "Select Image"}
                    </button>
                    
                    {selectedFile && (
                      <div className="text-sm text-gray-600 mt-2">
                        {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label 
                  htmlFor="tags"
                  className="flex items-center text-gray-700 font-medium mb-2"
                >
                  <FiTag className="mr-2" /> Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Separate tags with commas (e.g. renewable, water, conservation)"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-green-400 to-green-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center hover:from-green-500 hover:to-green-700 transition ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <FiPlusCircle className="mr-2" />
                {isLoading ? "Creating Project..." : "Create Project"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 