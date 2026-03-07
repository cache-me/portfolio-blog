import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { testimonialStatus } from "./enums";

export const testimonial = pgTable("testimonial", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  company: text("company"),
  companyUrl: text("company_url"),
  avatar: text("avatar"),
  content: text("content").notNull(),
  rating: integer("rating"), // 1–5
  linkedinUrl: text("linkedin_url"),
  status: testimonialStatus("status").default("PENDING").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
