import { z } from "zod";

export const ALLOWED_MIME_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ],
  PDF: ["application/pdf"],
  EXCEL: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ],
  WORD: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  VIDEO: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  AUDIO: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
} as const;

export const ALL_ALLOWED_MIME_TYPES = Object.values(ALLOWED_MIME_TYPES).flat();

export const MAX_FILE_SIZES = {
  IMAGE: 10 * 1024 * 1024, // 10 MB
  PDF: 20 * 1024 * 1024, // 20 MB
  EXCEL: 10 * 1024 * 1024, // 10 MB
  WORD: 10 * 1024 * 1024, // 10 MB
  VIDEO: 100 * 1024 * 1024, // 100 MB
  AUDIO: 20 * 1024 * 1024, // 20 MB
  OTHER: 10 * 1024 * 1024, // 10 MB
} as const;

export const uploadTypeSchema = z.enum([
  "IMAGE",
  "PDF",
  "EXCEL",
  "WORD",
  "VIDEO",
  "AUDIO",
  "OTHER",
]);

export const uploadStatusSchema = z.enum([
  "PENDING",
  "UPLOADED",
  "FAILED",
  "DELETED",
]);

export const requestUploadInput = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  bucket: z.string().optional(),
});

export const confirmUploadInput = z.object({
  id: z.string().min(1),
});

export const failUploadInput = z.object({
  id: z.string().min(1),
});

export const deleteUploadInput = z.object({
  id: z.string().min(1),
});

export const listUploadsInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  type: uploadTypeSchema.optional(),
  status: uploadStatusSchema.optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
});

export type RequestUploadInput = z.infer<typeof requestUploadInput>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadInput>;
export type FailUploadInput = z.infer<typeof failUploadInput>;
export type DeleteUploadInput = z.infer<typeof deleteUploadInput>;
export type ListUploadsInput = z.infer<typeof listUploadsInput>;
