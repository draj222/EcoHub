import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { formatTags } from "@/app/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        userId,
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
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
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
    console.error("Error fetching user public projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch user projects" },
      { status: 500 }
    );
  }
} 
