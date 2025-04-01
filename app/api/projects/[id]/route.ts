import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { formatTags } from "@/app/lib/utils";

// Get a single project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // For development mode, return mock data for specific IDs
    if (process.env.NODE_ENV === "development") {
      // This is for testing purposes
      if (id.startsWith('mock')) {
        const mockProject = {
          id,
          title: 'Solar-Powered Water Purification System',
          description: 'A sustainable solution for clean water access in remote areas using solar energy.',
          content: 'This project demonstrates how solar energy can be harnessed to purify water in areas with limited infrastructure.',
          imageUrl: 'https://images.unsplash.com/photo-1567092605033-7127370af259?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c29sYXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
          tags: 'solar,water,sustainability',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user1',
          user: {
            id: 'user1',
            name: 'Demo User',
            image: 'https://api.dicebear.com/6.x/micah/svg?seed=demo'
          },
          _count: {
            likes: 42,
            comments: 15
          }
        };

        return NextResponse.json(mockProject);
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id },
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

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Format tags from comma-separated string to array
    const formattedProject = {
      ...project,
      tags: formatTags(project.tags),
      commentsCount: project._count.comments,
      likesCount: project._count.likes,
      _count: undefined,
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete a project" },
        { status: 401 }
      );
    }

    // Fetch the project to check ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the project
    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this project" },
        { status: 403 }
      );
    }

    // Delete the project
    // First delete all related records (cascade doesn't work in SQLite)
    await prisma.comment.deleteMany({
      where: { projectId: id },
    });
    
    await prisma.like.deleteMany({
      where: { projectId: id },
    });
    
    // Then delete the project
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

// Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to update a project" },
        { status: 401 }
      );
    }

    // Fetch the project to check ownership
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the project
    if (existingProject.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this project" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { title, description, content, imageUrl, fileUrl, category, tags } = data;

    // Validate input
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Convert tags array to comma-separated string
    const tagsString = Array.isArray(tags) ? tags.join(',') : tags;

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        content,
        imageUrl,
        fileUrl,
        category,
        tags: tagsString,
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
      ...updatedProject,
      tags: formatTags(updatedProject.tags),
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
} 