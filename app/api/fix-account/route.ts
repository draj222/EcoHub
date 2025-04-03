import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email') || 'tsaidheeraj@gmail.com';
  const action = searchParams.get('action') || 'check';
  
  try {
    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true }
    });

    // Different operations based on action parameter
    if (action === 'check') {
      return NextResponse.json({
        exists: !!existingUser,
        email,
        userId: existingUser?.id || null,
        hasPassword: !!existingUser?.password
      });
    }
    
    else if (action === 'delete') {
      if (!existingUser) {
        return NextResponse.json({
          success: false,
          message: `User ${email} not found`
        });
      }
      
      // Delete related records
      await prisma.session.deleteMany({ where: { userId: existingUser.id } });
      await prisma.account.deleteMany({ where: { userId: existingUser.id } });
      
      // Delete the user
      await prisma.user.delete({ where: { id: existingUser.id } });
      
      return NextResponse.json({
        success: true,
        message: `User ${email} deleted successfully`
      });
    }
    
    else if (action === 'reset-password') {
      if (!existingUser) {
        return NextResponse.json({
          success: false,
          message: `User ${email} not found`
        });
      }
      
      // Create a new hashed password
      const newPassword = 'password123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the user's password
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
      
      return NextResponse.json({
        success: true,
        message: `Password reset for ${email}`,
        newPassword
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use "check", "delete", or "reset-password"'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
} 