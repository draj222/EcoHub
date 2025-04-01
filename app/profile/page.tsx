"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { FiUser, FiCalendar, FiEdit, FiTrash2, FiCamera, FiUpload, FiHeart, FiMessageSquare } from "react-icons/fi";
import Link from "next/link";
import { Project, Post } from "@/app/interfaces";
import Image from "next/image";

// Define interfaces for liked items
interface LikedPostUser {
  id: string;
  name: string;
  image: string;
}

interface LikedPostTopic {
  id: string;
  name: string;
  slug: string;
}

interface LikedPostCounts {
  comments: number;
  likes: number;
}

interface LikedPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  topic: LikedPostTopic;
  user: LikedPostUser;
  _count: LikedPostCounts;
  likedAt: string;
  type: 'post';
}

interface LikedProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
  tags: string[];
  user: LikedPostUser;
  _count: LikedPostCounts;
  likedAt: string;
  type: 'project';
}

type LikedItem = LikedPost | LikedProject;

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [likedPosts, setLikedPosts] = useState<LikedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'liked'>('projects');
  const [isLoading, setIsLoading] = useState(true);
  const [isLikedLoading, setIsLikedLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Redirect unauthenticated users
    if (status === "unauthenticated") {
      router.push("/signin?error=Please sign in to view your profile");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchUserProjects();
      fetchLikedPosts();
    }
  }, [status, session, router]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchUserProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${session?.user?.id}/projects`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch user projects");
      }
      
      const data = await response.json();
      setUserProjects(data);
    } catch (err) {
      console.error("Error fetching user projects:", err);
      setError("Failed to load your projects");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLikedPosts = async () => {
    setIsLikedLoading(true);
    try {
      const response = await fetch('/api/users/liked-items');
      
      if (!response.ok) {
        throw new Error("Failed to fetch liked items");
      }
      
      const data = await response.json();
      setLikedPosts(data);
    } catch (err) {
      console.error("Error fetching liked items:", err);
      // Don't set error here to prevent disrupting the whole page
    } finally {
      setIsLikedLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // Remove the deleted project from state
      setUserProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.`);
        return;
      }
      
      // Size validation (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError(`File too large. Maximum size is 5MB.`);
        return;
      }
      
      console.log("File selected:", file.name, file.type, file.size);
      setSelectedFile(file);
      setError("");
      
      // Create a preview URL for the image
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      
      // Close the modal after selecting a file
      setShowImageForm(false);
    }
  };

  const uploadProfileImage = async () => {
    if (!selectedFile) return;
    
    setIsUpdatingImage(true);
    setError("");
    
    try {
      console.log("Starting upload for file:", selectedFile.name);
      
      // Step 1: Create FormData with the file
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      // Step 2: Convert the file to base64 data URL
      let uploadResponse;
      try {
        uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        
        const result = await uploadResponse.json();
        
        if (!uploadResponse.ok || !result.fileUrl) {
          throw new Error(result.error || result.details || "Failed to process image");
        }
        
        console.log("File conversion successful");
        
        // Step 3: Update the user's profile with the base64 image
        try {
          const profileUpdateResponse = await fetch("/api/users/profile", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              image: result.fileUrl 
            }),
          });
          
          const profileResult = await profileUpdateResponse.json();
          
          if (!profileUpdateResponse.ok) {
            throw new Error(profileResult.error || "Failed to update profile");
          }
          
          console.log("Profile updated successfully");
          
          // Step 4: Update the session
          if (update) {
            await update({ 
              ...session, 
              user: { 
                ...session?.user, 
                image: result.fileUrl 
              } 
            });
            console.log("Session updated successfully");
          }
          
          // Step 5: Clean up and show success
          setSelectedFile(null);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          
          // Show success by reloading the page
          window.location.reload();
          
        } catch (profileError) {
          console.error("Error updating profile:", profileError);
          throw new Error("Your profile image couldn't be updated. Please try again.");
        }
      } catch (convertError) {
        console.error("Error converting image:", convertError);
        throw new Error("Your image couldn't be processed. Please try a different image.");
      }
    } catch (err) {
      console.error("Error in upload process:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile picture");
    } finally {
      setIsUpdatingImage(false);
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
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative w-24 h-24 bg-green-100 rounded-full overflow-hidden flex items-center justify-center group">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      style={{ aspectRatio: "1/1" }}
                    />
                  ) : session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      fill
                      className="object-cover"
                      style={{ aspectRatio: "1/1" }}
                    />
                  ) : (
                    <FiUser className="text-green-500 text-4xl" />
                  )}
                  
                  <button 
                    onClick={() => setShowImageForm(!showImageForm)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiCamera className="text-white text-xl" />
                  </button>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {session?.user?.name || "User"}
                  </h1>
                  <p className="text-gray-600">{session?.user?.email}</p>
                  <div className="flex items-center justify-center md:justify-start mt-2 text-gray-500">
                    <FiCalendar className="mr-2" />
                    <span>Joined {new Date().toLocaleDateString()}</span>
                  </div>
                  
                  {showImageForm && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/jpeg, image/png, image/gif, image/webp"
                          className="hidden"
                        />
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition flex items-center justify-center"
                            disabled={isUpdatingImage}
                          >
                            <FiUpload className="mr-2" />
                            Select Image
                          </button>
                          {selectedFile && (
                            <div className="text-sm text-gray-600">
                              {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                            </div>
                          )}
                        </div>
                        {error && (
                          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                            {error}
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={uploadProfileImage}
                            disabled={isUpdatingImage || !selectedFile}
                            className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center justify-center ${!selectedFile || isUpdatingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isUpdatingImage ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                              </>
                            ) : "Update"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowImageForm(false);
                              setSelectedFile(null);
                              setError("");
                              if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                                setPreviewUrl(null);
                              }
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            disabled={isUpdatingImage}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button 
                  onClick={() => setActiveTab('projects')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'projects' 
                      ? 'border-green-500 text-green-500' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Projects
                </button>
                <button 
                  onClick={() => setActiveTab('liked')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'liked' 
                      ? 'border-green-500 text-green-500' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Liked Projects
                </button>
              </div>
            </div>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'projects' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  My Projects
                </h2>
                
                <Link 
                  href="/projects/new"
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-500 hover:to-green-700 transition flex items-center"
                >
                  <FiEdit className="mr-2" /> New Project
                </Link>
              </div>
              
              {userProjects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-12 text-center">
                  <p className="text-gray-500 mb-4">
                    You haven't created any projects yet.
                  </p>
                  
                  <Link 
                    href="/projects/new"
                    className="text-green-500 hover:text-green-700 font-medium"
                  >
                    Create your first project
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProjects.map((project) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={project.imageUrl || "/placeholder-project.jpg"}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {Array.isArray(project.tags) 
                            ? project.tags.map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))
                            : typeof project.tags === 'string' && project.tags.split(',').map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                              >
                                {tag.trim()}
                              </span>
                            ))
                          }
                        </div>
                        <div className="flex justify-between items-center">
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-green-500 hover:text-green-700 font-medium"
                          >
                            View Details
                          </Link>
                          <div className="flex space-x-2">
                            <Link
                              href={`/projects/${project.id}/edit`}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <FiEdit />
                            </Link>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'liked' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Liked Projects
                </h2>
              </div>
              
              {isLikedLoading ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-12 text-center">
                  <div className="animate-pulse">Loading your liked items...</div>
                </div>
              ) : likedPosts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-12 text-center">
                  <p className="text-gray-500 mb-4">
                    You haven't liked any posts or projects yet.
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <Link 
                      href="/forum"
                      className="text-green-500 hover:text-green-700 font-medium"
                    >
                      Browse the forum
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link 
                      href="/projects"
                      className="text-green-500 hover:text-green-700 font-medium"
                    >
                      Explore projects
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {likedPosts.map((item) => (
                    item.type === 'post' ? (
                      <Link 
                        key={item.id}
                        href={`/forum/posts/${item.id}`}
                        className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                      >
                        <div className="p-6">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {item.topic?.name || 'Forum Post'}
                            </span>
                            <span className="text-xs text-gray-500">
                              <FiCalendar className="inline mr-1" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-800 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {item.content?.substring(0, 150)}...
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                                {item.user.image ? (
                                  <Image
                                    src={item.user.image}
                                    alt={item.user.name || "User"}
                                    fill
                                    className="object-cover"
                                    style={{ aspectRatio: "1/1" }}
                                    priority
                                  />
                                ) : (
                                  <div className="bg-green-100 w-full h-full flex items-center justify-center">
                                    <FiUser className="text-green-500" />
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-gray-600">
                                {item.user.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center text-gray-500">
                                <FiMessageSquare className="mr-1" />
                                <span className="text-sm">{item._count?.comments || 0}</span>
                              </div>
                              <div className="flex items-center text-green-500">
                                <FiHeart className="mr-1 fill-current" />
                                <span className="text-sm">{item._count?.likes || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <Link 
                        key={item.id}
                        href={`/projects/${item.id}`}
                        className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                      >
                        <div className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <div className="sm:flex-1">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {item.category || 'Project'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  <FiCalendar className="inline mr-1" />
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="text-lg font-medium text-gray-800 mb-2">
                                {item.title}
                              </h3>
                              <p className="text-gray-600 mb-4 line-clamp-2">
                                {item.description?.substring(0, 150)}...
                              </p>
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                                    {item.user.image ? (
                                      <Image
                                        src={item.user.image}
                                        alt={item.user.name || "User"}
                                        fill
                                        className="object-cover"
                                        style={{ aspectRatio: "1/1" }}
                                        priority
                                      />
                                    ) : (
                                      <div className="bg-green-100 w-full h-full flex items-center justify-center">
                                        <FiUser className="text-green-500" />
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {item.user.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center text-gray-500">
                                    <FiMessageSquare className="mr-1" />
                                    <span className="text-sm">{item._count?.comments || 0}</span>
                                  </div>
                                  <div className="flex items-center text-green-500">
                                    <FiHeart className="mr-1 fill-current" />
                                    <span className="text-sm">{item._count?.likes || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {item.imageUrl && (
                              <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-shrink-0">
                                <div className="h-24 w-24 sm:w-32 sm:h-32 relative rounded-md overflow-hidden">
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    priority
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Image upload form */}
      {showImageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Update Profile Picture</h3>
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/gif, image/webp"
                className="hidden"
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition"
              >
                <FiUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                <p className="text-gray-500">Click to select an image</p>
                <p className="text-xs text-gray-400 mt-2">Supported formats: JPEG, PNG, GIF, WebP</p>
                <p className="text-xs text-gray-400">Max size: 5MB</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowImageForm(false);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add file info and update button outside the modal when a file is selected */}
      {selectedFile && !showImageForm && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-40 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="mr-4 relative w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
              {previewUrl && (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <div className="font-medium">Selected File:</div>
              <div className="text-sm text-gray-600">
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </div>
            </div>
          </div>
          
          {/* Show error message if present */}
          {error && (
            <div className="text-red-500 text-sm mt-2 md:mt-0 md:mx-4 md:flex-grow p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          
          <div className="flex space-x-3 mt-2 md:mt-0">
            <button
              onClick={() => {
                setSelectedFile(null);
                setError("");
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              disabled={isUpdatingImage}
            >
              Cancel
            </button>
            <button
              onClick={uploadProfileImage}
              disabled={isUpdatingImage}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center justify-center"
            >
              {isUpdatingImage ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : "Update Profile Picture"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 