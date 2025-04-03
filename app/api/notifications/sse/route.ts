import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { registerClient, removeClient } from '@/app/lib/notifications';

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
      registerClient(userId, controller);
    },
    cancel() {
      // Remove the client when the connection is closed
      removeClient(userId);
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