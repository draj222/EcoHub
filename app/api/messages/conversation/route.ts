import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// GET endpoint to fetch messages between two users
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
    
    // Get the other user's ID from query parameters
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("userId");
    
    if (!otherUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Get query parameters for pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    
    // In development mode, provide mock data or read from local storage
    if (process.env.NODE_ENV === "development") {
      // Create mock user
      let mockUser = {
        id: otherUserId,
        name: "Unknown User",
        image: null as string | null
      };
      
      // Assign user details based on ID
      if (otherUserId === "user2") {
        mockUser = {
          id: "user2",
          name: "Jane Smith",
          image: "https://api.dicebear.com/6.x/micah/svg?seed=jane" as string | null
        };
      } else if (otherUserId === "user3") {
        mockUser = {
          id: "user3",
          name: "Michael Johnson",
          image: "https://api.dicebear.com/6.x/micah/svg?seed=michael" as string | null
        };
      } else if (otherUserId === "user4") {
        mockUser = {
          id: "user4",
          name: "Emily Davis",
          image: "https://api.dicebear.com/6.x/micah/svg?seed=emily" as string | null
        };
      }
      
      // Try to read messages from local storage
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
      
      // Filter messages that involve the current user and the requested user
      const relevantMessages = storedMessages.filter((msg: { senderId: string; receiverId: string }) => 
        (msg.senderId === userId && msg.receiverId === otherUserId) || 
        (msg.senderId === otherUserId && msg.receiverId === userId)
      );
      
      // Use stored messages if available, otherwise fall back to mock data
      let mockMessages = relevantMessages.length > 0 ? relevantMessages : [];
      
      // If no stored messages, generate mock messages for demo purposes
      if (mockMessages.length === 0) {
        if (otherUserId === "user2") {
          mockMessages.push(
            {
              id: "msg1",
              content: "Hi there! I saw your project on marine conservation.",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              senderId: otherUserId,
              sender: mockUser
            },
            {
              id: "msg2",
              content: "Thanks! I've been working on it for a few months now.",
              createdAt: new Date(Date.now() - 86000000).toISOString(),
              senderId: userId,
              sender: {
                id: userId,
                name: session.user.name,
                image: session.user.image
              }
            },
            {
              id: "msg3",
              content: "Would you be interested in collaborating?",
              createdAt: new Date(Date.now() - 85000000).toISOString(),
              senderId: otherUserId,
              sender: mockUser
            },
            {
              id: "msg4",
              content: "Hey, how's your eco-project going?",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              senderId: otherUserId,
              sender: mockUser
            }
          );
        } else if (otherUserId === "user3") {
          mockMessages.push(
            {
              id: "msg5",
              content: "I found a great research paper on renewable energy you might like.",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              senderId: userId,
              sender: {
                id: userId,
                name: session.user.name,
                image: session.user.image
              }
            },
            {
              id: "msg6",
              content: "Thanks for sharing that research paper!",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              senderId: otherUserId,
              sender: mockUser
            }
          );
        } else if (otherUserId === "user4") {
          mockMessages.push(
            {
              id: "msg7",
              content: "Hello! I'm interested in sustainable architecture.",
              createdAt: new Date(Date.now() - 259200000).toISOString(),
              senderId: otherUserId,
              sender: mockUser
            },
            {
              id: "msg8",
              content: "That's great! I have some resources I can share with you.",
              createdAt: new Date(Date.now() - 250000000).toISOString(),
              senderId: userId,
              sender: {
                id: userId,
                name: session.user.name,
                image: session.user.image
              }
            },
            {
              id: "msg9",
              content: "I'd like to collaborate on your renewable energy project.",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              senderId: otherUserId,
              sender: mockUser
            }
          );
        }
      }
      
      // Sort messages by creation time
      mockMessages.sort((a: { createdAt: string }, b: { createdAt: string }) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Mark unread messages as read in the local storage
      if (storedMessages.length > 0) {
        try {
          const fs = require('fs');
          const path = require('path');
          const messagesFilePath = path.join(process.cwd(), 'dev-messages.json');
          
          const updatedMessages = storedMessages.map((msg: { senderId: string; receiverId: string; isRead?: boolean }) => {
            if (msg.senderId === otherUserId && msg.receiverId === userId && !msg.isRead) {
              return { ...msg, isRead: true };
            }
            return msg;
          });
          
          fs.writeFileSync(messagesFilePath, JSON.stringify(updatedMessages, null, 2));
        } catch (err) {
          console.warn("Failed to update message read status:", err);
        }
      }
      
      return NextResponse.json({
        messages: mockMessages,
        user: mockUser,
        pagination: {
          total: mockMessages.length,
          page: 1,
          limit: 50,
          pages: 1
        }
      });
    }
    
    // Check if the other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, image: true }
    });
    
    if (!otherUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Fetch messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: "asc" // Oldest messages first
      },
      skip,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    // Count total messages for pagination
    const totalMessages = await prisma.message.count({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      }
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });
    
    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalMessages / limit);

    return NextResponse.json({
      messages: messages, 
      user: otherUser,
      pagination: {
        total: totalMessages,
        page,
        limit,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to retrieve messages" },
      { status: 500 }
    );
  }
}

// POST endpoint to send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to send messages" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const requestData = await request.json();
    const { receiverId, content } = requestData;
    
    if (!receiverId || !content || content.trim() === "") {
      return NextResponse.json(
        { error: "Recipient and message content are required" },
        { status: 400 }
      );
    }
    
    // For development mode, use local storage
    if (process.env.NODE_ENV === "development") {
      // Get or initialize the messages array in localStorage
      let localMessages = [];
      
      try {
        // Read existing messages from localStorage if running in browser environment
        if (typeof window !== 'undefined') {
          const storedMessages = localStorage.getItem('ecohub_messages');
          localMessages = storedMessages ? JSON.parse(storedMessages) : [];
        } else {
          // In server environment, use filesystem for persistence
          const fs = require('fs');
          const path = require('path');
          const messagesFilePath = path.join(process.cwd(), 'dev-messages.json');
          
          if (fs.existsSync(messagesFilePath)) {
            const messagesData = fs.readFileSync(messagesFilePath, 'utf8');
            localMessages = JSON.parse(messagesData);
          }
        }
      } catch (err) {
        console.warn("Failed to load messages from storage:", err);
        // Continue with empty array if loading fails
      }
      
      // Create new message
      const newMessage = {
        id: `msg${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRead: false,
        senderId: userId,
        receiverId,
        sender: {
          id: userId,
          name: session.user.name,
          image: session.user.image
        }
      };
      
      // Add to local messages
      localMessages.push(newMessage);
      
      // Save messages back to storage
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('ecohub_messages', JSON.stringify(localMessages));
        } else {
          const fs = require('fs');
          const path = require('path');
          const messagesFilePath = path.join(process.cwd(), 'dev-messages.json');
          fs.writeFileSync(messagesFilePath, JSON.stringify(localMessages, null, 2));
        }
      } catch (err) {
        console.warn("Failed to save messages to storage:", err);
      }
      
      return NextResponse.json(newMessage);
    }
    
    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    
    if (!receiver) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }
    
    // Check if users follow each other (optional business rule)
    const mutualFollow = await prisma.follower.findMany({
      where: {
        OR: [
          { followerId: userId, followingId: receiverId },
          { followerId: receiverId, followingId: userId }
        ]
      }
    });
    
    if (mutualFollow.length < 2) {
      return NextResponse.json(
        { error: "You can only message users who follow you back" },
        { status: 403 }
      );
    }

    // Create the new message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
} 