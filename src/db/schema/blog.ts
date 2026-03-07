import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { blogStatus } from "./enums";
import { user } from "./auth";
import { category } from "./category";
import { tag } from "./tag";

export const blog = pgTable(
  "blog",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary").notNull(),
    content: text("content"),
    coverImage: text("cover_image"),
    status: blogStatus("status").default("DRAFT").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    readTimeMinutes: integer("read_time_minutes"),
    viewCount: integer("view_count").default(0).notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    seoKeywords: text("seo_keywords").array(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
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
    index("blog_status_idx").on(table.status),
    index("blog_slug_idx").on(table.slug),
    index("blog_authorId_idx").on(table.authorId),
    index("blog_categoryId_idx").on(table.categoryId),
  ],
);

export const blogTag = pgTable(
  "blog_tag",
  {
    blogId: text("blog_id")
      .notNull()
      .references(() => blog.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [index("blogTag_blogId_idx").on(table.blogId)],
);

export const blogComment = pgTable(
  "blog_comment",
  {
    id: text("id").primaryKey(),
    content: text("content").notNull(),
    blogId: text("blog_id")
      .notNull()
      .references(() => blog.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: text("parent_id"), // self-referential — handled via relation
    isApproved: boolean("is_approved").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("blogComment_blogId_idx").on(table.blogId),
    index("blogComment_authorId_idx").on(table.authorId),
  ],
);

export const blogRelations = relations(blog, ({ one, many }) => ({
  author: one(user, { fields: [blog.authorId], references: [user.id] }),
  category: one(category, {
    fields: [blog.categoryId],
    references: [category.id],
  }),
  tags: many(blogTag),
  comments: many(blogComment),
}));

export const blogTagRelations = relations(blogTag, ({ one }) => ({
  blog: one(blog, { fields: [blogTag.blogId], references: [blog.id] }),
  tag: one(tag, { fields: [blogTag.tagId], references: [tag.id] }),
}));

export const blogCommentRelations = relations(blogComment, ({ one, many }) => ({
  blog: one(blog, { fields: [blogComment.blogId], references: [blog.id] }),
  author: one(user, {
    fields: [blogComment.authorId],
    references: [user.id],
  }),
  parent: one(blogComment, {
    fields: [blogComment.parentId],
    references: [blogComment.id],
    relationName: "comment_replies",
  }),
  replies: many(blogComment, { relationName: "comment_replies" }),
}));
