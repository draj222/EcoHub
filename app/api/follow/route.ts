import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if the user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follower.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId,
          },
        },
      });
      return NextResponse.json({ message: 'Unfollowed successfully' });
    } else {
      // Follow
      await prisma.follower.create({
        data: {
          followerId: session.user.id,
          followingId: userId,
        },
      });
      return NextResponse.json({ message: 'Followed successfully' });
    }
  } catch (error) {
    console.error('Follow/Unfollow error:', error);
    return NextResponse.json(
      { error: 'Failed to follow/unfollow user' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'followers' or 'following'

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'User ID and type are required' },
        { status: 400 }
      );
    }

    let users;
    if (type === 'followers') {
      users = await prisma.follower.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
      });
      users = users.map((f) => f.follower);
    } else {
      users = await prisma.follower.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
      });
      users = users.map((f) => f.following);
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get followers/following error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followers/following' },
      { status: 500 }
    );
  }
} 