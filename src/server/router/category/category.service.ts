import { asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.input";
import type { DB } from "@/server/db";
import { category } from "@/db/schema/category";

export class CategoryService {
  constructor(private db: DB) {}

  async list() {
    return this.db.select().from(category).orderBy(asc(category.name));
  }

  async create(input: CreateCategoryInput) {
    const [created] = await this.db
      .insert(category)
      .values({ id: nanoid(), ...input })
      .returning();
    return created;
  }

  async update(input: UpdateCategoryInput) {
    const { id, ...data } = input;
    const [updated] = await this.db
      .update(category)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(category.id, id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Category not found");
    return updated;
  }

  async delete(id: string) {
    await this.db.delete(category).where(eq(category.id, id));
    return { success: true };
  }
}
