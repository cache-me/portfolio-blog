import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function paginationOffset(p: Pagination) {
  return { limit: p.limit, offset: (p.page - 1) * p.limit };
}

export const idSchema = z.object({ id: z.string().min(1) });
export const slugSchema = z.object({ slug: z.string().min(1) });

export const projectStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const blogStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const contactStatusSchema = z.enum([
  "UNREAD",
  "READ",
  "REPLIED",
  "ARCHIVED",
]);
export const testimonialStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
