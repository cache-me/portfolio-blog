import { and, desc, eq, ilike, sql } from "drizzle-orm";
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
} from "./blog.input";
import { paginationOffset } from "@/server/schemas";
import { blog, blogComment, blogTag } from "@/db/schema/blog";

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
      .select()
      .from(blog)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(blog.publishedAt), desc(blog.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getBySlug(input: GetBlogBySlugInput) {
    const [row] = await this.db.query.blog.findMany({
      where: eq(blog.slug, input.slug),
      with: {
        tags: { with: { tag: true } },
        category: true,
        author: {
          columns: { id: true, name: true, image: true, headline: true },
        },
        comments: {
          where: eq(blogComment.isApproved, true),
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

  async getById(input: GetBlogByIdInput) {
    const [row] = await this.db.query.blog.findMany({
      where: eq(blog.id, input.id),
      with: {
        tags: { with: { tag: true } },
        category: true,
        author: {
          columns: { id: true, name: true, image: true, headline: true },
        },
      },
      limit: 1,
    });
    if (!row) throw new Error("NOT_FOUND: Post not found");
    return row;
  }

  async getFeatured() {
    return this.db
      .select()
      .from(blog)
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
    const { tagIds, ...data } = input;
    const id = nanoid();

    const [created] = await this.db
      .insert(blog)
      .values({ id, authorId, ...data })
      .returning();

    if (tagIds.length) {
      await this.db
        .insert(blogTag)
        .values(tagIds.map((tagId) => ({ blogId: id, tagId })));
    }

    return created;
  }

  async update(input: UpdateBlogInput) {
    const { id, tagIds, ...data } = input;

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
}
