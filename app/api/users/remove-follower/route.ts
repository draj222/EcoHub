import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { followerId } = await request.json();
    
    if (!followerId) {
      return NextResponse.json(
        { error: "Follower ID is required" },
        { status: 400 }
      );
    }
    
    // Remove the follower relationship
    await prisma.follower.delete({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: session.user.id,
        },
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing follower:", error);
    return NextResponse.json(
      { error: "Failed to remove follower" },
      { status: 500 }
    );
  }
} 
