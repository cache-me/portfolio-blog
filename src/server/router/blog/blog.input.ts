// import { paginationSchema } from "@/server/schemas";
// import { z } from "zod";

// export const blogStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

// export const listBlogsInput = paginationSchema.extend({
//   status: blogStatusSchema.optional(),
//   featured: z.boolean().optional(),
//   categoryId: z.string().optional(),
//   search: z.string().optional(),
// });

// export const getBlogBySlugInput = z.object({
//   slug: z.string().min(1),
// });

// export const getBlogByIdInput = z.object({
//   id: z.string().min(1),
// });

// export const createBlogInput = z.object({
//   title: z.string().min(1),
//   slug: z
//     .string()
//     .min(1)
//     .regex(/^[a-z0-9-]+$/),
//   summary: z.string().min(1),
//   content: z.string().optional().nullable(),
//   coverImage: z.string().url().optional().nullable(),
//   status: blogStatusSchema.default("DRAFT"),
//   isFeatured: z.boolean().default(false),
//   readTimeMinutes: z.number().int().min(1).optional().nullable(),
//   seoTitle: z.string().optional().nullable(),
//   seoDescription: z.string().max(160).optional().nullable(),
//   seoKeywords: z.array(z.string()).optional().nullable(),
//   categoryId: z.string().optional().nullable(),
//   tagIds: z.array(z.string()).default([]),
// });

// export const updateBlogInput = createBlogInput.extend({
//   id: z.string().min(1),
// });

// export const addCommentInput = z.object({
//   blogId: z.string().min(1),
//   content: z.string().min(1).max(2000),
//   parentId: z.string().optional().nullable(),
// });

// export const updateCommentStatusInput = z.object({
//   id: z.string().min(1),
//   isApproved: z.boolean(),
// });

// export type ListBlogsInput = z.infer<typeof listBlogsInput>;
// export type GetBlogBySlugInput = z.infer<typeof getBlogBySlugInput>;
// export type GetBlogByIdInput = z.infer<typeof getBlogByIdInput>;
// export type CreateBlogInput = z.infer<typeof createBlogInput>;
// export type UpdateBlogInput = z.infer<typeof updateBlogInput>;
// export type AddCommentInput = z.infer<typeof addCommentInput>;
// export type UpdateCommentStatusInput = z.infer<typeof updateCommentStatusInput>;
import { z } from "zod";
import { paginationSchema } from "@/server/schemas";

export const blogStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const blogMediaTypeSchema = z.enum([
  "UPLOAD",
  "YOUTUBE",
  "VIMEO",
  "TWITTER",
  "INSTAGRAM",
  "TIKTOK",
  "EXTERNAL",
]);

export const blogMediaItemInput = z.object({
  type: blogMediaTypeSchema,
  uploadId: z.string().optional().nullable(),
  url: z.string().url("Must be a valid URL"),
  title: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  position: z.number().int().min(0).default(0),
  thumbnailUrl: z.string().url().optional().nullable(),
  durationSeconds: z.number().int().min(0).optional().nullable(),
});

export const listBlogsInput = paginationSchema.extend({
  status: blogStatusSchema.optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
});

export const getBlogBySlugInput = z.object({
  slug: z.string().min(1),
});

export const getBlogByIdInput = z.object({
  id: z.string().min(1),
});

export const createBlogInput = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  summary: z.string().min(1),
  content: z.string().optional().nullable(),

  coverImageId: z.string().optional().nullable(),
  coverImageUrl: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || z.string().url().safeParse(v).success, {
      message: "Must be a valid URL",
    }),

  status: blogStatusSchema.default("DRAFT"),
  isFeatured: z.boolean().default(false),
  readTimeMinutes: z.number().int().min(1).optional().nullable(),

  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  seoKeywords: z.array(z.string()).optional().nullable(),

  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),

  media: z.array(blogMediaItemInput).default([]),
});

export const updateBlogInput = createBlogInput.extend({
  id: z.string().min(1),
});

export const addCommentInput = z.object({
  blogId: z.string().min(1),
  content: z.string().min(1).max(2000),
  parentId: z.string().optional().nullable(),
});

export const updateCommentStatusInput = z.object({
  id: z.string().min(1),
  isApproved: z.boolean(),
});

export const addBlogMediaInput = z.object({
  blogId: z.string().min(1),
  media: blogMediaItemInput,
});

export const reorderBlogMediaInput = z.object({
  blogId: z.string().min(1),
  items: z.array(
    z.object({ id: z.string(), position: z.number().int().min(0) }),
  ),
});

export const deleteBlogMediaInput = z.object({
  id: z.string().min(1),
});

export type ListBlogsInput = z.infer<typeof listBlogsInput>;
export type GetBlogBySlugInput = z.infer<typeof getBlogBySlugInput>;
export type GetBlogByIdInput = z.infer<typeof getBlogByIdInput>;
export type CreateBlogInput = z.infer<typeof createBlogInput>;
export type UpdateBlogInput = z.infer<typeof updateBlogInput>;
export type AddCommentInput = z.infer<typeof addCommentInput>;
export type UpdateCommentStatusInput = z.infer<typeof updateCommentStatusInput>;
export type BlogMediaItemInput = z.infer<typeof blogMediaItemInput>;
export type AddBlogMediaInput = z.infer<typeof addBlogMediaInput>;
export type ReorderBlogMediaInput = z.infer<typeof reorderBlogMediaInput>;
export type DeleteBlogMediaInput = z.infer<typeof deleteBlogMediaInput>;
