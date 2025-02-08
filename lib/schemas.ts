import { z } from "zod";

export const ExampleMetadataSchema = z.object({
  status: z.object({
    progress: z.number(),
    label: z.string(),
  }),
});