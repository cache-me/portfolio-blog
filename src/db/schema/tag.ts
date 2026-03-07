import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { projectTag } from "./project";
import { blogTag } from "./blog";

export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tagRelations = relations(tag, ({ many }) => ({
  projectTags: many(projectTag),
  blogTags: many(blogTag),
}));
