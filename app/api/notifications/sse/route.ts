import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// Store connected clients by userId
const clients = new Map<string, ReadableStreamController<Uint8Array>>();

// Helper function to send a notification to a specific user
export async function sendNotification(userId: string, notification: any) {
  const controller = clients.get(userId);
  if (controller) {
    try {
      // Format the data according to SSE spec
      const data = `data: ${JSON.stringify(notification)}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
      return true;
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      return false;
    }
  }
  return false; // User not connected
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const userId = session.user.id;
  
  // Create a new stream
  const stream = new ReadableStream({
    start(controller) {
      // Store the client connection
      clients.set(userId, controller);
      
      // Send an initial message
      const data = `data: ${JSON.stringify({ type: 'connected', message: 'Connected to notification stream' })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
      
      console.log(`User ${userId} connected to SSE`);
    },
    cancel() {
      // Remove the client when the connection is closed
      clients.delete(userId);
      console.log(`User ${userId} disconnected from SSE`);
    }
  });
  
  // Set appropriate headers for SSE
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
} 