import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const uploadTypeEnum = pgEnum("upload_type", [
  "IMAGE",
  "PDF",
  "EXCEL",
  "WORD",
  "VIDEO",
  "AUDIO",
  "OTHER",
]);

export const uploadStatusEnum = pgEnum("upload_status", [
  "PENDING", // presigned URL issued, upload not confirmed yet
  "UPLOADED", // client confirmed upload complete
  "FAILED", // upload failed or expired
  "DELETED", // soft-deleted
]);

export const upload = pgTable(
  "upload",
  {
    id: text("id").primaryKey(),

    fileName: text("file_name").notNull(),

    mimeType: text("mime_type").notNull(),

    size: integer("size").notNull(),

    type: uploadTypeEnum("type").notNull(),

    status: uploadStatusEnum("status").default("PENDING").notNull(),

    storagePath: text("storage_path").notNull().unique(),

    publicUrl: text("public_url"),

    bucket: text("bucket").notNull().default("uploads"),

    uploadedById: text("uploaded_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),

    resourceType: text("resource_type"),
    resourceId: text("resource_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("upload_uploadedById_idx").on(table.uploadedById),
    index("upload_status_idx").on(table.status),
    index("upload_type_idx").on(table.type),
    index("upload_resourceType_resourceId_idx").on(
      table.resourceType,
      table.resourceId,
    ),
  ],
);

export const uploadRelations = relations(upload, ({ one }) => ({
  uploadedBy: one(user, {
    fields: [upload.uploadedById],
    references: [user.id],
  }),
}));

export type Upload = typeof upload.$inferSelect;
export type NewUpload = typeof upload.$inferInsert;
