import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view your liked items" },
        { status: 401 }
      );
    }

    // Get user from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get page and limit from query params
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Get type filter if it exists
    const typeFilter = request.nextUrl.searchParams.get("type");

    // Forum post likes are excluded as per user request
    const postLikes = [];

    // Find all project likes for the user, including the related projects
    const projectLikes = !typeFilter || typeFilter === "project" 
      ? await prisma.like.findMany({
          where: { userId: user.id },
          include: {
            project: {
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
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    // Format the responses
    const likedPosts: any[] = [];

    const likedProjects = projectLikes.map((like) => ({
      ...like.project,
      likedAt: like.createdAt,
      type: 'project', // Adding type for FeedItem compatibility
    }));

    // Combine and sort all liked items by likedAt timestamp
    const allLikedItems = [...likedPosts, ...likedProjects].sort(
      (a, b) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()
    );

    // Apply pagination
    const paginatedItems = allLikedItems.slice(skip, skip + limit);

    return NextResponse.json(paginatedItems);
  } catch (error) {
    console.error("Error fetching liked items:", error);
    return NextResponse.json(
      { error: "Failed to fetch liked items" },
      { status: 500 }
    );
  }
} 