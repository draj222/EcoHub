"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import { 
  FiUser, 
  FiCalendar, 
  FiFolder, 
  FiEdit,
  FiPlus,
  FiMinus
} from "react-icons/fi";
import UserListModal from "@/app/components/UserListModal";

interface ProfileUser {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  createdAt: string;
  _count: {
    projects: number;
    followers: number;
    following: number;
  };
}

interface UserProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  tags: string[];
  createdAt: string;
  _count: {
    comments: number;
    likes: number;
  };
}

interface FollowUser {
  id: string;
  name: string;
  image: string | null;
}

export default function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  // Modal state
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  
  const isOwnProfile = session?.user?.id === params.id;

  useEffect(() => {
    if (status !== "loading") {
      fetchUserData();
    }
  }, [params.id, status, session]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile data
      const userResponse = await fetch(`/api/users/${params.id}`);
      
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }
      
      const userData = await userResponse.json();
      setProfileUser(userData);
      
      // Fetch user's projects
      const projectsResponse = await fetch(`/api/users/${params.id}/public-projects`);
      
      if (!projectsResponse.ok) {
        throw new Error("Failed to fetch user projects");
      }
      
      const projectsData = await projectsResponse.json();
      setUserProjects(projectsData);
      
      // Check if current user is following this profile
      if (session?.user?.id && params.id !== session.user.id) {
        const followResponse = await fetch(`/api/users/following-status?targetId=${params.id}`);
        if (followResponse.ok) {
          const { isFollowing } = await followResponse.json();
          setIsFollowing(isFollowing);
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!session?.user) {
      router.push(`/signin?redirect=/profile/${params.id}`);
      return;
    }
    
    setIsFollowLoading(true);
    
    try {
      const response = await fetch("/api/users/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId: params.id,
          action: isFollowing ? "unfollow" : "follow",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }
      
      // Toggle follow status
      setIsFollowing(!isFollowing);
      
      // Update follower count
      if (profileUser) {
        setProfileUser({
          ...profileUser,
          _count: {
            ...profileUser._count,
            followers: isFollowing
              ? profileUser._count.followers - 1
              : profileUser._count.followers + 1,
          },
        });
      }
    } catch (err) {
      console.error("Error updating follow status:", err);
      setError("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  };
  
  const fetchFollowers = async () => {
    setIsLoadingFollowers(true);
    try {
      const response = await fetch(`/api/users/${params.id}/followers`);
      if (response.ok) {
        const data = await response.json();
        setFollowers(data);
      } else {
        console.error("Failed to fetch followers");
      }
    } catch (err) {
      console.error("Error fetching followers:", err);
    } finally {
      setIsLoadingFollowers(false);
    }
  };
  
  const fetchFollowing = async () => {
    setIsLoadingFollowing(true);
    try {
      const response = await fetch(`/api/users/${params.id}/following`);
      if (response.ok) {
        const data = await response.json();
        setFollowing(data);
      } else {
        console.error("Failed to fetch following");
      }
    } catch (err) {
      console.error("Error fetching following:", err);
    } finally {
      setIsLoadingFollowing(false);
    }
  };
  
  const handleRemoveFollower = async (userId: string) => {
    try {
      const response = await fetch("/api/users/remove-follower", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerId: userId,
        }),
      });
      
      if (response.ok) {
        // Remove user from followers list
        setFollowers(followers.filter((user) => user.id !== userId));
        
        // Update follower count
        if (profileUser) {
          setProfileUser({
            ...profileUser,
            _count: {
              ...profileUser._count,
              followers: profileUser._count.followers - 1,
            },
          });
        }
      }
    } catch (err) {
      console.error("Error removing follower:", err);
    }
  };
  
  const handleUnfollow = async (userId: string) => {
    try {
      const response = await fetch("/api/users/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId: userId,
          action: "unfollow",
        }),
      });
      
      if (response.ok) {
        // Remove user from following list
        setFollowing(following.filter((user) => user.id !== userId));
        
        // Update following count
        if (profileUser) {
          setProfileUser({
            ...profileUser,
            _count: {
              ...profileUser._count,
              following: profileUser._count.following - 1,
            },
          });
        }
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
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
  
  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error || "User not found"}
          </div>
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
                <div className="relative w-24 h-24 bg-green-100 rounded-full overflow-hidden flex items-center justify-center">
                  {profileUser.image ? (
                    <Image
                      src={profileUser.image}
                      alt={profileUser.name || "User"}
                      fill
                      className="object-cover"
                      style={{ aspectRatio: "1/1" }}
                      priority
                    />
                  ) : (
                    <FiUser className="text-green-500 text-4xl" />
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">
                      {profileUser.name || "User"}
                    </h1>
                    
                    {!isOwnProfile && (
                      <button
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading}
                        className={`px-4 py-2 rounded-full flex items-center justify-center transition ${
                          isFollowing
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {isFollowLoading ? (
                          "Processing..."
                        ) : isFollowing ? (
                          <>
                            <FiMinus className="mr-2" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <FiPlus className="mr-2" />
                            Follow
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {profileUser.bio && (
                    <p className="text-gray-600 my-3">{profileUser.bio}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2" />
                      <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FiFolder className="mr-2" />
                      <span>{profileUser._count.projects} Projects</span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setShowFollowersModal(true);
                        fetchFollowers();
                      }}
                      className="flex items-center hover:text-green-600"
                    >
                      <FiUser className="mr-2" />
                      <span>{profileUser._count.followers} Followers</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowFollowingModal(true);
                        fetchFollowing();
                      }}
                      className="flex items-center hover:text-green-600"
                    >
                      <FiUser className="mr-2" />
                      <span>Following {profileUser._count.following}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Projects */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Projects
              </h2>
              
              {isOwnProfile && (
                <Link 
                  href="/projects/create"
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-500 hover:to-green-700 transition flex items-center"
                >
                  <FiEdit className="mr-2" /> New Project
                </Link>
              )}
            </div>
            
            {userProjects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden p-12 text-center">
                <p className="text-gray-500 mb-4">
                  {isOwnProfile
                    ? "You haven't created any projects yet."
                    : "This user hasn't created any projects yet."}
                </p>
                
                {isOwnProfile && (
                  <Link 
                    href="/projects/create"
                    className="text-green-500 hover:text-green-700 font-medium"
                  >
                    Create your first project
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
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
                          : typeof project.tags === 'string' 
                            ? (project.tags as any).split(',').map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                              >
                                {tag.trim()}
                              </span>
                            ))
                            : null
                        }
                      </div>
                      <div className="flex justify-between text-gray-500 text-sm">
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        <div className="flex space-x-3">
                          <span className="flex items-center">
                            <FiUser className="mr-1" />
                            {project._count?.likes || 0}
                          </span>
                          <span className="flex items-center">
                            <FiEdit className="mr-1" />
                            {project._count?.comments || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Followers Modal */}
      <UserListModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Followers"
        users={followers}
        onRemove={isOwnProfile ? handleRemoveFollower : undefined}
      />
      
      {/* Following Modal */}
      <UserListModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Following"
        users={following}
        onRemove={isOwnProfile ? handleUnfollow : undefined}
        isFollowing={true}
      />
    </div>
  );
} 