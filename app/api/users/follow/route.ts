import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to follow/unfollow users" },
        { status: 401 }
      );
    }

    // Get the current user ID
    const currentUserId = session.user.id;
    
    // Get the request body
    const { targetId, action } = await request.json();
    
    // Validate input
    if (!targetId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }
    
    if (action !== "follow" && action !== "unfollow") {
      return NextResponse.json(
        { error: "Action must be either 'follow' or 'unfollow'" },
        { status: 400 }
      );
    }
    
    // Prevent users from following themselves
    if (currentUserId === targetId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }
    
    // Check if the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
    });
    
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }
    
    try {
      if (action === "follow") {
        // Follow the user
        // @ts-ignore - The Follower model might not be recognized by TypeScript yet
        await prisma.Follower.create({
          data: {
            followerId: currentUserId,
            followingId: targetId,
          },
        });
        
        return NextResponse.json({ success: true, message: "User followed successfully" });
      } else {
        // Unfollow the user
        // @ts-ignore - The Follower model might not be recognized by TypeScript yet
        await prisma.Follower.delete({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: targetId,
            },
          },
        });
        
        return NextResponse.json({ success: true, message: "User unfollowed successfully" });
      }
    } catch (err: any) {
      console.error("Error with Follower model:", err);
      // Handle the case where the record already exists or doesn't exist
      if (err.code === 'P2002') {
        return NextResponse.json({ success: false, message: "You are already following this user" });
      } else if (err.code === 'P2025') {
        return NextResponse.json({ success: false, message: "You are not following this user" });
      }
      throw err; // Re-throw for the catch block below
    }
  } catch (error) {
    console.error("Error updating follow status:", error);
    return NextResponse.json(
      { error: "Failed to update follow status" },
      { status: 500 }
    );
  }
} 