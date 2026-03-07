import { z } from "zod";

export const createCategoryInput = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

export const updateCategoryInput = createCategoryInput.extend({
  id: z.string().min(1),
});

export type CreateCategoryInput = z.infer<typeof createCategoryInput>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryInput>;
