import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { formatTags } from "@/app/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = params.id;
    
    // Ensure the user can only access their own projects
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const projects = await prisma.project.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Format tags from comma-separated string to array
    const formattedProjects = projects.map((project) => ({
      ...project,
      tags: formatTags(project.tags),
      commentsCount: project._count.comments,
      likesCount: project._count.likes,
      _count: undefined,
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch user projects" },
      { status: 500 }
    );
  }
} 