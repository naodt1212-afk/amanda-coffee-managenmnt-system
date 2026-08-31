import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global prisma to prevent multiple instances during hot reload
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma = global.prismaGlobal || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}
