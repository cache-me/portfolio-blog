import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { UpsertProfileInput } from "./profile.input";
import { profile } from "@/db/schema/profile";
import type { DB } from "@/server/db";

export class ProfileService {
  constructor(private db: DB) {}

  async get() {
    const [row] = await this.db.select().from(profile).limit(1);
    return row ?? null;
  }

  async upsert(input: UpsertProfileInput) {
    const [existing] = await this.db
      .select({ id: profile.id })
      .from(profile)
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(profile)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(profile.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(profile)
      .values({ id: nanoid(), ...input })
      .returning();
    return created;
  }
}
