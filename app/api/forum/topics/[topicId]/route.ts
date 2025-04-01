import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Topic interface for mock data
interface MockTopic {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isDefault: boolean;
  _count: {
    posts: number;
    members: number;
  };
}

// Mock topics for development
const MOCK_TOPICS: Record<string, MockTopic> = {
  "1": {
    id: "1",
    name: "General Discussion",
    slug: "general-discussion",
    category: "Community",
    description: "General discussions about environment and sustainability",
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
    userId: "user1",
    isDefault: true,
    _count: {
      posts: 12,
      members: 45
    }
  },
  "2": {
    id: "2",
    name: "Academic Research",
    slug: "academic-research",
    category: "Ecological Research",
    description: "Share and discuss academic research in ecological fields",
    createdAt: new Date("2023-01-02").toISOString(),
    updatedAt: new Date("2023-01-02").toISOString(),
    userId: "user1",
    isDefault: true,
    _count: {
      posts: 8,
      members: 30
    }
  },
  "3": {
    id: "3",
    name: "Sustainability Projects",
    slug: "sustainability-projects",
    category: "Projects",
    description: "Share your ongoing sustainability projects and initiatives",
    createdAt: new Date("2023-01-03").toISOString(),
    updatedAt: new Date("2023-01-03").toISOString(),
    userId: "user2",
    isDefault: true,
    _count: {
      posts: 15,
      members: 38
    }
  }
};

// Get a topic by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  console.log(`GET /api/forum/topics/${params.topicId} - Fetching topic`);
  
  try {
    // Check if we're using a numeric ID that matches mock data in development mode
    if (process.env.NODE_ENV === "development") {
      console.log(`Checking mock data for topic ID: ${params.topicId}`);
      
      // Try to find in mock data by ID
      if (MOCK_TOPICS[params.topicId]) {
        console.log(`Found topic ${params.topicId} in mock data`);
        return NextResponse.json(MOCK_TOPICS[params.topicId]);
      }
      
      // Try to find in mock data by slug
      const mockTopicBySlug = Object.values(MOCK_TOPICS).find(
        (topic) => topic.slug === params.topicId
      );
      
      if (mockTopicBySlug) {
        console.log(`Found topic by slug ${params.topicId} in mock data`);
        return NextResponse.json(mockTopicBySlug);
      }
    }
    
    // First try to find by ID
    let topic = null;
    
    try {
      // Try numeric ID first
      if (!isNaN(parseInt(params.topicId))) {
        topic = await prisma.topic.findUnique({
          where: { id: params.topicId },
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
                posts: true,
                members: true,
              },
            },
          },
        });
        console.log(`DB lookup by ID result: ${topic ? 'found' : 'not found'}`);
      }
      
      // If not found by ID, try to find by slug
      if (!topic) {
        console.log(`Looking up by slug: ${params.topicId}`);
        topic = await prisma.topic.findUnique({
          where: { slug: params.topicId },
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
                posts: true,
                members: true,
              },
            },
          },
        });
        console.log(`DB lookup by slug result: ${topic ? 'found' : 'not found'}`);
      }
    } catch (error) {
      console.error("Error querying database:", error);
    }

    if (!topic) {
      console.log(`Topic not found for: ${params.topicId}`);
      
      // If in development mode, provide mock data as fallback
      if (process.env.NODE_ENV === "development") {
        // Return first mock topic as fallback
        const fallbackTopic = Object.values(MOCK_TOPICS)[0];
        console.log("Returning fallback mock topic:", fallbackTopic.name);
        return NextResponse.json(fallbackTopic);
      }
      
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 }
    );
  }
} 