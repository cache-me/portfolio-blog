import { paginationSchema } from "@/server/schemas";
import { z } from "zod";

export const contactStatusSchema = z.enum([
  "UNREAD",
  "READ",
  "REPLIED",
  "ARCHIVED",
]);

export const submitContactInput = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
});

export const listContactsInput = paginationSchema.extend({
  status: contactStatusSchema.optional(),
});

export const updateContactStatusInput = z.object({
  id: z.string().min(1),
  status: contactStatusSchema,
});

export type SubmitContactInput = z.infer<typeof submitContactInput>;
export type ListContactsInput = z.infer<typeof listContactsInput>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusInput>;
