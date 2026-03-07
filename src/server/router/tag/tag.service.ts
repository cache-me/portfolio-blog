import { asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import type { CreateTagInput } from "./tag.input";
import { tag } from "@/db/schema/schema";

export class TagService {
  constructor(private db: DB) {}

  async list() {
    return this.db.select().from(tag).orderBy(asc(tag.name));
  }

  async create(input: CreateTagInput) {
    const [created] = await this.db
      .insert(tag)
      .values({ id: nanoid(), ...input })
      .returning();
    return created;
  }

  async delete(id: string) {
    await this.db.delete(tag).where(eq(tag.id, id));
    return { success: true };
  }
}
