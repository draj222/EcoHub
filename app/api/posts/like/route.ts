import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { sendNotification } from '@/app/api/notifications/sse/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const data = await request.json();
    const { postId } = data;
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    // Find the post
    const post = await prisma.project.findUnique({
      where: { id: postId },
      include: { user: true }
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Check if the user already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: postId
        }
      }
    });
    
    if (existingLike) {
      // User already liked, remove the like (unlike)
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });
      
      return NextResponse.json({ liked: false, message: 'Post unliked successfully' });
    }
    
    // User hasn't liked, create a new like
    const like = await prisma.like.create({
      data: {
        userId: session.user.id,
        projectId: postId
      },
      include: {
        user: true,
        project: true
      }
    });
    
    // Create notification for the post owner (if not the same as liker)
    if (post.userId !== session.user.id) {
      // First create the notification in the database
      const notification = await prisma.notification.create({
        data: {
          type: 'like',
          read: false,
          userId: post.userId, // Notification recipient
          actorId: session.user.id, // User who performed the action
          projectId: postId,
          message: `${session.user.name || 'Someone'} liked your project`,
          contentTitle: post.title
        },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          project: true
        }
      });
      
      // Format the notification for the client
      const clientNotification = {
        id: notification.id,
        type: 'like',
        message: notification.message,
        read: false,
        createdAt: notification.createdAt.toISOString(),
        fromUser: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image
        },
        link: `/projects/${postId}`,
        contentTitle: post.title
      };
      
      // Send real-time notification to the post owner
      await sendNotification(post.userId, clientNotification);
    }
    
    return NextResponse.json({ 
      liked: true, 
      message: 'Post liked successfully',
      like: {
        id: like.id,
        createdAt: like.createdAt
      }
    });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
} 