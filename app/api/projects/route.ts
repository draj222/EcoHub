import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/auth";
import { formatTags } from "@/app/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "latest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let orderBy: any = { createdAt: "desc" };
    let where: any = {};

    if (filter === "popular") {
      orderBy = [{ createdAt: "desc" }]; // SQLite doesn't support ordering by relation count
    } else if (filter === "research") {
      where = { category: "Research" };
    } else if (filter === "projects") {
      where = { 
        NOT: { category: "Research" }
      };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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
            likes: true
          }
        }
      },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      tags: formatTags(project.tags),
      commentsCount: project._count.comments,
      likesCount: project._count.likes,
      _count: undefined,
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a project" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { title, description, content, imageUrl, fileUrl, category, tags } = data;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
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

    // Convert tags array to comma-separated string
    const tagsString = Array.isArray(tags) ? tags.join(',') : tags;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        content,
        imageUrl,
        fileUrl,
        category,
        tags: tagsString,
        userId: user.id,
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

    // Format tags back to array for the response
    const formattedProject = {
      ...project,
      tags: formatTags(project.tags),
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
} 