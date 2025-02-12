/**
 * Prisma Client singleton setup
 * This ensures we don't create multiple database connections during hot reloading
 */
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create a singleton instance of PrismaClient
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
    })

// Assign prisma client to global object in non-production environments
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Define global type for PrismaClient instance
declare global {
    var prisma: PrismaClient | undefined
} 