import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const dynamic = 'force-dynamic';

// In-memory store for topic memberships in development
let mockTopicMemberships: Record<string, Set<string>> = {
  "topic1": new Set(["user1"]),
  "topic2": new Set(["user2"]),
  "topic3": new Set(["user3"])
};

// Get membership status
export async function GET(request: NextRequest) {
  console.log("GET /api/forum/topics/member - Checking membership status");
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to check membership" },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const topicId = searchParams.get("topicId");
    
    if (!topicId) {
      return NextResponse.json(
        { error: "Topic ID is required" },
        { status: 400 }
      );
    }
    
    // Check if using mock data in development
    if (process.env.NODE_ENV === "development" && topicId.startsWith("topic")) {
      console.log(`Using mock data for membership check: ${topicId}`);
      
      const userId = session.user.id || "user1";
      const joined = mockTopicMemberships[topicId]?.has(userId) || false;
      
      return NextResponse.json({ joined });
    }
    
    // Check if user is a member of the topic
    const membership = await prisma.topicMember.findUnique({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId,
        },
      },
    });
    
    return NextResponse.json({ joined: !!membership });
  } catch (error) {
    console.error("Error checking membership:", error);
    return NextResponse.json(
      { error: "Failed to check membership" },
      { status: 500 }
    );
  }
}

// Join or leave a topic
export async function POST(request: NextRequest) {
  console.log("POST /api/forum/topics/member - Updating membership");
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to join or leave a topic" },
        { status: 401 }
      );
    }
    
    const { topicId, action } = await request.json();
    
    if (!topicId || !action) {
      return NextResponse.json(
        { error: "Topic ID and action are required" },
        { status: 400 }
      );
    }
    
    if (action !== "join" && action !== "leave") {
      return NextResponse.json(
        { error: "Action must be either 'join' or 'leave'" },
        { status: 400 }
      );
    }
    
    // Handle mock data in development
    if (process.env.NODE_ENV === "development" && topicId.startsWith("topic")) {
      console.log(`Using mock data for membership ${action}: ${topicId}`);
      
      const userId = session.user.id || "user1";
      
      // Initialize the set if it doesn't exist
      if (!mockTopicMemberships[topicId]) {
        mockTopicMemberships[topicId] = new Set();
      }
      
      if (action === "join") {
        mockTopicMemberships[topicId].add(userId);
      } else {
        mockTopicMemberships[topicId].delete(userId);
      }
      
      return NextResponse.json({ joined: action === "join" });
    }
    
    // Check if the topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { id: true },
    });
    
    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }
    
    if (action === "join") {
      // Join the topic (upsert to handle case where user is already a member)
      await prisma.topicMember.upsert({
        where: {
          userId_topicId: {
            userId: session.user.id,
            topicId,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          topicId,
        },
      });
      
      return NextResponse.json({ joined: true });
    } else {
      // Leave the topic
      await prisma.topicMember.deleteMany({
        where: {
          userId: session.user.id,
          topicId,
        },
      });
      
      return NextResponse.json({ joined: false });
    }
  } catch (error) {
    console.error("Error updating membership:", error);
    return NextResponse.json(
      { error: "Failed to update membership" },
      { status: 500 }
    );
  }
} 
