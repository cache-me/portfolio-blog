import { asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import type {
  CreateSocialLinkInput,
  UpdateSocialLinkInput,
} from "./socialLink.input";
import { socialLink } from "@/db/schema/social-link";

export class SocialLinkService {
  constructor(private db: DB) {}

  async list() {
    return this.db
      .select()
      .from(socialLink)
      .where(eq(socialLink.isVisible, true))
      .orderBy(asc(socialLink.sortOrder));
  }

  async listAll() {
    return this.db.select().from(socialLink).orderBy(asc(socialLink.sortOrder));
  }

  async create(input: CreateSocialLinkInput) {
    const [created] = await this.db
      .insert(socialLink)
      .values({ id: nanoid(), ...input })
      .returning();
    return created;
  }

  async update(input: UpdateSocialLinkInput) {
    const { id, ...data } = input;
    const [updated] = await this.db
      .update(socialLink)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(socialLink.id, id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Social link not found");
    return updated;
  }

  async delete(id: string) {
    await this.db.delete(socialLink).where(eq(socialLink.id, id));
    return { success: true };
  }
}
