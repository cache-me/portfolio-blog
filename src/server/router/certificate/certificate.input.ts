import { z } from "zod";

export const createCertificateInput = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  issuerLogo: z.string().url().optional().nullable(),
  credentialId: z.string().optional().nullable(),
  credentialUrl: z.string().url().optional().nullable(),
  image: z.string().url().optional().nullable(),
  issuedAt: z.string(),
  expiresAt: z.string().optional().nullable(),
  doesNotExpire: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  skillIds: z.array(z.string()).default([]),
});

export const updateCertificateInput = createCertificateInput.extend({
  id: z.string().min(1),
});

export type CreateCertificateInput = z.infer<typeof createCertificateInput>;
export type UpdateCertificateInput = z.infer<typeof updateCertificateInput>;
