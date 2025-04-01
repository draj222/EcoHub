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
    
    // Fetch the user's followers
    const followers = await prisma.follower.findMany({
      where: {
        followingId: params.id,
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    // Format the response
    const formattedFollowers = followers.map((follow: any) => ({
      id: follow.follower.id,
      name: follow.follower.name,
      image: follow.follower.image,
    }));
    
    return NextResponse.json(formattedFollowers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
} 