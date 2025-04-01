import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Define interface for mock post type
interface MockPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  topicId: string;
  topic: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
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

// Mock post data
const MOCK_POSTS: Record<string, MockPost> = {
  "post1": {
    id: "post1",
    title: "Latest Research on Climate Change",
    content: "Climate scientists have recently published new findings that show accelerating rates of change...",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    topicId: "topic1",
    topic: {
      id: "topic1",
      name: "Climate Change",
      slug: "climate-change",
      category: "Science",
    },
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
  "post2": {
    id: "post2",
    title: "The Impact of Global Warming on Ecosystems",
    content: "The changing climate is having profound effects on ecosystems around the world...",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    topicId: "topic1",
    topic: {
      id: "topic1",
      name: "Climate Change",
      slug: "climate-change",
      category: "Science",
    },
    user: {
      id: "user2",
      name: "Jane Smith",
      image: null,
    },
    _count: {
      comments: 2,
      likes: 4,
    }
  },
  "post3": {
    id: "post3",
    title: "Solar Energy Breakthroughs",
    content: "Recent innovations in photovoltaic technology promise to revolutionize renewable energy...",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    topicId: "topic2",
    topic: {
      id: "topic2",
      name: "Renewable Energy",
      slug: "renewable-energy",
      category: "Technology",
    },
    user: {
      id: "user3",
      name: "Alex Johnson",
      image: null,
    },
    _count: {
      comments: 1,
      likes: 3,
    }
  },
  "post4": {
    id: "post4",
    title: "Zero-Waste Living: A Journey",
    content: "My personal journey toward reducing waste has taught me valuable lessons about consumption...",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    topicId: "topic3",
    topic: {
      id: "topic3",
      name: "Sustainable Living",
      slug: "sustainable-living",
      category: "General",
    },
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
  "post5": {
    id: "post5",
    title: "Sustainable Gardening Practices",
    content: "Creating an eco-friendly garden helps support local biodiversity and reduces environmental impact...",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    topicId: "topic3",
    topic: {
      id: "topic3",
      name: "Sustainable Living",
      slug: "sustainable-living",
      category: "General",
    },
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
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`GET /api/forum/posts/${params.id} - Fetching post`);

  try {
    // Check if using mock data in development
    if (process.env.NODE_ENV === "development" && params.id.startsWith("post")) {
      console.log(`Using mock data for post: ${params.id}`);
      const mockPost = MOCK_POSTS[params.id];
      
      if (mockPost) {
        return NextResponse.json(mockPost);
      }
      
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id: params.id,
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
    });

    if (!post) {
      console.log(`Post not found: ${params.id}`);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
} 