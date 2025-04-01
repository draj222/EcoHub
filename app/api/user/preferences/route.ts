import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";

export const dynamic = 'force-dynamic';

// Get user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to get preferences" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // For development mode, return mock preferences
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        theme: "light",
        notificationSettings: {
          emailNotifications: true,
          messageNotifications: true,
          projectUpdates: true,
          mentions: true
        },
        privacySettings: {
          profileVisibility: "public",
          showEmail: false,
          allowMessaging: true
        }
      });
    }
    
    // Find user preferences in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        preferences: true 
      }
    });
    
    if (!user || !user.preferences) {
      // Return default preferences if none exist
      return NextResponse.json({
        theme: "light",
        notificationSettings: {
          emailNotifications: true,
          messageNotifications: true,
          projectUpdates: true,
          mentions: true
        },
        privacySettings: {
          profileVisibility: "public",
          showEmail: false,
          allowMessaging: true
        }
      });
    }
    
    // Parse preferences from JSON string
    const preferences = typeof user.preferences === 'string' 
      ? JSON.parse(user.preferences) 
      : user.preferences;
    
    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// Update user preferences
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to update preferences" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const updatedPreferences = await request.json();
    
    // For development mode, just return success
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        message: "Preferences updated successfully",
        preferences: updatedPreferences
      });
    }
    
    // Save preferences in the database
    await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: JSON.stringify(updatedPreferences)
      }
    });
    
    return NextResponse.json({
      message: "Preferences updated successfully",
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
} 
