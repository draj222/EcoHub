"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { FiUser, FiCalendar, FiEdit, FiTrash2, FiCamera, FiUpload, FiHeart, FiMessageSquare, FiUsers, FiUserPlus, FiUserMinus } from "react-icons/fi";
import Link from "next/link";
import { Project, Post } from "@/app/interfaces";
import Image from "next/image";
import ProfileImageDebug from "@/app/components/ProfileImageDebug";

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

interface User {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [likedPosts, setLikedPosts] = useState<LikedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'liked'>('projects');
  const [isLoading, setIsLoading] = useState(true);
  const [isLikedLoading, setIsLikedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [profileImageKey, setProfileImageKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);

  useEffect(() => {
    // Redirect unauthenticated users
    if (status === "unauthenticated") {
      router.push("/signin?error=Please sign in to view your profile");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchUserProjects();
      fetchLikedPosts();
      fetchFollowersAndFollowing();
      // Force image refresh when session changes
      setProfileImageKey(Date.now());
    }
  }, [status, session, router]);

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

  const fetchFollowersAndFollowing = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch followers
      const followersResponse = await fetch(
        `/api/follow?userId=${session?.user?.id}&type=followers`
      );
      if (!followersResponse.ok) throw new Error('Failed to fetch followers');
      const followersData = await followersResponse.json();
      setFollowers(followersData);

      // Fetch following
      const followingResponse = await fetch(
        `/api/follow?userId=${session?.user?.id}&type=following`
      );
      if (!followingResponse.ok) throw new Error('Failed to fetch following');
      const followingData = await followingResponse.json();
      setFollowing(followingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
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

  const uploadProfileImage = async (file: File) => {
    setIsUpdatingImage(true);
    setError("");
    
    try {
      console.log("Starting profile image upload...");
      console.log("File:", file.name, file.type, file.size);
      
      // Create FormData and append the file
      const formData = new FormData();
      formData.append("file", file);
      
      console.log("Uploading file to /api/upload...");
      // Upload the image - don't set Content-Type header, browser will set it with boundary
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        // Remove any headers so browser can set the correct multipart/form-data with boundary
      });
      
      console.log("Upload response status:", uploadResponse.status);
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error("Upload error:", errorData);
        throw new Error(`Failed to upload image: ${errorData.error || 'Unknown error'}`);
      }
      
      const uploadResult = await uploadResponse.json();
      console.log("Upload result:", uploadResult);
      
      if (!uploadResult.fileUrl) {
        throw new Error("No image URL returned from server");
      }
      
      console.log("Updating user profile with new image URL:", uploadResult.fileUrl);
      // Update the user profile with the image URL
      const profileResponse = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          image: uploadResult.fileUrl 
        }),
      });
      
      console.log("Profile update response status:", profileResponse.status);
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        console.error("Profile update error:", errorData);
        throw new Error(`Failed to update profile: ${errorData.error || 'Unknown error'}`);
      }
      
      const profileResult = await profileResponse.json();
      console.log("Profile update result:", profileResult);
      
      console.log("Updating session with new image...");
      // Update the session
      await update({
        ...session,
        user: {
          ...session?.user,
          image: uploadResult.fileUrl + '?v=' + Date.now() // Add cache busting parameter
        }
      });
      
      // Update local state to force re-render
      setProfileImageKey(Date.now());
      
      console.log("Upload process completed successfully!");
      // Force a full page reload to update all components with the new image
      window.location.href = '/profile?updated=' + Date.now();
    } catch (err) {
      console.error("Error updating profile picture:", err);
      setError(`Failed to update profile picture: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      
      await uploadProfileImage(file);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to follow/unfollow user');
      
      // Refresh the lists
      await fetchFollowersAndFollowing();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
                <ProfileImageDebug 
                  imageUrl={session?.user?.image || null}
                  userName={session?.user?.name || undefined}
                  size="lg"
                  className="group"
                  onClick={() => fileInputRef.current?.click()}
                  showUploadOverlay={true}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {session?.user?.name || "User"}
                  </h1>
                  <p className="text-gray-600">{session?.user?.email}</p>
                  <div className="flex items-center justify-center md:justify-start mt-2 text-gray-500">
                    <FiCalendar className="mr-2" />
                    <span>Joined {new Date().toLocaleDateString()}</span>
                  </div>
                  
                  {/* Followers/Following Stats */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <FiUsers className="text-gray-500" />
                      <span className="text-gray-600">
                        {followers.length} Followers
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiUser className="text-gray-500" />
                      <span className="text-gray-600">
                        {following.length} Following
                      </span>
                    </div>
                  </div>
                  
                  {/* Followers/Following Lists */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Followers List */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Followers</h3>
                      {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                      ) : error ? (
                        <div className="text-red-500 text-sm">{error}</div>
                      ) : followers.length === 0 ? (
                        <div className="text-gray-500 text-sm">No followers yet</div>
                      ) : (
                        <div className="space-y-3">
                          {followers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <ProfileImageDebug
                                  imageUrl={user.image}
                                  userName={user.name || undefined}
                                  size="sm"
                                />
                                <span className="text-gray-800">{user.name}</span>
                              </div>
                              {user.id !== session?.user?.id && (
                                <button
                                  onClick={() => handleFollow(user.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <FiUserMinus className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Following List */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Following</h3>
                      {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                      ) : error ? (
                        <div className="text-red-500 text-sm">{error}</div>
                      ) : following.length === 0 ? (
                        <div className="text-gray-500 text-sm">Not following anyone yet</div>
                      ) : (
                        <div className="space-y-3">
                          {following.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <ProfileImageDebug
                                  imageUrl={user.image}
                                  userName={user.name || undefined}
                                  size="sm"
                                />
                                <span className="text-gray-800">{user.name}</span>
                              </div>
                              {user.id !== session?.user?.id && (
                                <button
                                  onClick={() => handleFollow(user.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <FiUserMinus className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUpdatingImage}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center justify-center mx-auto md:mx-0"
                    >
                      {isUpdatingImage ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiCamera className="mr-2" /> 
                          Update Profile Picture
                        </>
                      )}
                    </button>
                    
                    {error && (
                      <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                        {error}
                      </div>
                    )}
                  </div>
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
    </div>
  );
} 