import { z } from "zod";

export const socialPlatformSchema = z.enum([
  "GITHUB",
  "LINKEDIN",
  "TWITTER",
  "INSTAGRAM",
  "YOUTUBE",
  "FACEBOOK",
  "DRIBBBLE",
  "BEHANCE",
  "MEDIUM",
  "DEV_TO",
  "HASHNODE",
  "OTHER",
]);

export const createSocialLinkInput = z.object({
  platform: socialPlatformSchema,
  url: z.string().url(),
  label: z.string().optional().nullable(),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateSocialLinkInput = createSocialLinkInput.extend({
  id: z.string().min(1),
});

export type CreateSocialLinkInput = z.infer<typeof createSocialLinkInput>;
export type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkInput>;
