import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const dynamic = 'force-dynamic';

// Declare global type for devMockOpportunities to access the global store
declare global {
  var devMockOpportunities: any[];
}

// Get a specific volunteer opportunity by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: "Opportunity ID is required" },
        { status: 400 }
      );
    }
    
    // Try to fetch from database
    try {
      const opportunity = await prisma.volunteerOpportunity.findUnique({
        where: { id },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              participants: true,
              comments: true,
            },
          },
        },
      });
      
      if (!opportunity) {
        // Check in mock data if in development
        if (process.env.NODE_ENV === 'development') {
          // Use the global mock opportunities store
          const mockOpportunity = global.devMockOpportunities.find(opp => opp.id === id);
          
          if (mockOpportunity) {
            console.log(`Found mock opportunity with ID: ${id}`);
            return NextResponse.json({ opportunity: mockOpportunity });
          }
        }
        
        return NextResponse.json(
          { error: "Opportunity not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ opportunity });
    } catch (dbError) {
      console.error("Database error fetching opportunity:", dbError);
      
      // If in development, check global mock data
      if (process.env.NODE_ENV === 'development') {
        const mockOpportunity = global.devMockOpportunities.find(opp => opp.id === id);
        
        if (mockOpportunity) {
          console.log(`Found mock opportunity with ID: ${id}`);
          return NextResponse.json({ opportunity: mockOpportunity });
        }
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error("Error fetching volunteer opportunity:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer opportunity" },
      { status: 500 }
    );
  }
} 
