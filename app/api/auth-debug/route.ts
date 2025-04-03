import { NextResponse } from 'next/server';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    // Basic environment check
    const envCheck = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? `Set (${process.env.NEXTAUTH_SECRET.substring(0, 5)}...)` : 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      NODE_ENV: process.env.NODE_ENV,
    };

    // Check if we can access users table
    let userCheck;
    try {
      const firstUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          password: true,
          createdAt: true
        }
      });

      userCheck = {
        status: 'success',
        message: 'Found first user',
        user: firstUser ? {
          id: firstUser.id,
          email: firstUser.email,
          hasPassword: !!firstUser.password,
          passwordLength: firstUser.password?.length,
          createdAt: firstUser.createdAt
        } : null
      };
    } catch (error) {
      userCheck = {
        status: 'error',
        message: 'Failed to fetch user',
        error: String(error)
      };
    }

    // Check if our bcrypt is working as expected
    let bcryptCheck;
    try {
      const testPassword = "test-password-123";
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const verified = await bcrypt.compare(testPassword, hashedPassword);
      
      bcryptCheck = {
        status: 'success',
        message: 'Bcrypt working correctly',
        hashLength: hashedPassword.length,
        verified: verified
      };
    } catch (error) {
      bcryptCheck = {
        status: 'error',
        message: 'Bcrypt test failed',
        error: String(error)
      };
    }

    // Check NextAuth config
    const authCheck = {
      providers: authOptions.providers.map(p => p.id).join(', '),
      adapter: authOptions.adapter ? 'Set' : 'Not set',
      session: authOptions.session,
      debug: authOptions.debug
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      environmentVariables: envCheck,
      userCheck,
      bcryptCheck,
      authCheck
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to run auth diagnostics',
      error: String(error)
    }, { status: 500 });
  }
} 