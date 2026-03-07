import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import type {
  CreateEducationInput,
  UpdateEducationInput,
} from "./education.input";
import { education } from "@/db/schema/education";

export class EducationService {
  constructor(private db: DB) {}

  async list() {
    return this.db
      .select()
      .from(education)
      .where(eq(education.isVisible, true))
      .orderBy(desc(education.sortOrder), desc(education.startDate));
  }

  async listAll() {
    return this.db.select().from(education).orderBy(desc(education.sortOrder));
  }

  async getById(id: string) {
    const [row] = await this.db
      .select()
      .from(education)
      .where(eq(education.id, id))
      .limit(1);
    if (!row) throw new Error("NOT_FOUND: Education not found");
    return row;
  }

  async create(input: CreateEducationInput) {
    const [created] = await this.db
      .insert(education)
      .values({ id: nanoid(), ...input })
      .returning();
    return created;
  }

  async update(input: UpdateEducationInput) {
    const { id, ...data } = input;
    const [updated] = await this.db
      .update(education)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(education.id, id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Education not found");
    return updated;
  }

  async delete(id: string) {
    await this.db.delete(education).where(eq(education.id, id));
    return { success: true };
  }
}
