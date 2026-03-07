import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { experienceType } from "./enums";

export const experience = pgTable("experience", {
  id: text("id").primaryKey(),
  company: text("company").notNull(),
  companyUrl: text("company_url"),
  companyLogo: text("company_logo"),
  role: text("role").notNull(),
  type: experienceType("type").default("FULL_TIME").notNull(),
  description: text("description"),
  location: text("location"),
  isRemote: boolean("is_remote").default(false).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isCurrent: boolean("is_current").default(false).notNull(),
  technologies: text("technologies").array(),
  achievements: text("achievements").array(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
