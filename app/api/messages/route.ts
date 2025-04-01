import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// GET endpoint to fetch recent conversations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to view messages" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // In development without a full database setup, we'll use file-based storage
    if (process.env.NODE_ENV === "development") {
      // Initialize storage for messages
      let storedMessages = [];
      
      try {
        // In server environment, use filesystem for persistence
        const fs = require('fs');
        const path = require('path');
        const messagesFilePath = path.join(process.cwd(), 'dev-messages.json');
        
        if (fs.existsSync(messagesFilePath)) {
          const messagesData = fs.readFileSync(messagesFilePath, 'utf8');
          storedMessages = JSON.parse(messagesData);
        }
      } catch (err) {
        console.warn("Failed to load messages from storage:", err);
      }
      
      // Create a map of conversations based on stored messages
      const conversationsMap = new Map();
      
      // Process stored messages to extract conversations
      storedMessages.forEach((message: any) => {
        // Skip messages not related to current user
        if (message.senderId !== userId && message.receiverId !== userId) {
          return;
        }
        
        // Determine the other user ID (the conversation partner)
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        
        // If we don't have this conversation yet, initialize it
        if (!conversationsMap.has(otherUserId)) {
          // Define mock user data based on known IDs
          let mockUser = {
            id: otherUserId,
            name: "Unknown User",
            image: null
          };
          
          if (otherUserId === "user2") {
            mockUser = {
              id: "user2",
              name: "Jane Smith",
              image: "https://api.dicebear.com/6.x/micah/svg?seed=jane"
            };
          } else if (otherUserId === "user3") {
            mockUser = {
              id: "user3",
              name: "Michael Johnson",
              image: "https://api.dicebear.com/6.x/micah/svg?seed=michael"
            };
          } else if (otherUserId === "user4") {
            mockUser = {
              id: "user4",
              name: "Emily Davis",
              image: "https://api.dicebear.com/6.x/micah/svg?seed=emily"
            };
          }
          
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            name: mockUser.name,
            image: mockUser.image,
            lastMessage: "",
            lastMessageTime: new Date(0).toISOString(),
            unreadCount: 0
          });
        }
        
        const conversation = conversationsMap.get(otherUserId);
        
        // Update last message if this message is newer
        if (new Date(message.createdAt) > new Date(conversation.lastMessageTime)) {
          conversation.lastMessage = message.content;
          conversation.lastMessageTime = message.createdAt;
        }
        
        // Count unread messages where current user is the recipient
        if (message.receiverId === userId && !message.isRead) {
          conversation.unreadCount++;
        }
      });
      
      // If we have no stored conversations but need mock data
      if (conversationsMap.size === 0) {
        // Create mock conversations
        const mockConversations = [
          {
            id: "user2", 
            name: "Jane Smith",
            image: "https://api.dicebear.com/6.x/micah/svg?seed=jane",
            lastMessage: "Hey, how's your eco-project going?",
            lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
            unreadCount: 2
          },
          {
            id: "user3",
            name: "Michael Johnson",
            image: "https://api.dicebear.com/6.x/micah/svg?seed=michael",
            lastMessage: "Thanks for sharing that research paper!",
            lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
            unreadCount: 0
          },
          {
            id: "user4",
            name: "Emily Davis",
            image: "https://api.dicebear.com/6.x/micah/svg?seed=emily",
            lastMessage: "I'd like to collaborate on your renewable energy project.",
            lastMessageTime: new Date(Date.now() - 172800000).toISOString(),
            unreadCount: 0
          }
        ];
        
        mockConversations.forEach(conv => conversationsMap.set(conv.id, conv));
      }
      
      // Convert map to array and sort by most recent
      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      
      return NextResponse.json({
        conversations: conversations,
        pagination: {
          total: conversations.length,
          page,
          limit,
          pages: 1
        }
      });
    }

    // For a real database setup, use this code:
    const conversations = await prisma.user.findMany({
      where: {
        OR: [
          {
            receivedMessages: {
              some: {
                senderId: userId
              }
            }
          },
          {
            sentMessages: {
              some: {
                receiverId: userId
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        image: true
      },
      skip,
      take: limit
    });
    
    // For each conversation user, get the last message and unread count
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (user) => {
        // Get the last message
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: user.id },
              { senderId: user.id, receiverId: userId }
            ]
          },
          orderBy: {
            createdAt: "desc"
          },
          select: {
            content: true,
            createdAt: true
          }
        });
        
        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            senderId: user.id,
            receiverId: userId,
            isRead: false
          }
        });
        
        return {
          ...user,
          lastMessage: lastMessage?.content || "",
          lastMessageTime: lastMessage?.createdAt || new Date(),
          unreadCount
        };
      })
    );
    
    // Sort by most recent message
    conversationsWithDetails.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
    
    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: {
        OR: [
          {
            receivedMessages: {
              some: {
                senderId: userId
              }
            }
          },
          {
            sentMessages: {
              some: {
                receiverId: userId
              }
            }
          }
        ]
      }
    });
    
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      conversations: conversationsWithDetails,
      pagination: {
        total: totalCount,
        page,
        limit, 
        pages: totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching message conversations:", error);
    return NextResponse.json(
      { error: "Failed to retrieve conversations" },
      { status: 500 }
    );
  }
} 