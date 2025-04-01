import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Default topics to seed
const DEFAULT_TOPICS = [
  {
    name: "Ocean Conservation",
    slug: "ocean-conservation",
    description: "Discuss ocean conservation efforts, marine protected areas, and initiatives to protect oceanic ecosystems.",
    category: "Conservation"
  },
  {
    name: "Renewable Energy Innovations",
    slug: "renewable-energy-innovations",
    description: "Share and discuss the latest in renewable energy technologies, policy, and implementation.",
    category: "Renewable Energy"
  },
  {
    name: "Climate Change Science",
    slug: "climate-change-science",
    description: "Scientific discussions about climate change research, findings, and implications.",
    category: "Climate Change"
  },
  {
    name: "Sustainable Living",
    slug: "sustainable-living",
    description: "Tips, advice, and discussions about sustainable lifestyle choices and practices.",
    category: "Sustainability"
  },
  {
    name: "Wildlife Protection",
    slug: "wildlife-protection",
    description: "Discuss conservation efforts for endangered species and wildlife protection initiatives.",
    category: "Wildlife Protection"
  },
  {
    name: "Environmental Activists Corner",
    slug: "environmental-activists-corner",
    description: "A space for environmental activists to connect, share strategies, and coordinate.",
    category: "General Advice"
  },
  {
    name: "Interdisciplinary Studies",
    slug: "interdisciplinary-studies",
    description: "Exploring the intersection of environmental science with other disciplines like economics, psychology, and more.",
    category: "Interdisciplinary Studies"
  },
];

// POST route to seed default topics
export async function POST(request: NextRequest) {
  try {
    // For testing purposes, allow admin key in request body
    let isAuthorized = false;
    let userId = "";

    try {
      const { adminKey } = await request.json();
      if (adminKey === "secret123") {
        isAuthorized = true;
        
        // Get the admin user
        const adminUser = await prisma.user.findFirst({
          where: { email: "admin@ecohub.com" }
        });
        
        if (adminUser) {
          userId = adminUser.id;
        } else {
          return NextResponse.json(
            { error: "Admin user not found. Please run /api/forum/init-db first" },
            { status: 400 }
          );
        }
      }
    } catch (e) {
      // Continue to check session if no admin key
    }

    // If not authorized via admin key, check session
    if (!isAuthorized) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email?.includes("admin")) {
        return NextResponse.json(
          { error: "Unauthorized. Only admins can seed default topics" },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }

    // Check if topics already exist to avoid duplicates
    const existingTopics = await prisma.topic.findMany({
      where: {
        slug: {
          in: DEFAULT_TOPICS.map(topic => topic.slug)
        }
      }
    });

    // Filter out topics that already exist
    const topicsToCreate = DEFAULT_TOPICS.filter(
      topic => !existingTopics.some(existing => existing.slug === topic.slug)
    );

    // Create the topics
    const createdTopics = await Promise.all(
      topicsToCreate.map(async (topic) => {
        return prisma.topic.create({
          data: {
            name: topic.name,
            slug: topic.slug,
            description: topic.description,
            category: topic.category,
            userId,
            isDefault: true,
            // Automatically add admin as a member
            members: {
              create: {
                userId,
              }
            }
          },
        });
      })
    );

    return NextResponse.json({
      message: `${createdTopics.length} default topics created successfully.`,
      topics: createdTopics
    }, { status: 201 });

  } catch (error) {
    console.error("Error seeding default topics:", error);
    return NextResponse.json(
      { error: "Failed to seed default topics" },
      { status: 500 }
    );
  }
}

// GET route to check default topics
export async function GET(request: NextRequest) {
  try {
    const defaultTopics = await prisma.topic.findMany({
      where: { isDefault: true },
      include: {
        _count: {
          select: { members: true, posts: true }
        }
      }
    });

    return NextResponse.json(defaultTopics);
  } catch (error) {
    console.error("Error fetching default topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch default topics" },
      { status: 500 }
    );
  }
} 