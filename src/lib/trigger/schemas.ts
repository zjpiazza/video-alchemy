import { z } from "zod";

export const MetadataSchema = z.object({
  status: z.object({
    progress: z.number(),
    label: z.string(),
  }),
});

export type MetadataStatus = z.infer<typeof MetadataSchema.shape.status>;