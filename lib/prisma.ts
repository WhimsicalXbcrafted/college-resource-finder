import { PrismaClient } from '@prisma/client';

// Define a global type for the PrismaClient instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a singleton instance of PrismaClient
const globalForPrisma = global as { prisma?: PrismaClient };

// Export the PrismaClient instance, reusing the existing one if it exists
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Enable query logging
  });

// Assign the PrismaClient instance to the global object in non-production environments
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}