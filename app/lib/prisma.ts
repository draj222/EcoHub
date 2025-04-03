import { PrismaClient } from '@prisma/client'

// Add appropriate types for global prisma
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Define a more resilient Prisma instance with error handling
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Only assign the prisma instance to the global object in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle connection errors gracefully
prisma.$connect()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 Connected to database successfully');
    }
  })
  .catch((e) => {
    console.error('❌ Failed to connect to database:', e);
    // Don't throw error in build environments to prevent build failures
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      throw e;
    } else {
      console.warn('⚠️ Continuing build despite database connection error');
    }
  });