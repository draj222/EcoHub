import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

interface TopicCount {
  posts: number;
  members: number;
}

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
  _count: TopicCount;
}

// Mock topics for development
const mockTopics: MockTopic[] = [
  {
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
  {
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
  {
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
  },
  {
    id: "4",
    name: "Tech Innovations",
    slug: "tech-innovations",
    category: "Technology",
    description: "Technological innovations for sustainability and environment",
    createdAt: new Date("2023-01-04").toISOString(),
    updatedAt: new Date("2023-01-04").toISOString(),
    userId: "user3",
    isDefault: true,
    _count: {
      posts: 10,
      members: 25
    }
  }
];

// Get all topics
export async function GET() {
  try {
    // Try to fetch topics from database
    let topics: any[] = [];
    try {
      topics = await prisma.topic.findMany({
        include: {
          _count: {
            select: {
              posts: true,
              members: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.warn("Error fetching topics from database, using mock data:", error);
    }
    
    // If no topics in database or in development, use mock topics
    if (topics.length === 0 || process.env.NODE_ENV === 'development') {
      return NextResponse.json(mockTopics);
    }
    
    return NextResponse.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

// Create a new topic
export async function POST(request: NextRequest) {
  try {
    const { name, description, category } = await request.json();
    
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: "Name, description, and category are required" },
        { status: 400 }
      );
    }
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Check if slug already exists
    const existingTopic = await prisma.topic.findUnique({
      where: { slug },
    });
    
    if (existingTopic) {
      return NextResponse.json(
        { error: "A topic with this name already exists" },
        { status: 400 }
      );
    }
    
    // Create topic
    const topic = await prisma.topic.create({
      data: {
        name,
        description,
        category,
        slug,
        userId: "system", // For now, assign to system. In a real app, would be from the authenticated user
      },
    });
    
    return NextResponse.json(topic);
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
} 