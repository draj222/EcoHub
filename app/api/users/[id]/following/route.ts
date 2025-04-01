import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verify that the user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Fetch users that this user is following
    const following = await prisma.follower.findMany({
      where: {
        followerId: params.id,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    // Format the response
    const formattedFollowing = following.map((follow: any) => ({
      id: follow.following.id,
      name: follow.following.name,
      image: follow.following.image,
    }));
    
    return NextResponse.json(formattedFollowing);
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json(
      { error: "Failed to fetch following" },
      { status: 500 }
    );
  }
} 