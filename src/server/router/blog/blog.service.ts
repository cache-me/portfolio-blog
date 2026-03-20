// import { and, desc, eq, ilike, sql } from "drizzle-orm";
// import { nanoid } from "nanoid";
// import type { DB } from "@/server/db";
// import type {
//   ListBlogsInput,
//   GetBlogBySlugInput,
//   GetBlogByIdInput,
//   CreateBlogInput,
//   UpdateBlogInput,
//   AddCommentInput,
//   UpdateCommentStatusInput,
// } from "./blog.input";
// import { paginationOffset } from "@/server/schemas";
// import { blog, blogComment, blogTag } from "@/db/schema/blog";

// export class BlogService {
//   constructor(private db: DB) {}

//   async list(input: ListBlogsInput) {
//     const { limit, offset } = paginationOffset(input);

//     const conditions = [
//       input.status ? eq(blog.status, input.status) : undefined,
//       input.featured !== undefined
//         ? eq(blog.isFeatured, input.featured)
//         : undefined,
//       input.categoryId ? eq(blog.categoryId, input.categoryId) : undefined,
//       input.search ? ilike(blog.title, `%${input.search}%`) : undefined,
//     ].filter(Boolean) as ReturnType<typeof eq>[];

//     return this.db
//       .select()
//       .from(blog)
//       .where(conditions.length ? and(...conditions) : undefined)
//       .orderBy(desc(blog.publishedAt), desc(blog.createdAt))
//       .limit(limit)
//       .offset(offset);
//   }

//   async getBySlug(input: GetBlogBySlugInput) {
//     const [row] = await this.db.query.blog.findMany({
//       where: eq(blog.slug, input.slug),
//       with: {
//         tags: { with: { tag: true } },
//         category: true,
//         author: {
//           columns: { id: true, name: true, image: true, headline: true },
//         },
//         comments: {
//           where: eq(blogComment.isApproved, true),
//           with: {
//             author: { columns: { id: true, name: true, image: true } },
//             replies: true,
//           },
//         },
//       },
//       limit: 1,
//     });
//     if (!row) throw new Error("NOT_FOUND: Post not found");
//     return row;
//   }

//   async getById(input: GetBlogByIdInput) {
//     const [row] = await this.db.query.blog.findMany({
//       where: eq(blog.id, input.id),
//       with: {
//         tags: { with: { tag: true } },
//         category: true,
//         author: {
//           columns: { id: true, name: true, image: true, headline: true },
//         },
//       },
//       limit: 1,
//     });
//     if (!row) throw new Error("NOT_FOUND: Post not found");
//     return row;
//   }

//   async getFeatured() {
//     return this.db
//       .select()
//       .from(blog)
//       .where(and(eq(blog.isFeatured, true), eq(blog.status, "PUBLISHED")))
//       .orderBy(desc(blog.publishedAt))
//       .limit(6);
//   }

//   async incrementView(id: string) {
//     await this.db
//       .update(blog)
//       .set({ viewCount: sql`view_count + 1` })
//       .where(eq(blog.id, id));
//     return { success: true };
//   }

//   async create(input: CreateBlogInput, authorId: string) {
//     const { tagIds, ...data } = input;
//     const id = nanoid();

//     const [created] = await this.db
//       .insert(blog)
//       .values({ id, authorId, ...data })
//       .returning();

//     if (tagIds.length) {
//       await this.db
//         .insert(blogTag)
//         .values(tagIds.map((tagId) => ({ blogId: id, tagId })));
//     }

//     return created;
//   }

//   async update(input: UpdateBlogInput) {
//     const { id, tagIds, ...data } = input;

//     const [updated] = await this.db
//       .update(blog)
//       .set({ ...data, updatedAt: new Date() })
//       .where(eq(blog.id, id))
//       .returning();

//     if (!updated) throw new Error("NOT_FOUND: Post not found");

//     await this.db.delete(blogTag).where(eq(blogTag.blogId, id));
//     if (tagIds.length) {
//       await this.db
//         .insert(blogTag)
//         .values(tagIds.map((tagId) => ({ blogId: id, tagId })));
//     }

//     return updated;
//   }

//   async delete(id: string) {
//     await this.db.delete(blog).where(eq(blog.id, id));
//     return { success: true };
//   }

//   async publish(id: string) {
//     const [updated] = await this.db
//       .update(blog)
//       .set({
//         status: "PUBLISHED",
//         publishedAt: new Date(),
//         updatedAt: new Date(),
//       })
//       .where(eq(blog.id, id))
//       .returning();
//     if (!updated) throw new Error("NOT_FOUND: Post not found");
//     return updated;
//   }

//   async addComment(input: AddCommentInput, authorId: string) {
//     const [comment] = await this.db
//       .insert(blogComment)
//       .values({
//         id: nanoid(),
//         blogId: input.blogId,
//         content: input.content,
//         authorId,
//         parentId: input.parentId ?? null,
//         isApproved: false,
//       })
//       .returning();
//     return comment;
//   }

//   async updateCommentStatus(input: UpdateCommentStatusInput) {
//     const [updated] = await this.db
//       .update(blogComment)
//       .set({ isApproved: input.isApproved, updatedAt: new Date() })
//       .where(eq(blogComment.id, input.id))
//       .returning();
//     return updated;
//   }

//   async deleteComment(id: string) {
//     await this.db.delete(blogComment).where(eq(blogComment.id, id));
//     return { success: true };
//   }
// }
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import type {
  ListBlogsInput,
  GetBlogBySlugInput,
  GetBlogByIdInput,
  CreateBlogInput,
  UpdateBlogInput,
  AddCommentInput,
  UpdateCommentStatusInput,
  BlogMediaItemInput,
  AddBlogMediaInput,
  ReorderBlogMediaInput,
} from "./blog.input";
import { paginationOffset } from "@/server/schemas";
import { blog, blogComment, blogMedia, blogTag } from "@/db/schema/blog";
import { upload } from "@/db/schema/file";

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
  } catch {}
  return null;
}

function extractVimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("vimeo.com")) {
      const match = u.pathname.match(/\/(\d+)/);
      return match?.[1] ?? null;
    }
  } catch {}
  return null;
}

function extractTweetId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("twitter.com") || u.hostname.includes("x.com")) {
      const match = u.pathname.match(/\/status\/(\d+)/);
      return match?.[1] ?? null;
    }
  } catch {}
  return null;
}

function extractInstagramId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("instagram.com")) {
      const match = u.pathname.match(/\/p\/([^/]+)/);
      return match?.[1] ?? null;
    }
  } catch {}
  return null;
}

function extractTikTokId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("tiktok.com")) {
      const match = u.pathname.match(/\/video\/(\d+)/);
      return match?.[1] ?? null;
    }
  } catch {}
  return null;
}

function parseEmbedId(
  type: BlogMediaItemInput["type"],
  url: string,
): string | null {
  switch (type) {
    case "YOUTUBE":
      return extractYouTubeId(url);
    case "VIMEO":
      return extractVimeoId(url);
    case "TWITTER":
      return extractTweetId(url);
    case "INSTAGRAM":
      return extractInstagramId(url);
    case "TIKTOK":
      return extractTikTokId(url);
    default:
      return null;
  }
}

export class BlogService {
  constructor(private db: DB) {}

  async list(input: ListBlogsInput) {
    const { limit, offset } = paginationOffset(input);

    const conditions = [
      input.status ? eq(blog.status, input.status) : undefined,
      input.featured !== undefined
        ? eq(blog.isFeatured, input.featured)
        : undefined,
      input.categoryId ? eq(blog.categoryId, input.categoryId) : undefined,
      input.search ? ilike(blog.title, `%${input.search}%`) : undefined,
    ].filter(Boolean) as ReturnType<typeof eq>[];

    return this.db
      .select({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        summary: blog.summary,
        status: blog.status,
        isFeatured: blog.isFeatured,
        readTimeMinutes: blog.readTimeMinutes,
        viewCount: blog.viewCount,
        likeCount: blog.likeCount,
        coverImageId: blog.coverImageId,
        coverImageUrl: blog.coverImageUrl,
        coverImage: upload.publicUrl,
        authorId: blog.authorId,
        categoryId: blog.categoryId,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        publishedAt: blog.publishedAt,
      })
      .from(blog)
      .leftJoin(upload, eq(blog.coverImageId, upload.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(blog.publishedAt), desc(blog.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getBySlug(input: GetBlogBySlugInput) {
    const [row] = await this.db.query.blog.findMany({
      where: eq(blog.slug, input.slug),
      with: {
        coverImage: true,
        tags: { with: { tag: true } },
        category: true,
        author: {
          columns: { id: true, name: true, image: true, headline: true },
        },
        media: {
          with: { upload: true },
          orderBy: [blog.id], // ordered by position
        },
        comments: {
          where: eq(blogComment.isApproved, true),
          with: {
            author: { columns: { id: true, name: true, image: true } },
            replies: {
              with: {
                author: { columns: { id: true, name: true, image: true } },
              },
            },
          },
        },
      },
      limit: 1,
    });
    if (!row) throw new Error("NOT_FOUND: Post not found");
    return row;
  }

  async getById(input: GetBlogByIdInput) {
    const [row] = await this.db.query.blog.findMany({
      where: eq(blog.id, input.id),
      with: {
        coverImage: true,
        tags: { with: { tag: true } },
        category: true,
        author: {
          columns: { id: true, name: true, image: true, headline: true },
        },
        media: {
          with: { upload: true },
        },
        comments: {
          with: {
            author: { columns: { id: true, name: true, image: true } },
            replies: true,
          },
        },
      },
      limit: 1,
    });
    if (!row) throw new Error("NOT_FOUND: Post not found");
    return row;
  }

  async getFeatured() {
    return this.db
      .select({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        summary: blog.summary,
        coverImage: upload.publicUrl,
        coverImageUrl: blog.coverImageUrl,
        publishedAt: blog.publishedAt,
        readTimeMinutes: blog.readTimeMinutes,
        viewCount: blog.viewCount,
      })
      .from(blog)
      .leftJoin(upload, eq(blog.coverImageId, upload.id))
      .where(and(eq(blog.isFeatured, true), eq(blog.status, "PUBLISHED")))
      .orderBy(desc(blog.publishedAt))
      .limit(6);
  }

  async incrementView(id: string) {
    await this.db
      .update(blog)
      .set({ viewCount: sql`view_count + 1` })
      .where(eq(blog.id, id));
    return { success: true };
  }

  async create(input: CreateBlogInput, authorId: string) {
    const { tagIds, media, ...data } = input;
    const id = nanoid();

    if (data.coverImageId) {
      await this._assertUploadConfirmed(data.coverImageId);
    }

    const [created] = await this.db
      .insert(blog)
      .values({ id, authorId, ...data })
      .returning();

    if (tagIds.length) {
      await this.db
        .insert(blogTag)
        .values(tagIds.map((tagId) => ({ blogId: id, tagId })));
    }

    if (media.length) {
      await this._insertMedia(id, media);
    }

    return created;
  }

  async update(input: UpdateBlogInput) {
    const { id, tagIds, media, ...data } = input;

    if (data.coverImageId) {
      await this._assertUploadConfirmed(data.coverImageId);
    }

    const [updated] = await this.db
      .update(blog)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(blog.id, id))
      .returning();

    if (!updated) throw new Error("NOT_FOUND: Post not found");

    await this.db.delete(blogTag).where(eq(blogTag.blogId, id));
    if (tagIds.length) {
      await this.db
        .insert(blogTag)
        .values(tagIds.map((tagId) => ({ blogId: id, tagId })));
    }

    await this.db.delete(blogMedia).where(eq(blogMedia.blogId, id));
    if (media.length) {
      await this._insertMedia(id, media);
    }

    return updated;
  }

  async delete(id: string) {
    await this.db.delete(blog).where(eq(blog.id, id));
    return { success: true };
  }

  async publish(id: string) {
    const [updated] = await this.db
      .update(blog)
      .set({
        status: "PUBLISHED",
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(blog.id, id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Post not found");
    return updated;
  }

  async addMedia(input: AddBlogMediaInput) {
    const [item] = await this._insertMedia(input.blogId, [input.media]);
    return item;
  }

  async reorderMedia(input: ReorderBlogMediaInput) {
    await Promise.all(
      input.items.map(({ id, position }) =>
        this.db
          .update(blogMedia)
          .set({ position })
          .where(and(eq(blogMedia.id, id), eq(blogMedia.blogId, input.blogId))),
      ),
    );
    return { success: true };
  }

  async deleteMedia(id: string) {
    await this.db.delete(blogMedia).where(eq(blogMedia.id, id));
    return { success: true };
  }

  async addComment(input: AddCommentInput, authorId: string) {
    const [comment] = await this.db
      .insert(blogComment)
      .values({
        id: nanoid(),
        blogId: input.blogId,
        content: input.content,
        authorId,
        parentId: input.parentId ?? null,
        isApproved: false,
      })
      .returning();
    return comment;
  }

  async updateCommentStatus(input: UpdateCommentStatusInput) {
    const [updated] = await this.db
      .update(blogComment)
      .set({ isApproved: input.isApproved, updatedAt: new Date() })
      .where(eq(blogComment.id, input.id))
      .returning();
    return updated;
  }

  async deleteComment(id: string) {
    await this.db.delete(blogComment).where(eq(blogComment.id, id));
    return { success: true };
  }

  private async _assertUploadConfirmed(uploadId: string) {
    const [row] = await this.db
      .select({ id: upload.id, status: upload.status })
      .from(upload)
      .where(eq(upload.id, uploadId))
      .limit(1);

    if (!row) throw new Error(`VALIDATION: Upload ${uploadId} not found`);
    if (row.status !== "UPLOADED") {
      throw new Error(
        `VALIDATION: Upload ${uploadId} is not confirmed (status: ${row.status})`,
      );
    }
  }

  private async _insertMedia(blogId: string, items: BlogMediaItemInput[]) {
    const rows = items.map((item) => ({
      id: nanoid(),
      blogId,
      type: item.type,
      uploadId: item.uploadId ?? null,
      url: item.url,
      embedId: parseEmbedId(item.type, item.url),
      title: item.title ?? null,
      description: item.description ?? null,
      position: item.position ?? 0,
      thumbnailUrl: item.thumbnailUrl ?? null,
      durationSeconds: item.durationSeconds ?? null,
    }));

    return this.db.insert(blogMedia).values(rows).returning();
  }
}
