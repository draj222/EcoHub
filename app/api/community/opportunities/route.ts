import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const dynamic = 'force-dynamic';

// Declare global type for devMockOpportunities
declare global {
  var devMockOpportunities: any[];
}

// Mock data for development
const mockOpportunities = [
  {
    id: "1",
    title: "Beach Cleanup Day",
    description: "Join us for a day of cleaning up the local beach and protecting marine life from plastic pollution.",
    location: "Santa Monica Beach",
    startDate: new Date("2023-07-15T09:00:00Z"),
    endDate: new Date("2023-07-15T12:00:00Z"),
    category: "Cleanup",
    skillsRequired: "None required",
    maxParticipants: 50,
    imageUrl: "/images/beach-cleanup.jpg",
    organizerId: "user1",
    organizer: {
      id: "user1",
      name: "Ocean Conservation Group",
      image: null,
    },
    _count: {
      participants: 12,
      comments: 3,
    },
    createdAt: new Date("2023-06-10").toISOString(),
    updatedAt: new Date("2023-06-10").toISOString(),
  },
  {
    id: "2",
    title: "Community Garden Planting",
    description: "Help us plant native species in our community garden to support local wildlife and pollinators.",
    location: "Green Valley Community Garden",
    startDate: new Date("2023-07-22T10:00:00Z"),
    endDate: new Date("2023-07-22T14:00:00Z"),
    category: "Conservation",
    skillsRequired: "Basic gardening knowledge helpful but not required",
    maxParticipants: 30,
    imageUrl: "/images/community-garden.jpg",
    organizerId: "user2",
    organizer: {
      id: "user2",
      name: "Urban Gardeners Alliance",
      image: null,
    },
    _count: {
      participants: 8,
      comments: 5,
    },
    createdAt: new Date("2023-06-12").toISOString(),
    updatedAt: new Date("2023-06-12").toISOString(),
  },
  {
    id: "3",
    title: "Forest Trail Maintenance",
    description: "Join our team in maintaining hiking trails, removing invasive species, and preserving natural habitats.",
    location: "Redwood National Park",
    startDate: new Date("2023-08-05T08:30:00Z"),
    endDate: new Date("2023-08-05T16:00:00Z"),
    category: "Conservation",
    skillsRequired: "Physical stamina, basic tool usage",
    maxParticipants: 25,
    imageUrl: "/images/trail-maintenance.jpg",
    organizerId: "user3",
    organizer: {
      id: "user3",
      name: "Trail Guardians",
      image: null,
    },
    _count: {
      participants: 15,
      comments: 7,
    },
    createdAt: new Date("2023-06-15").toISOString(),
    updatedAt: new Date("2023-06-15").toISOString(),
  },
  {
    id: "4",
    title: "Environmental Education Workshop",
    description: "Lead workshops for local school children on environmental conservation and sustainable practices.",
    location: "Central Library",
    startDate: new Date("2023-07-28T13:00:00Z"),
    endDate: new Date("2023-07-28T15:30:00Z"),
    category: "Education",
    skillsRequired: "Teaching experience preferred, passion for environment required",
    maxParticipants: 10,
    imageUrl: "/images/environmental-education.jpg",
    organizerId: "user2",
    organizer: {
      id: "user2",
      name: "Green Education Initiative",
      image: null,
    },
    _count: {
      participants: 6,
      comments: 2,
    },
    createdAt: new Date("2023-06-20").toISOString(),
    updatedAt: new Date("2023-06-20").toISOString(),
  }
];

// In-memory store for development mock data
// Using a more persistent approach for storing created opportunities
if (!global.devMockOpportunities) {
  global.devMockOpportunities = [...mockOpportunities];
}

// Get all volunteer opportunities with filtering options
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const upcoming = searchParams.get('upcoming') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build the where clause based on filters
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (upcoming) {
      where.startDate = { gte: new Date() };
    }
    
    // Try to fetch from database
    let opportunities: any[] = [];
    let totalCount = 0;
    
    try {
      opportunities = await prisma.volunteerOpportunity.findMany({
        where,
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
        orderBy: {
          startDate: 'asc',
        },
        skip,
        take: limit,
      });
      
      totalCount = await prisma.volunteerOpportunity.count({ where });
    } catch (dbError) {
      console.warn("Error fetching from database:", dbError);
      
      // If in development, use mock data
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock opportunity data");
        
        // Filter mock data based on category and search
        let filteredMock = [...global.devMockOpportunities];
        
        if (category) {
          filteredMock = filteredMock.filter(opp => 
            opp.category.toLowerCase() === category.toLowerCase()
          );
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredMock = filteredMock.filter(opp => 
            opp.title.toLowerCase().includes(searchLower) ||
            opp.description.toLowerCase().includes(searchLower) ||
            opp.location.toLowerCase().includes(searchLower)
          );
        }
        
        if (upcoming) {
          const now = new Date();
          filteredMock = filteredMock.filter(opp => 
            new Date(opp.startDate) >= now
          );
        }
        
        // Sort by start date
        filteredMock.sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        
        totalCount = filteredMock.length;
        opportunities = filteredMock.slice(skip, skip + limit);
      }
    }
    
    return NextResponse.json({
      opportunities,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching volunteer opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer opportunities" },
      { status: 500 }
    );
  }
}

// Create a new volunteer opportunity
export async function POST(request: NextRequest) {
  console.log("POST /api/community/opportunities - Creating new opportunity");
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to create a volunteer opportunity" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'startDate', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Prepare data for database
    const opportunityData = {
      title: body.title,
      description: body.description,
      location: body.location,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      category: body.category,
      skillsRequired: body.skillsRequired || null,
      maxParticipants: body.maxParticipants ? parseInt(body.maxParticipants) : null,
      organizerId: session.user.id,
    };
    
    try {
      // Create the opportunity in the database
      const newOpportunity = await prisma.volunteerOpportunity.create({
        data: opportunityData,
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
      
      return NextResponse.json(newOpportunity, { status: 201 });
    } catch (dbError) {
      console.error("Database error creating opportunity:", dbError);
      
      // If in development mode and there's a database error, use mock data
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock data for opportunity creation");
        
        // Create a mock opportunity with an ID
        const mockId = `mock-${Date.now()}`;
        const mockOpportunity = {
          id: mockId,
          ...opportunityData,
          imageUrl: null, // Add imageUrl property
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          organizer: {
            id: session.user.id,
            name: session.user.name || 'Anonymous User',
            image: session.user.image,
          },
          _count: {
            participants: 0,
            comments: 0,
          },
        };
        
        // Add to global mock data array for persistence across requests
        global.devMockOpportunities.push(mockOpportunity);
        console.log("Added new opportunity to mock data. Total count:", global.devMockOpportunities.length);
        
        return NextResponse.json(mockOpportunity, { status: 201 });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error("Error creating volunteer opportunity:", error);
    return NextResponse.json(
      { error: "Failed to create volunteer opportunity" },
      { status: 500 }
    );
  }
} 
