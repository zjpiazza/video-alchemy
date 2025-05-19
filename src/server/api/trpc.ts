// src/server/api/trpc.ts
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import SuperJSON from 'superjson';
import { db } from './prisma';


type AuthReturn = Awaited<ReturnType<typeof auth>>;
type Context = { auth: AuthReturn, db: typeof db };

// Example: getAuthFromRequest is your own function
export const createTRPCContext = async ({ req }: FetchCreateContextFnOptions): Promise<Context> => {
  // Example: get user from headers/cookies/session
  const authInfo = await auth();
  return { auth: authInfo, db };
};

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware for protected procedures
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      auth: ctx.auth,
      db: ctx.db,
    },
  });
});

export const privateProcedure = t.procedure.use(isAuthed);