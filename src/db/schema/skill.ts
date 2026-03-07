import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { skillLevel } from "./enums";
import { projectSkill } from "./project";
import { certificateSkill } from "./certificate";

export const skillCategory = pgTable("skill_category", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const skill = pgTable(
  "skill",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    icon: text("icon"),
    level: skillLevel("level").default("INTERMEDIATE").notNull(),
    yearsOfExperience: integer("years_of_experience"),
    categoryId: text("category_id").references(() => skillCategory.id, {
      onDelete: "set null",
    }),
    isVisible: boolean("is_visible").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("skill_categoryId_idx").on(table.categoryId)],
);

export const skillCategoryRelations = relations(skillCategory, ({ many }) => ({
  skills: many(skill),
}));

export const skillRelations = relations(skill, ({ one, many }) => ({
  category: one(skillCategory, {
    fields: [skill.categoryId],
    references: [skillCategory.id],
  }),
  projectSkills: many(projectSkill),
  certificateSkills: many(certificateSkill),
}));
