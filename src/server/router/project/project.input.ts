import { paginationSchema } from "@/server/schemas";
import { z } from "zod";

export const projectStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const listProjectsInput = paginationSchema.extend({
  status: projectStatusSchema.optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
});

export const getProjectBySlugInput = z.object({
  slug: z.string().min(1),
});

export const getProjectByIdInput = z.object({
  id: z.string().min(1),
});

export const createProjectInput = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  summary: z.string().min(1),
  description: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  liveUrl: z.string().url().optional().nullable(),
  demoUrl: z.string().url().optional().nullable(),
  status: projectStatusSchema.default("DRAFT"),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  metadata: z.record(z.string()).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  skillIds: z.array(z.string()).default([]),
});

export const updateProjectInput = createProjectInput.extend({
  id: z.string().min(1),
});

export type ListProjectsInput = z.infer<typeof listProjectsInput>;
export type GetProjectBySlugInput = z.infer<typeof getProjectBySlugInput>;
export type GetProjectByIdInput = z.infer<typeof getProjectByIdInput>;
export type CreateProjectInput = z.infer<typeof createProjectInput>;
export type UpdateProjectInput = z.infer<typeof updateProjectInput>;
