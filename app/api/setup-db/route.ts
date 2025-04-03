import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcrypt';

// Define TypeScript interfaces for our result objects
interface MigrationResult {
  status: string;
  message?: string;
  connected?: boolean;
  error?: string;
}

interface UserCountResult {
  status: string;
  count: number;
  message?: string;
  error?: string;
}

interface TestUserResult {
  status: string;
  message?: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  error?: string;
}

interface SetupResults {
  migrations: MigrationResult;
  testUser: TestUserResult;
  existingUsers: UserCountResult;
}

export async function GET() {
  const results: SetupResults = {
    migrations: { status: 'pending' },
    testUser: { status: 'pending' },
    existingUsers: { status: 'pending', count: 0 }
  };

  // Step 1: Check if we can access the database
  try {
    const dbTest = await prisma.$queryRaw`SELECT 1 as connected`;
    results.migrations = { 
      status: 'success', 
      message: 'Database connection successful',
      connected: true
    };
  } catch (error) {
    return NextResponse.json({
      error: 'Database connection failed',
      details: String(error)
    }, { status: 500 });
  }

  // Step 2: Check if users table exists and has any users
  try {
    const userCount = await prisma.user.count();
    results.existingUsers = { 
      status: 'success', 
      count: userCount,
      message: `Found ${userCount} existing users`
    };
  } catch (error) {
    results.existingUsers = { 
      status: 'error', 
      count: 0,
      message: 'Could not count users, table might not exist',
      error: String(error)
    };
  }

  // Step 3: Create a test user if none exists
  try {
    // Only create test user if no users exist
    if (results.existingUsers.count === 0) {
      // Create a test user
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
      
      const testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
        }
      });
      
      results.testUser = { 
        status: 'success', 
        message: 'Created test user',
        user: {
          id: testUser.id,
          name: testUser.name,
          email: testUser.email
        }
      };
    } else {
      results.testUser = { 
        status: 'skipped', 
        message: 'Users already exist, skipped test user creation'
      };
    }
  } catch (error) {
    results.testUser = { 
      status: 'error', 
      message: 'Failed to create test user',
      error: String(error)
    };
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    results
  });
} 