import { z } from "zod";

export const experienceTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "FREELANCE",
  "INTERNSHIP",
  "CONTRACT",
]);

export const createExperienceInput = z.object({
  company: z.string().min(1),
  companyUrl: z.string().url().optional().nullable(),
  companyLogo: z.string().url().optional().nullable(),
  role: z.string().min(1),
  type: experienceTypeSchema.default("FULL_TIME"),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isRemote: z.boolean().default(false),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  technologies: z.array(z.string()).optional().nullable(),
  achievements: z.array(z.string()).optional().nullable(),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
});

export const updateExperienceInput = createExperienceInput.extend({
  id: z.string().min(1),
});

export type CreateExperienceInput = z.infer<typeof createExperienceInput>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceInput>;
