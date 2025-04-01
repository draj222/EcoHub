import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// In-memory store for post likes in development
let mockPostLikes: Record<string, Set<string>> = {
  "post1": new Set(["user2", "user3"]),
  "post2": new Set(["user1", "user3"]),
  "post3": new Set(["user2"]),
  "post4": new Set(["user1", "user2", "user3"]),
  "post5": new Set(["user3"])
};

// Check if a post is liked by current user
export async function GET(request: NextRequest) {
  console.log("GET /api/forum/posts/like - Checking like status");
  
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");
    
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }
    
    // Default to not liked if not logged in
    if (!session?.user) {
      return NextResponse.json({ liked: false });
    }
    
    // Check if using mock data in development
    if (process.env.NODE_ENV === "development" && postId.startsWith("post")) {
      console.log(`Using mock data for like check: ${postId}`);
      
      const userId = session.user.id || "user1";
      const liked = mockPostLikes[postId]?.has(userId) || false;
      
      return NextResponse.json({ liked });
    }
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    // Check if user has liked this post
    const like = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });
    
    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { error: "Failed to check like status" },
      { status: 500 }
    );
  }
}

// Toggle like status for a post
export async function POST(request: NextRequest) {
  console.log("POST /api/forum/posts/like - Toggling like status");
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to like posts" },
        { status: 401 }
      );
    }
    
    const { postId } = await request.json();
    
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }
    
    // Handle mock data in development
    if (process.env.NODE_ENV === "development" && postId.startsWith("post")) {
      console.log(`Using mock data for liking post: ${postId}`);
      
      const userId = session.user.id || "user1";
      
      // Initialize the set if it doesn't exist
      if (!mockPostLikes[postId]) {
        mockPostLikes[postId] = new Set();
      }
      
      // Toggle like status
      const currentlyLiked = mockPostLikes[postId].has(userId);
      if (currentlyLiked) {
        mockPostLikes[postId].delete(userId);
      } else {
        mockPostLikes[postId].add(userId);
      }
      
      return NextResponse.json({ liked: !currentlyLiked });
    }
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });
    
    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });
      
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          user: {
            connect: { id: session.user.id },
          },
          post: {
            connect: { id: postId },
          },
        },
      });
      
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like status:", error);
    return NextResponse.json(
      { error: "Failed to update like status" },
      { status: 500 }
    );
  }
} 