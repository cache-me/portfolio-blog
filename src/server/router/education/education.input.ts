import { z } from "zod";

export const educationDegreeSchema = z.enum([
  "HIGH_SCHOOL",
  "ASSOCIATE",
  "BACHELOR",
  "MASTER",
  "PHD",
  "DIPLOMA",
  "CERTIFICATION",
  "BOOTCAMP",
  "OTHER",
]);

export const createEducationInput = z.object({
  institution: z.string().min(1),
  institutionUrl: z.string().url().optional().nullable(),
  institutionLogo: z.string().url().optional().nullable(),
  degree: educationDegreeSchema,
  fieldOfStudy: z.string().min(1),
  description: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
  activities: z.array(z.string()).optional().nullable(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateEducationInput = createEducationInput.extend({
  id: z.string().min(1),
});

export type CreateEducationInput = z.infer<typeof createEducationInput>;
export type UpdateEducationInput = z.infer<typeof updateEducationInput>;
