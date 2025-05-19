import { privateProcedure } from '~/server/api/trpc';
import { db } from '~/server/api/prisma';

export const listEffects = privateProcedure.query(() => {
  return db.effect.findMany({
    orderBy: { name: 'asc' },
  });
}); 