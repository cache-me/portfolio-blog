import { z } from "zod";

export const testimonialStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const createTestimonialInput = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  company: z.string().optional().nullable(),
  companyUrl: z.string().url().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  content: z.string().min(10),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const updateTestimonialInput = createTestimonialInput.extend({
  id: z.string().min(1),
});

export const updateTestimonialStatusInput = z.object({
  id: z.string().min(1),
  status: testimonialStatusSchema,
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialInput>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialInput>;
export type UpdateTestimonialStatusInput = z.infer<
  typeof updateTestimonialStatusInput
>;
