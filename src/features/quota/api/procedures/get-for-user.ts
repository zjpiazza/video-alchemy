import { publicProcedure } from '~/server/api/trpc';
import { db } from '~/server/api/prisma';
import { z } from 'zod';

export const getForUser = publicProcedure
  .input(z.object({ clerkUserId: z.string().min(1) }))
  .query(async ({ input, ctx }) => {
    // Debug what's coming in
    console.log("Input received:", JSON.stringify(input));
    console.log("Raw input type:", typeof input);
    
    // Extra safety check to ensure clerkUserId exists
    if (!input || !input.clerkUserId) {
      console.error("Missing clerkUserId in input:", input);
      throw new Error("Missing clerkUserId");
    }
    
    const clerkUserId = input.clerkUserId;
    console.log("Processing quota for user:", clerkUserId);
    
    let quota = await db.quota.findUnique({
      where: { clerkUserId },
    });
    
    if (!quota) {
      console.log("Creating quota for user", clerkUserId);
      quota = await db.quota.create({
        data: {
          clerkUserId,
          // Defaults from your schema
          totalTransformations: 50,
          usedTransformations: 0,
          totalStorageGb: 5,
          usedStorageGb: 0,
        },
      });
    }
    
    return quota;
  }); 