import { z } from "zod";

export const skillLevelSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);

export const createSkillCategoryInput = z.object({
  name: z.string().min(1),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const updateSkillCategoryInput = createSkillCategoryInput.extend({
  id: z.string().min(1),
});

export const listSkillsInput = z.object({
  categoryId: z.string().optional(),
  visible: z.boolean().optional(),
});

export const createSkillInput = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  icon: z.string().optional().nullable(),
  level: skillLevelSchema.default("INTERMEDIATE"),
  yearsOfExperience: z.number().int().min(0).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateSkillInput = createSkillInput.extend({
  id: z.string().min(1),
});

export type CreateSkillCategoryInput = z.infer<typeof createSkillCategoryInput>;
export type UpdateSkillCategoryInput = z.infer<typeof updateSkillCategoryInput>;
export type ListSkillsInput = z.infer<typeof listSkillsInput>;
export type CreateSkillInput = z.infer<typeof createSkillInput>;
export type UpdateSkillInput = z.infer<typeof updateSkillInput>;
