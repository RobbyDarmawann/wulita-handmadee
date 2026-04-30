import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Reduce connection pool size to prevent exhaustion in serverless
    errorFormat: 'pretty',
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

// Gracefully handle disconnection on SIGTERM (Vercel shutdown)
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
  })
}