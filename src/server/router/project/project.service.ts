import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import type {
  ListProjectsInput,
  GetProjectBySlugInput,
  GetProjectByIdInput,
  CreateProjectInput,
  UpdateProjectInput,
} from "./project.input";
import { paginationOffset } from "@/server/schemas";
import { project, projectSkill, projectTag } from "@/db/schema/project";

export class ProjectService {
  constructor(private db: DB) {}

  async list(input: ListProjectsInput) {
    const { limit, offset } = paginationOffset(input);

    const conditions = [
      input.status ? eq(project.status, input.status) : undefined,
      input.featured !== undefined
        ? eq(project.isFeatured, input.featured)
        : undefined,
      input.categoryId ? eq(project.categoryId, input.categoryId) : undefined,
      input.search ? ilike(project.title, `%${input.search}%`) : undefined,
    ].filter(Boolean) as ReturnType<typeof eq>[];

    return this.db
      .select()
      .from(project)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(project.sortOrder), desc(project.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getBySlug(input: GetProjectBySlugInput) {
    const [row] = await this.db.query.project.findMany({
      where: eq(project.slug, input.slug),
      with: {
        tags: { with: { tag: true } },
        skills: { with: { skill: true } },
        category: true,
      },
      limit: 1,
    });
    if (!row) throw new Error("NOT_FOUND: Project not found");
    return row;
  }

  async getById(input: GetProjectByIdInput) {
    const [row] = await this.db.query.project.findMany({
      where: eq(project.id, input.id),
      with: {
        tags: { with: { tag: true } },
        skills: { with: { skill: true } },
        category: true,
      },
      limit: 1,
    });
    if (!row) throw new Error("NOT_FOUND: Project not found");
    return row;
  }

  async getFeatured() {
    return this.db
      .select()
      .from(project)
      .where(and(eq(project.isFeatured, true), eq(project.status, "PUBLISHED")))
      .orderBy(desc(project.sortOrder))
      .limit(6);
  }

  async incrementView(id: string) {
    await this.db
      .update(project)
      .set({ viewCount: sql`view_count + 1` })
      .where(eq(project.id, id));
    return { success: true };
  }

  async create(input: CreateProjectInput) {
    const { tagIds, skillIds, ...data } = input;
    const id = nanoid();

    const [created] = await this.db
      .insert(project)
      .values({ id, ...data })
      .returning();

    if (tagIds.length) {
      await this.db
        .insert(projectTag)
        .values(tagIds.map((tagId) => ({ projectId: id, tagId })));
    }
    if (skillIds.length) {
      await this.db
        .insert(projectSkill)
        .values(skillIds.map((skillId) => ({ projectId: id, skillId })));
    }

    return created;
  }

  async update(input: UpdateProjectInput) {
    const { id, tagIds, skillIds, ...data } = input;

    const [updated] = await this.db
      .update(project)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(project.id, id))
      .returning();

    if (!updated) throw new Error("NOT_FOUND: Project not found");

    await this.db.delete(projectTag).where(eq(projectTag.projectId, id));
    if (tagIds.length) {
      await this.db
        .insert(projectTag)
        .values(tagIds.map((tagId) => ({ projectId: id, tagId })));
    }

    await this.db.delete(projectSkill).where(eq(projectSkill.projectId, id));
    if (skillIds.length) {
      await this.db
        .insert(projectSkill)
        .values(skillIds.map((skillId) => ({ projectId: id, skillId })));
    }

    return updated;
  }

  async delete(id: string) {
    await this.db.delete(project).where(eq(project.id, id));
    return { success: true };
  }

  async publish(id: string) {
    const [updated] = await this.db
      .update(project)
      .set({
        status: "PUBLISHED",
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(project.id, id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Project not found");
    return updated;
  }
}
