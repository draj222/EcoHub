import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to update your profile" },
        { status: 401 }
      );
    }

    // Get the user ID from the session
    const userId = session.user.id;
    
    // Get the request body
    const { name, image } = await request.json();
    
    // Validate the input
    if (!name && !image) {
      return NextResponse.json(
        { error: "No data provided for update" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: { name?: string; image?: string } = {};
    if (name) updateData.name = name;
    if (image) updateData.image = image;

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 