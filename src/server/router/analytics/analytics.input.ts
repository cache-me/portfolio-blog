import { z } from "zod";

export const trackPageViewInput = z.object({
  path: z.string().min(1),
  referrer: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

export type TrackPageViewInput = z.infer<typeof trackPageViewInput>;
