import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { educationDegree } from "./enums";

export const education = pgTable("education", {
  id: text("id").primaryKey(),
  institution: text("institution").notNull(),
  institutionUrl: text("institution_url"),
  institutionLogo: text("institution_logo"),
  degree: educationDegree("degree").notNull(),
  fieldOfStudy: text("field_of_study").notNull(),
  description: text("description"),
  grade: text("grade"),
  activities: text("activities").array(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isCurrent: boolean("is_current").default(false).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
