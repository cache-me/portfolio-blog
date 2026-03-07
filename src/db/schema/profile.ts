import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  headline: text("headline").notNull(),
  bio: text("bio").notNull(),
  shortBio: text("short_bio"),
  avatar: text("avatar"),
  coverImage: text("cover_image"),
  resumeUrl: text("resume_url"),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  website: text("website"),
  isAvailableForWork: boolean("is_available_for_work").default(true).notNull(),
  yearsOfExperience: integer("years_of_experience"),
  openGraphImage: text("open_graph_image"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
