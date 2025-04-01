import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to like a project" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if the user has already liked the project
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: params.id,
        },
      },
    });

    if (existingLike) {
      // If the user has already liked the project, unlike it
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return NextResponse.json({ liked: false });
    } else {
      // If the user hasn't liked the project, like it
      await prisma.like.create({
        data: {
          userId: user.id,
          projectId: params.id,
        },
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error liking project:", error);
    return NextResponse.json(
      { error: "Failed to like project" },
      { status: 500 }
    );
  }
} 