import { initTRPC } from '@trpc/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '~/server/api/prisma';

export async function createTRPCContext(opts?: { headers?: Headers }) {
  
  const authInfo = await auth();
  
  return {
    auth: authInfo.userId,
    db,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.create();
export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure; 