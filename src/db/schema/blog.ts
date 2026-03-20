import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { category } from "./category";
import { tag } from "./tag";
import { upload } from "./file";

export const blogStatusEnum = pgEnum("blog_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const blogMediaTypeEnum = pgEnum("blog_media_type", [
  "UPLOAD",
  "YOUTUBE",
  "VIMEO",
  "TWITTER",
  "INSTAGRAM",
  "TIKTOK",
  "EXTERNAL",
]);

export const blog = pgTable(
  "blog",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary").notNull(),
    content: text("content"),
    coverImageId: text("cover_image_id").references(() => upload.id, {
      onDelete: "set null",
    }),
    coverImageUrl: text("cover_image_url"),
    status: blogStatusEnum("status").default("DRAFT").notNull(),
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
    index("blog_coverImageId_idx").on(table.coverImageId),
  ],
);

export const blogMedia = pgTable(
  "blog_media",
  {
    id: text("id").primaryKey(),
    blogId: text("blog_id")
      .notNull()
      .references(() => blog.id, { onDelete: "cascade" }),
    type: blogMediaTypeEnum("type").notNull(),
    uploadId: text("upload_id").references(() => upload.id, {
      onDelete: "set null",
    }),
    url: text("url").notNull(),
    embedId: text("embed_id"),
    title: text("title"),
    description: text("description"),
    position: integer("position").default(0).notNull(),
    thumbnailUrl: text("thumbnail_url"),
    durationSeconds: integer("duration_seconds"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("blogMedia_blogId_idx").on(table.blogId),
    index("blogMedia_uploadId_idx").on(table.uploadId),
    index("blogMedia_position_idx").on(table.blogId, table.position),
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
    parentId: text("parent_id"),
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
  coverImage: one(upload, {
    fields: [blog.coverImageId],
    references: [upload.id],
  }),
  tags: many(blogTag),
  media: many(blogMedia),
  comments: many(blogComment),
}));

export const blogMediaRelations = relations(blogMedia, ({ one }) => ({
  blog: one(blog, { fields: [blogMedia.blogId], references: [blog.id] }),
  upload: one(upload, {
    fields: [blogMedia.uploadId],
    references: [upload.id],
  }),
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

export type Blog = typeof blog.$inferSelect;
export type NewBlog = typeof blog.$inferInsert;
export type BlogMedia = typeof blogMedia.$inferSelect;
export type NewBlogMedia = typeof blogMedia.$inferInsert;
export type BlogMediaType = (typeof blogMediaTypeEnum.enumValues)[number];
