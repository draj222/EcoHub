import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Declare global for mock data
declare global {
  var devMockOpportunities: any[];
  var mockParticipants: Record<string, string[]>;
}

// Initialize mock participants if it doesn't exist
if (!global.mockParticipants) {
  global.mockParticipants = {
    "1": ["user1", "user2", "user3"],  // opportunity ID -> user IDs
  };
}

// Check if a user is participating in an opportunity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunityId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!opportunityId || !userId) {
      return NextResponse.json(
        { error: "Both opportunity ID and user ID are required" },
        { status: 400 }
      );
    }
    
    // Try to fetch from database
    try {
      const participant = await prisma.volunteerParticipant.findUnique({
        where: {
          userId_opportunityId: {
            userId: userId,
            opportunityId: opportunityId,
          },
        },
      });
      
      if (participant) {
        return NextResponse.json({
          isParticipating: true,
          status: participant.status,
        });
      }
      
      // If in development mode and no database record, check mock data
      if (process.env.NODE_ENV === 'development') {
        const mockUsers = global.mockParticipants[opportunityId] || [];
        if (mockUsers.includes(userId)) {
          return NextResponse.json({
            isParticipating: true,
            status: 'registered',
          });
        }
      }
      
      return NextResponse.json({
        isParticipating: false,
      });
    } catch (dbError) {
      console.error("Database error checking participation:", dbError);
      
      // In development, use mock data as fallback
      if (process.env.NODE_ENV === 'development') {
        const mockUsers = global.mockParticipants[opportunityId] || [];
        return NextResponse.json({
          isParticipating: mockUsers.includes(userId),
          status: mockUsers.includes(userId) ? 'registered' : '',
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error("Error checking participation status:", error);
    return NextResponse.json(
      { error: "Failed to check participation status" },
      { status: 500 }
    );
  }
}

// Sign up for an opportunity
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to participate" },
        { status: 401 }
      );
    }
    
    const opportunityId = params.id;
    const body = await request.json();
    const userId = body.userId || session.user.id;
    
    // Validate session user matches requested user
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only sign up yourself" },
        { status: 403 }
      );
    }
    
    // Check if opportunity exists and is not in the past
    let opportunity;
    try {
      opportunity = await prisma.volunteerOpportunity.findUnique({
        where: { id: opportunityId },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });
      
      if (!opportunity) {
        // Check if it exists in mock data
        if (process.env.NODE_ENV === 'development') {
          const mockOpportunity = global.devMockOpportunities.find(
            opp => opp.id === opportunityId
          );
          
          if (!mockOpportunity) {
            return NextResponse.json(
              { error: "Opportunity not found" },
              { status: 404 }
            );
          }
          
          // Check if event is in the past
          const now = new Date();
          if (new Date(mockOpportunity.startDate) < now) {
            return NextResponse.json(
              { error: "Cannot sign up for a past event" },
              { status: 400 }
            );
          }
          
          // Add user to mock participants
          if (!global.mockParticipants[opportunityId]) {
            global.mockParticipants[opportunityId] = [];
          }
          
          // Check if already participating
          if (global.mockParticipants[opportunityId].includes(userId)) {
            return NextResponse.json(
              { error: "You are already signed up for this opportunity" },
              { status: 400 }
            );
          }
          
          // Check if maximum participants limit is reached
          if (
            mockOpportunity.maxParticipants !== null &&
            mockOpportunity._count.participants >= mockOpportunity.maxParticipants
          ) {
            return NextResponse.json(
              { error: "This opportunity is already full" },
              { status: 400 }
            );
          }
          
          // Add user to participants and increment count
          global.mockParticipants[opportunityId].push(userId);
          mockOpportunity._count.participants += 1;
          
          return NextResponse.json({
            message: "Successfully signed up (mock)",
            isParticipating: true,
            status: 'registered',
          });
        }
          
        return NextResponse.json(
          { error: "Opportunity not found" },
          { status: 404 }
        );
      }
      
      // Check if event is in the past
      const now = new Date();
      if (new Date(opportunity.startDate) < now) {
        return NextResponse.json(
          { error: "Cannot sign up for a past event" },
          { status: 400 }
        );
      }
      
      // Check if maximum participants limit is reached
      if (
        opportunity.maxParticipants !== null &&
        opportunity._count.participants >= opportunity.maxParticipants
      ) {
        return NextResponse.json(
          { error: "This opportunity is already full" },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error("Database error checking opportunity:", dbError);
      
      // In development mode, proceed with mock data
      if (process.env.NODE_ENV === 'development') {
        // Add user to mock participants
        if (!global.mockParticipants[opportunityId]) {
          global.mockParticipants[opportunityId] = [];
        }
        
        const mockOpportunity = global.devMockOpportunities.find(
          opp => opp.id === opportunityId
        );
        
        if (mockOpportunity) {
          // Check if already participating
          if (global.mockParticipants[opportunityId].includes(userId)) {
            return NextResponse.json(
              { error: "You are already signed up for this opportunity" },
              { status: 400 }
            );
          }
          
          // Add user to participants and increment count
          global.mockParticipants[opportunityId].push(userId);
          mockOpportunity._count.participants += 1;
        }
        
        return NextResponse.json({
          message: "Successfully signed up (mock)",
          isParticipating: true,
          status: 'registered',
        });
      }
      
      throw dbError;
    }
    
    // Check if user is already participating
    const existingParticipation = await prisma.volunteerParticipant.findUnique({
      where: {
        userId_opportunityId: {
          userId: userId,
          opportunityId: opportunityId,
        },
      },
    });
    
    if (existingParticipation) {
      return NextResponse.json(
        { error: "You are already signed up for this opportunity" },
        { status: 400 }
      );
    }
    
    // Create the participation record
    const participation = await prisma.volunteerParticipant.create({
      data: {
        userId: userId,
        opportunityId: opportunityId,
        status: 'registered',
      },
    });
    
    return NextResponse.json({
      message: "Successfully signed up",
      participation,
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error signing up for opportunity:", error);
    return NextResponse.json(
      { error: "Failed to sign up for opportunity" },
      { status: 500 }
    );
  }
}

// Cancel participation in an opportunity
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to cancel participation" },
        { status: 401 }
      );
    }
    
    const opportunityId = params.id;
    const body = await request.json();
    const userId = body.userId || session.user.id;
    
    // Validate session user matches requested user
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only cancel your own participation" },
        { status: 403 }
      );
    }
    
    try {
      // Check if participation exists
      const existingParticipation = await prisma.volunteerParticipant.findUnique({
        where: {
          userId_opportunityId: {
            userId: userId,
            opportunityId: opportunityId,
          },
        },
      });
      
      if (!existingParticipation) {
        // Check mock data in development mode
        if (process.env.NODE_ENV === 'development') {
          const mockUsers = global.mockParticipants[opportunityId] || [];
          const userIndex = mockUsers.indexOf(userId);
          
          if (userIndex !== -1) {
            // Remove user from participants and decrement count
            mockUsers.splice(userIndex, 1);
            
            // Find the opportunity and update its count
            const mockOpportunity = global.devMockOpportunities.find(
              opp => opp.id === opportunityId
            );
            
            if (mockOpportunity && mockOpportunity._count.participants > 0) {
              mockOpportunity._count.participants -= 1;
            }
            
            return NextResponse.json({
              message: "Successfully canceled participation (mock)",
            });
          }
        }
        
        return NextResponse.json(
          { error: "You are not signed up for this opportunity" },
          { status: 404 }
        );
      }
      
      // Delete the participation record
      await prisma.volunteerParticipant.delete({
        where: {
          userId_opportunityId: {
            userId: userId,
            opportunityId: opportunityId,
          },
        },
      });
      
      return NextResponse.json({
        message: "Successfully canceled participation",
      });
      
    } catch (dbError) {
      console.error("Database error canceling participation:", dbError);
      
      // In development mode, handle mock data
      if (process.env.NODE_ENV === 'development') {
        const mockUsers = global.mockParticipants[opportunityId] || [];
        const userIndex = mockUsers.indexOf(userId);
        
        if (userIndex !== -1) {
          // Remove user from participants
          mockUsers.splice(userIndex, 1);
          
          // Find the opportunity and update its count
          const mockOpportunity = global.devMockOpportunities.find(
            opp => opp.id === opportunityId
          );
          
          if (mockOpportunity && mockOpportunity._count.participants > 0) {
            mockOpportunity._count.participants -= 1;
          }
        }
        
        return NextResponse.json({
          message: "Successfully canceled participation (mock)",
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error("Error canceling participation:", error);
    return NextResponse.json(
      { error: "Failed to cancel participation" },
      { status: 500 }
    );
  }
} 