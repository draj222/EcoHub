import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const dynamic = 'force-dynamic';
// Increase the maximum request body size to handle base64 images
export const bodyParser = {
  sizeLimit: '10mb'
};

export async function PATCH(request: NextRequest) {
  console.log("🔄 Profile update request received");
  
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("❌ Authentication failed - no session");
      return NextResponse.json(
        { error: "You must be logged in to update your profile" },
        { status: 401 }
      );
    }
    
    console.log(`✅ Authenticated as user: ${session.user.email}`);

    // Get the user ID from the session
    const userId = session.user.id;
    if (!userId) {
      console.log("❌ No user ID in session");
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }
    
    // Get the request body
    const data = await request.json();
    console.log("📝 Request data received (not logging image data for privacy)");
    
    const { name, image } = data;
    
    // Validate the input
    if (!name && !image) {
      console.log("❌ No data provided for update");
      return NextResponse.json(
        { error: "No data provided for update" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: { name?: string; image?: string } = {};
    if (name) updateData.name = name;
    if (image) {
      console.log(`🖼️ Image data received (length: ${image.length} characters)`);
      updateData.image = image;
    }

    try {
      // Update the user
      console.log(`🔄 Updating user with ID: ${userId}`);
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
      
      console.log("✅ User profile updated successfully");
      return NextResponse.json({
        success: true,
        user: updatedUser
      });
    } catch (dbError: any) {
      console.error("❌ Database error:", dbError);
      // Check for specific Prisma errors
      if (dbError.code) {
        console.error(`❌ Prisma error code: ${dbError.code}`);
      }
      return NextResponse.json(
        { error: "Database error updating profile" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 
