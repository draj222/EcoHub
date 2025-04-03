import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET() {
  // This is just a stub since we can't run migrations directly through the API
  // Vercel functions can't run shell commands in production
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1 as connected`;
    
    // Try to count users to see if tables exist
    try {
      const userCount = await prisma.user.count();
      return NextResponse.json({
        status: 'success',
        message: 'Database tables already exist',
        userCount
      });
    } catch (error) {
      return NextResponse.json({
        status: 'warning',
        message: 'Database connected but tables may not exist or may be incomplete. You need to run migrations manually.',
        error: String(error)
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to database',
      error: String(error)
    }, { status: 500 });
  }
}

// The POST method is only for use in development environments!
export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({
      status: 'error',
      message: 'Migrations can only be run through this endpoint in development environment'
    }, { status: 403 });
  }
  
  try {
    // Run migrations in development environment
    const { stdout, stderr } = await execPromise('npx prisma migrate deploy');
    
    return NextResponse.json({
      status: 'success',
      message: 'Migrations applied successfully',
      stdout,
      stderr
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Migration failed',
      error: String(error)
    }, { status: 500 });
  }
} 