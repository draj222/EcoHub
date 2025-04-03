import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { sendNotification } from '../notifications/sse/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const data = await request.json();
    const { postId, content } = data;
    
    if (!postId || !content) {
      return NextResponse.json({ error: 'Post ID and content are required' }, { status: 400 });
    }
    
    // Find the post
    const post = await prisma.project.findUnique({
      where: { id: postId },
      include: { user: true }
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        projectId: postId
      },
      include: {
        user: true,
        project: true
      }
    });
    
    // Create notification for the post owner (if not the same as commenter)
    if (post.userId !== session.user.id) {
      const notification = await prisma.notification.create({
        data: {
          type: 'comment',
          read: false,
          userId: post.userId, // Notification recipient
          actorId: session.user.id, // User who performed the action
          projectId: postId,
          message: `${session.user.name || 'Someone'} commented on your project`,
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
        type: 'comment',
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
      success: true, 
      message: 'Comment created successfully',
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          image: comment.user.image
        }
      }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
} 