import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { projectStatus } from "./enums";
import { category } from "./category";
import { tag } from "./tag";
import { skill } from "./skill";

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary").notNull(),
    description: text("description"),
    coverImage: text("cover_image"),
    images: text("images").array(),
    githubUrl: text("github_url"),
    liveUrl: text("live_url"),
    demoUrl: text("demo_url"),
    status: projectStatus("status").default("DRAFT").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    metadata: jsonb("metadata"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    index("project_status_idx").on(table.status),
    index("project_slug_idx").on(table.slug),
    index("project_categoryId_idx").on(table.categoryId),
  ],
);

export const projectTag = pgTable(
  "project_tag",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [index("projectTag_projectId_idx").on(table.projectId)],
);

export const projectSkill = pgTable(
  "project_skill",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
  },
  (table) => [index("projectSkill_projectId_idx").on(table.projectId)],
);

export const projectRelations = relations(project, ({ one, many }) => ({
  category: one(category, {
    fields: [project.categoryId],
    references: [category.id],
  }),
  tags: many(projectTag),
  skills: many(projectSkill),
}));

export const projectTagRelations = relations(projectTag, ({ one }) => ({
  project: one(project, {
    fields: [projectTag.projectId],
    references: [project.id],
  }),
  tag: one(tag, { fields: [projectTag.tagId], references: [tag.id] }),
}));

export const projectSkillRelations = relations(projectSkill, ({ one }) => ({
  project: one(project, {
    fields: [projectSkill.projectId],
    references: [project.id],
  }),
  skill: one(skill, {
    fields: [projectSkill.skillId],
    references: [skill.id],
  }),
}));
