import { z } from "zod";

export const upsertProfileInput = z.object({
  fullName: z.string().min(1),
  headline: z.string().min(1),
  bio: z.string().min(1),
  shortBio: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  resumeUrl: z.string().url().optional().nullable(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  isAvailableForWork: z.boolean().default(true),
  yearsOfExperience: z.number().int().min(0).optional().nullable(),
  openGraphImage: z.string().url().optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
});

export type UpsertProfileInput = z.infer<typeof upsertProfileInput>;
