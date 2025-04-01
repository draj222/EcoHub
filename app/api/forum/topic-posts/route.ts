import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Get all posts for a topic by ID
export async function GET(request: NextRequest) {
  try {
    const topicId = request.nextUrl.searchParams.get("topicId");
    
    if (!topicId) {
      return NextResponse.json(
        { error: "Topic ID is required" },
        { status: 400 }
      );
    }
    
    const posts = await prisma.post.findMany({
      where: { topicId },
      orderBy: {
        createdAt: "desc",
      },
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
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
} 