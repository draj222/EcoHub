import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to check following status" },
        { status: 401 }
      );
    }

    // Get the current user ID
    const currentUserId = session.user.id;
    
    // Get the target user ID from the query params
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get("targetId");
    
    if (!targetId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }
    
    // Check if the current user is following the target user
    let isFollowing = false;
    
    try {
      // @ts-ignore - The Follower model might not be recognized by TypeScript yet
      const followRecord = await prisma.Follower.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetId,
          },
        },
      });
      
      isFollowing = !!followRecord;
    } catch (err) {
      console.warn("Follower model might not be available yet:", err);
    }
    
    return NextResponse.json({ isFollowing });
  } catch (error) {
    console.error("Error checking following status:", error);
    return NextResponse.json(
      { error: "Failed to check following status" },
      { status: 500 }
    );
  }
} 