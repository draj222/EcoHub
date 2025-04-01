import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Interface for mock comment
interface MockComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

// Mock comments for development
const MOCK_COMMENTS: Record<string, MockComment[]> = {
  "post1": [
    {
      id: "comment1",
      content: "This is really insightful research!",
      createdAt: new Date().toISOString(),
      user: {
        id: "user2",
        name: "Jane Smith",
        image: null,
      }
    },
    {
      id: "comment2",
      content: "I agree with the findings. We need urgent action!",
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      user: {
        id: "user3",
        name: "Alex Johnson",
        image: null,
      }
    }
  ],
  "post2": [
    {
      id: "comment3",
      content: "Great overview of ecosystem impacts.",
      createdAt: new Date().toISOString(),
      user: {
        id: "user1",
        name: "John Doe",
        image: null,
      }
    }
  ]
};

// In-memory storage for new comments in development
let devMockComments: Record<string, MockComment[]> = {};
let nextCommentId = "comment10";

// Get all comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`GET /api/forum/posts/${params.id}/comments - Fetching comments`);

  try {
    // Check if using mock data in development
    if (process.env.NODE_ENV === "development" && params.id.startsWith("post")) {
      console.log(`Using mock data for comments on post: ${params.id}`);
      
      // Combine predefined mock comments with any dynamically added ones
      const mockCommentsForPost = MOCK_COMMENTS[params.id] || [];
      const dynamicComments = devMockComments[params.id] || [];
      
      const allComments = [...mockCommentsForPost, ...dynamicComments];
      return NextResponse.json(allComments);
    }

    const comments = await prisma.postComment.findMany({
      where: {
        postId: params.id,
      },
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
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`POST /api/forum/posts/${params.id}/comments - Creating comment`);

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to comment" },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    // Check if using mock data in development
    if (process.env.NODE_ENV === "development" && params.id.startsWith("post")) {
      console.log(`Creating mock comment for post: ${params.id}`);
      
      const newComment: MockComment = {
        id: nextCommentId,
        content,
        createdAt: new Date().toISOString(),
        user: {
          id: session.user?.id || "user1",
          name: session.user?.name || "Anonymous",
          image: session.user?.image || null,
        }
      };
      
      // Initialize the array for this post if it doesn't exist
      if (!devMockComments[params.id]) {
        devMockComments[params.id] = [];
      }
      
      // Add the comment to our in-memory store
      devMockComments[params.id].push(newComment);
      
      // Increment the comment ID for next time
      nextCommentId = `comment${parseInt(nextCommentId.replace("comment", "")) + 1}`;
      
      console.log(`Created mock comment with ID: ${newComment.id}`);
      return NextResponse.json(newComment);
    }

    const comment = await prisma.postComment.create({
      data: {
        content,
        post: {
          connect: {
            id: params.id,
          },
        },
        user: {
          connect: {
            id: session.user.id,
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
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
} 