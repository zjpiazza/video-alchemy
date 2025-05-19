import { z } from "zod";
import { privateProcedure } from "~/server/api/trpc";

export const listTransformations = privateProcedure.input(
    z.object({
      limit: z.number().min(1).max(100).optional(),
    })
  ).query(async ({ ctx, input }) => {
    return ctx.db.transformation.findMany({
      where: {
        clerkUserId: ctx.auth.userId,
      },
      orderBy: { createdAt: 'desc' },
      take: input.limit ?? 20,
    });
  })