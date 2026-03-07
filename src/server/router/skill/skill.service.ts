import { asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";

import type {
  CreateSkillCategoryInput,
  UpdateSkillCategoryInput,
  ListSkillsInput,
  CreateSkillInput,
  UpdateSkillInput,
} from "./skill.input";
import { skill, skillCategory } from "@/db/schema/skill";

export class SkillService {
  constructor(private db: DB) {}

  async listCategories() {
    return this.db
      .select()
      .from(skillCategory)
      .orderBy(asc(skillCategory.sortOrder));
  }

  async createCategory(input: CreateSkillCategoryInput) {
    const [created] = await this.db
      .insert(skillCategory)
      .values({ id: nanoid(), ...input })
      .returning();
    return created;
  }

  async updateCategory(input: UpdateSkillCategoryInput) {
    const { id, ...data } = input;
    const [updated] = await this.db
      .update(skillCategory)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(skillCategory.id, id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Skill category not found");
    return updated;
  }

  async deleteCategory(id: string) {
    await this.db.delete(skillCategory).where(eq(skillCategory.id, id));
    return { success: true };
  }

  async list(input?: ListSkillsInput) {
    return this.db.query.skill.findMany({
      where: input?.categoryId
        ? eq(skill.categoryId, input.categoryId)
        : undefined,
      with: { category: true },
      orderBy: [asc(skill.sortOrder)],
    });
  }

  async grouped() {
    return this.db.query.skillCategory.findMany({
      with: {
        skills: {
          where: eq(skill.isVisible, true),
          orderBy: [asc(skill.sortOrder)],
        },
      },
      orderBy: [asc(skillCategory.sortOrder)],
    });
  }

  async create(input: CreateSkillInput) {
    const [created] = await this.db
      .insert(skill)
      .values({ id: nanoid(), ...input })
      .returning();
    return created;
  }

  async update(input: UpdateSkillInput) {
    const { id, ...data } = input;
    const [updated] = await this.db
      .update(skill)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(skill.id, id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Skill not found");
    return updated;
  }

  async delete(id: string) {
    await this.db.delete(skill).where(eq(skill.id, id));
    return { success: true };
  }
}
