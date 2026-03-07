import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import type {
  SubmitContactInput,
  ListContactsInput,
  UpdateContactStatusInput,
} from "./contact.input";
import { contact } from "@/db/schema/contact";
import { paginationOffset } from "@/server/schemas";

export class ContactService {
  constructor(private db: DB) {}

  async submit(input: SubmitContactInput) {
    const [created] = await this.db
      .insert(contact)
      .values({ id: nanoid(), ...input, status: "UNREAD" })
      .returning({ id: contact.id });
    return { success: true, id: created.id };
  }

  async list(input: ListContactsInput) {
    const { limit, offset } = paginationOffset(input);
    return this.db
      .select()
      .from(contact)
      .where(input.status ? eq(contact.status, input.status) : undefined)
      .orderBy(desc(contact.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getById(id: string) {
    const [row] = await this.db
      .select()
      .from(contact)
      .where(eq(contact.id, id))
      .limit(1);
    if (!row) throw new Error("NOT_FOUND: Contact not found");
    return row;
  }

  async updateStatus(input: UpdateContactStatusInput) {
    const [updated] = await this.db
      .update(contact)
      .set({
        status: input.status,
        updatedAt: new Date(),
        repliedAt: input.status === "REPLIED" ? new Date() : undefined,
      })
      .where(eq(contact.id, input.id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Contact not found");
    return updated;
  }

  async delete(id: string) {
    await this.db.delete(contact).where(eq(contact.id, id));
    return { success: true };
  }
}
