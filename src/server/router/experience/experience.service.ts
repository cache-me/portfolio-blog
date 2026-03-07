import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import type {
  CreateExperienceInput,
  UpdateExperienceInput,
} from "./experience.input";
import { experience } from "@/db/schema/schema";

export class ExperienceService {
  constructor(private db: DB) {}

  async list() {
    return this.db
      .select()
      .from(experience)
      .where(eq(experience.isVisible, true))
      .orderBy(desc(experience.sortOrder), desc(experience.startDate));
  }

  async listAll() {
    return this.db
      .select()
      .from(experience)
      .orderBy(desc(experience.sortOrder));
  }

  async getById(id: string) {
    const [row] = await this.db
      .select()
      .from(experience)
      .where(eq(experience.id, id))
      .limit(1);
    if (!row) throw new Error("NOT_FOUND: Experience not found");
    return row;
  }

  async create(input: CreateExperienceInput) {
    const [created] = await this.db
      .insert(experience)
      .values({ id: nanoid(), ...input })
      .returning();
    return created;
  }

  async update(input: UpdateExperienceInput) {
    const { id, ...data } = input;
    const [updated] = await this.db
      .update(experience)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(experience.id, id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Experience not found");
    return updated;
  }

  async delete(id: string) {
    await this.db.delete(experience).where(eq(experience.id, id));
    return { success: true };
  }
}
