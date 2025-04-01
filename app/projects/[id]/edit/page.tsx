"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import { FiImage, FiTag, FiInfo, FiFileText, FiSave, FiUpload } from "react-icons/fi";
import { Project } from "@/app/interfaces";
import Image from "next/image";

export default function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    tags: "",
  });
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?error=Please sign in to edit a project");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchProject();
    }
  }, [status, session, router, params.id]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }
      
      const data = await response.json();
      
      // Check if the current user is the author
      if (data.userId !== session?.user?.id) {
        router.push(`/projects/${params.id}?error=You can only edit your own projects`);
        return;
      }
      
      setProject(data);
      setFormData({
        title: data.title,
        description: data.description,
        content: data.content || "",
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
      });
      
      // Set the current image URL
      setCurrentImageUrl(data.imageUrl || "");
    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Failed to load project details");
    } finally {
      setIsLoading(false);
    }
  };

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
      
      // Clean up previous preview URL if it exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Create a preview URL for the image
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      let imageUrl = currentImageUrl;

      // Upload the image if a new one was selected
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

      // Format tags: split by comma and trim whitespace
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const response = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update project");
      }

      const updatedProject = await response.json();
      router.push(`/projects/${updatedProject.id}`);
    } catch (error) {
      console.error("Error updating project:", error);
      setError(error instanceof Error ? error.message : "Failed to update project");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Edit Project
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
                    ) : currentImageUrl ? (
                      <div className="relative w-full h-40 mb-3">
                        <Image
                          src={currentImageUrl}
                          alt="Current project image"
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
                      {previewUrl || currentImageUrl ? "Change Image" : "Select Image"}
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
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition flex-1"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center hover:from-green-500 hover:to-green-700 transition ${
                    isSaving ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <FiSave className="mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 