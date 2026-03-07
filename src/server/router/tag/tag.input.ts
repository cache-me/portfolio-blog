import { z } from "zod";

export const createTagInput = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
});

export type CreateTagInput = z.infer<typeof createTagInput>;
