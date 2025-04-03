// Store connected clients by userId
const clients = new Map<string, ReadableStreamController<Uint8Array>>();

// Register a client connection
export function registerClient(userId: string, controller: ReadableStreamController<Uint8Array>) {
  clients.set(userId, controller);
  console.log(`User ${userId} connected to SSE`);
  
  // Send an initial message
  const data = `data: ${JSON.stringify({ type: 'connected', message: 'Connected to notification stream' })}\n\n`;
  controller.enqueue(new TextEncoder().encode(data));
}

// Remove a client connection
export function removeClient(userId: string) {
  clients.delete(userId);
  console.log(`User ${userId} disconnected from SSE`);
}

// Send a notification to a specific user
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