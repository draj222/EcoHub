import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get counts separately since the Prisma types may not be updated yet
    const projectCount = await prisma.project.count({
      where: { userId }
    });
    
    // Use default value of 0 for now in case Follower model isn't generated yet
    let followerCount = 0;
    let followingCount = 0;
    
    try {
      // @ts-ignore - The Follower model might not be recognized by TypeScript yet
      followerCount = await prisma.Follower.count({
        where: { followingId: userId }
      });
      
      // @ts-ignore - The Follower model might not be recognized by TypeScript yet
      followingCount = await prisma.Follower.count({
        where: { followerId: userId }
      });
    } catch (err) {
      console.warn("Follower model might not be available yet:", err);
    }

    // Add counts to user object
    const userWithCounts = {
      ...user,
      _count: {
        projects: projectCount,
        followers: followerCount,
        following: followingCount
      }
    };

    return NextResponse.json(userWithCounts);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
} 