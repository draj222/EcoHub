import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// This is an admin-only endpoint for fixing specific user issues
export async function DELETE(request: NextRequest) {
  // Get email from URL query parameters
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');
  const adminKey = searchParams.get('key');
  
  // Simple security check - require an admin key
  // In production, you'd want something more secure than this
  const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-debug-key-8472';
  
  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin key required.' },
      { status: 401 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all related data first to avoid foreign key constraint errors
    // This cascade depends on how your schema is set up
    
    // Delete sessions
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });
    
    // Delete accounts
    await prisma.account.deleteMany({
      where: { userId: user.id }
    });
    
    // Delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });

    return NextResponse.json({
      success: true,
      message: `User ${email} has been deleted successfully`,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        details: String(error) 
      },
      { status: 500 }
    );
  }
} 