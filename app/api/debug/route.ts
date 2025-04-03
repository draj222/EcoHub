import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    // Test 1: Basic database connectivity
    let dbStatus;
    try {
      const result = await prisma.$queryRaw`SELECT 1 as connected`;
      dbStatus = { status: 'success', message: 'Database connection successful', result };
    } catch (error) {
      dbStatus = { status: 'error', message: 'Database connection failed', error: String(error) };
    }

    // Test 2: User table access
    let userTableStatus;
    try {
      const userCount = await prisma.user.count();
      userTableStatus = { status: 'success', message: 'User table access successful', count: userCount };
    } catch (error) {
      userTableStatus = { status: 'error', message: 'User table access failed', error: String(error) };
    }

    // Test 3: Check environment variables
    const envStatus = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set (not needed on Vercel)',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set (starts with: ' + process.env.DATABASE_URL.substring(0, 10) + '...)' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
    };

    // Test 4: Check bcrypt functionality
    let bcryptStatus;
    try {
      const testHash = await bcrypt.hash('test', 10);
      const testVerify = await bcrypt.compare('test', testHash);
      bcryptStatus = { status: 'success', message: 'Bcrypt functions correctly', verified: testVerify };
    } catch (error) {
      bcryptStatus = { status: 'error', message: 'Bcrypt error', error: String(error) };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseStatus: dbStatus,
      userTableStatus: userTableStatus,
      environmentVariables: envStatus,
      bcryptStatus: bcryptStatus
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Diagnostic failed', details: String(error) },
      { status: 500 }
    );
  }
} 