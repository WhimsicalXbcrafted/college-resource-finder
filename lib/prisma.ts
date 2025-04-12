import { PrismaClient } from '@prisma/client'

declare const global: typeof globalThis & { prisma?: PrismaClient }

const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?statement_cache_size=0"
    }
  }
})

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma