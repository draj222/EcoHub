import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { formatTags } from "@/app/lib/utils";

// Define types for API
interface FollowingRecord {
  followingId: string;
}

interface FeedItem {
  id: string;
  title: string;
  createdAt: string;
  type: 'project' | 'post';
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  commentsCount: number;
  likesCount: number;
  [key: string]: any; // For other properties
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view your feed" },
        { status: 401 }
      );
    }

    // Get the current user ID
    const currentUserId = session.user.id;
    
    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Get projects from users the current user is following
    let projects: any[] = [];
    
    try {
      // Get IDs of users the current user is following
      // @ts-ignore - The Follower model might not be recognized by TypeScript yet
      const following: FollowingRecord[] = await prisma.Follower.findMany({
        where: {
          followerId: currentUserId,
        },
        select: {
          followingId: true,
        },
      });
      
      const followingIds = following.map((f: FollowingRecord) => f.followingId);
      
      // If the user isn't following anyone, return an empty array
      if (followingIds.length === 0) {
        return NextResponse.json([]);
      }
      
      // Get projects from followed users
      projects = await prisma.project.findMany({
        where: {
          userId: {
            in: followingIds,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });
      
      // Also get forum posts if they exist in schema
      let posts: any[] = [];
      try {
        // @ts-ignore - The Post model might not be recognized as having the right associations
        posts = await prisma.post.findMany({
          where: {
            userId: {
              in: followingIds,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            topic: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        });
      } catch (err) {
        console.warn("Error fetching posts, might not be in schema yet:", err);
      }
      
      // Format projects
      const formattedProjects: FeedItem[] = projects.map(project => ({
        ...project,
        tags: formatTags(project.tags),
        type: 'project',
        commentsCount: project._count.comments,
        likesCount: project._count.likes,
        _count: undefined,
      }));
      
      // Format posts
      const formattedPosts: FeedItem[] = posts.map(post => ({
        ...post,
        type: 'post',
        commentsCount: post._count.comments,
        likesCount: post._count.likes,
        _count: undefined,
      }));
      
      // Combine and sort by date
      const feedItems: FeedItem[] = [...formattedProjects, ...formattedPosts].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      return NextResponse.json(feedItems);
    } catch (err) {
      console.error("Error with Follower model:", err);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
} 