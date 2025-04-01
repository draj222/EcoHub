import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to access this resource" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // For development mode, return mock data
    if (process.env.NODE_ENV === "development") {
      const mockUsers = [
        {
          id: "user2",
          name: "Jane Smith",
          image: "https://api.dicebear.com/6.x/micah/svg?seed=jane",
        },
        {
          id: "user3",
          name: "Michael Johnson",
          image: "https://api.dicebear.com/6.x/micah/svg?seed=michael",
        },
        {
          id: "user4",
          name: "Emily Davis",
          image: "https://api.dicebear.com/6.x/micah/svg?seed=emily",
        },
        {
          id: "user5",
          name: "David Wilson",
          image: "https://api.dicebear.com/6.x/micah/svg?seed=david",
        },
        {
          id: "user6",
          name: "Sarah Miller",
          image: "https://api.dicebear.com/6.x/micah/svg?seed=sarah",
        },
      ];
      
      return NextResponse.json({ users: mockUsers });
    }

    // For production, fetch actual followed users from database
    const followed = await prisma.follower.findMany({
      where: {
        followerId: userId,
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

    const users = followed.map((f) => f.following);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching followed users:", error);
    return NextResponse.json(
      { error: "Failed to retrieve followed users" },
      { status: 500 }
    );
  }
} 