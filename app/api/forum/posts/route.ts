import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// Mock post counter for development
let mockPostCounter = 0;

// In-memory store for development mock data
let devMockPosts = [];
let nextPostId = "post6"; // Start after our predefined mock posts

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const filter = searchParams.get('filter') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build the where clause based on filters
    const where: any = {};
    
    if (topicId) {
      where.topicId = topicId;
    }
    
    // Determine the ordering
    const orderBy: any = {};
    
    switch (filter) {
      case 'popular':
        orderBy.likes = { _count: 'desc' };
        break;
      case 'latest':
      default:
        orderBy.createdAt = 'desc';
        break;
    }
    
    // Fetch posts from database
    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });
    
    // Get total count for pagination
    const totalPosts = await prisma.post.count({ where });
    
    return NextResponse.json({
      posts,
      pagination: {
        total: totalPosts,
        page,
        limit,
        pages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("POST /api/forum/posts - Creating new post");
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to create a post" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, content, topicId } = body;
    
    console.log("Creating post with data:", { title, topicId });
    
    if (!title || !content || !topicId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check if the topic exists before creating a post
    let topic;
    try {
      // First try to find by ID
      topic = await prisma.topic.findUnique({
        where: { id: topicId },
      });
      
      if (!topic) {
        return NextResponse.json(
          { error: `Topic with ID ${topicId} not found` },
          { status: 404 }
        );
      }
    } catch (findError) {
      console.error("Error finding topic:", findError);
      
      // If in development mode, assume topic exists for mock data
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          { error: "Failed to verify topic existence" },
          { status: 500 }
        );
      }
    }
    
    // In development mode, create a mock post
    if (process.env.NODE_ENV === "development") {
      console.log("Creating mock post in development mode");
      
      // Get mock topic information from the mock topics we created
      const mockTopics = {
        "1": {
          id: "1",
          name: "General Discussion",
          slug: "general-discussion",
          category: "Community"
        },
        "2": {
          id: "2",
          name: "Academic Research",
          slug: "academic-research",
          category: "Ecological Research"
        },
        "3": {
          id: "3",
          name: "Sustainability Projects",
          slug: "sustainability-projects",
          category: "Projects"
        }
      };
      
      // Use the same mock topics from topic route
      let mockTopic = mockTopics[topicId as keyof typeof mockTopics] || {
        id: topicId,
        name: "Unknown Topic",
        slug: "unknown-topic",
        category: "General"
      };
      
      const mockPost = {
        id: `post-${Date.now()}`,
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        topicId: mockTopic.id,
        topic: mockTopic,
        user: {
          id: session.user?.id || "user1",
          name: session.user?.name || "Anonymous",
          image: session.user?.image || null,
        },
        _count: {
          comments: 0,
          likes: 0,
        }
      };
      
      // Add to our in-memory mock store
      devMockPosts.push(mockPost);
      
      console.log(`Created mock post with ID: ${mockPost.id}`);
      
      // Increment the count for the topic (for development)
      mockPostCounter++;
      return NextResponse.json(mockPost);
    }
    
    // Start a transaction to ensure everything succeeds or fails together
    const [post] = await prisma.$transaction([
      // Create the post
      prisma.post.create({
        data: {
          title,
          content,
          user: {
            connect: {
              id: session.user.id,
            },
          },
          topic: {
            connect: {
              id: topicId,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      })
    ]);
    
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post. Please try again." },
      { status: 500 }
    );
  }
} 