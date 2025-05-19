import { router, privateProcedure } from '~/server/api/trpc';
import { z } from 'zod';
import { auth } from "@trigger.dev/sdk/v3";
import { transformVideo } from "~/trigger/transform";
import { listTransformations } from "./procedures/list-transformations";
import { TRPCError } from '@trpc/server';

export const transformationRouter = router({
  list: listTransformations,

  search: privateProcedure.input(
    z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(100).optional(),
    })
  ).query(async ({ ctx, input }) => {
    return ctx.db.transformation.findMany({
      where: {
        clerkUserId: ctx.auth.userId,
        OR: [
          { name: { contains: input.query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: input.limit ?? 20,
    });
  }),
  
  delete: privateProcedure.input(
    z.object({
      id: z.string(),
    })
  ).mutation(async ({ ctx, input }) => {
    // Verify the transformation belongs to the user
    const transformation = await ctx.db.transformation.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!transformation) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transformation not found',
      });
    }

    if (transformation.clerkUserId !== ctx.auth.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this transformation',
      });
    }

    // Delete the transformation
    await ctx.db.transformation.delete({
      where: {
        id: input.id,
      },
    });

    return { success: true };
  }),
  
  create: privateProcedure.input(
    z.object({
      name: z.string().min(1),
      effectId: z.string().min(1),
      inputUrl: z.string().min(1),
      effectParams: z.any().optional(),
      // optionally: originalName: z.string().min(1),
    })
  ).mutation(async ({ ctx, input }) => {
    // 1. Create the transformation object
    const transformation = await ctx.db.transformation.create({
      data: {
        clerkUserId: ctx.auth.userId,
        name: input.name,
        originalName: input.name, // or input.originalName if you have it
        inputUrl: input.inputUrl,
        effectId: input.effectId,
        effectParams: input.effectParams ?? {},
        processingMode: "SERVER",
      },
    });

    // 2. Trigger the run
    const handle = await transformVideo.trigger({
      transformationId: transformation.id,
    });

    // 3. Create the public access token
    const token = await auth.createPublicToken({
      scopes: { read: { runs: [handle.id] } },
      expirationTime: "1h",
    });

    return {
      runId: handle.id,
      publicAccessToken: token,
    };
  }),
  
  getTransformationAccessToken: privateProcedure
  .input(
    z.object({
      runId: z.string(),
    })
  ).query(async ({ input }) => {
    return auth.createPublicToken({
      scopes: {
        read: {
          runs: [input.runId],
        },
      },
      expirationTime: "1h",
    });
  }),
}); 