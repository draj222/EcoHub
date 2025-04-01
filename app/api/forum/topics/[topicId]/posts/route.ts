import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Mock post interface for development
interface MockPost {
  id: string;
  title: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: null;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

// Mock post data for development
const MOCK_POSTS: Record<string, MockPost[]> = {
  "topic1": [
    {
      id: "post1",
      title: "Latest Research on Climate Change",
      createdAt: new Date().toISOString(),
      user: {
        id: "user1",
        name: "John Doe",
        image: null,
      },
      _count: {
        comments: 3,
        likes: 5,
      }
    },
    {
      id: "post2",
      title: "The Impact of Global Warming on Ecosystems",
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      user: {
        id: "user2",
        name: "Jane Smith",
        image: null,
      },
      _count: {
        comments: 2,
        likes: 4,
      }
    }
  ],
  "topic2": [
    {
      id: "post3",
      title: "Solar Energy Breakthroughs",
      createdAt: new Date().toISOString(),
      user: {
        id: "user3",
        name: "Alex Johnson",
        image: null,
      },
      _count: {
        comments: 1,
        likes: 3,
      }
    }
  ],
  "topic3": [
    {
      id: "post4",
      title: "Zero-Waste Living: A Journey",
      createdAt: new Date().toISOString(),
      user: {
        id: "user1",
        name: "John Doe",
        image: null,
      },
      _count: {
        comments: 4,
        likes: 7,
      }
    },
    {
      id: "post5",
      title: "Sustainable Gardening Practices",
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      user: {
        id: "user2",
        name: "Jane Smith",
        image: null,
      },
      _count: {
        comments: 2,
        likes: 5,
      }
    }
  ]
};

// Get all posts for a topic by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  console.log(`GET /api/forum/topics/${params.topicId}/posts - Fetching posts`);
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Check if we're in dev mode and using mock IDs
    if (process.env.NODE_ENV === "development" && params.topicId.startsWith("topic")) {
      console.log(`Using mock data for posts in topic: ${params.topicId}`);
      
      const mockPosts = MOCK_POSTS[params.topicId] || [];
      const totalPosts = mockPosts.length;
      const totalPages = Math.ceil(totalPosts / limit);
      const paginatedPosts = mockPosts.slice((page - 1) * limit, page * limit);
      
      return NextResponse.json({
        posts: paginatedPosts,
        pagination: {
          total: totalPosts,
          page,
          limit,
          pages: totalPages,
        },
      });
    }
    
    // Try to find the topic by ID first
    let topic = await prisma.topic.findUnique({
      where: { id: params.topicId },
    });
    
    // If not found by ID, try by slug
    if (!topic) {
      topic = await prisma.topic.findUnique({
        where: { slug: params.topicId },
      });
    }
    
    if (!topic) {
      console.log(`Topic not found for ID: ${params.topicId}`);
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }
    
    const skip = (page - 1) * limit;
    
    const posts = await prisma.post.findMany({
      where: {
        topicId: topic.id,
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
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });
    
    const totalPosts = await prisma.post.count({
      where: {
        topicId: topic.id,
      },
    });
    
    const totalPages = Math.ceil(totalPosts / limit);
    
    return NextResponse.json({
      posts,
      pagination: {
        total: totalPosts,
        page,
        limit,
        pages: totalPages,
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