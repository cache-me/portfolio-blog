import { asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import type {
  CreateTestimonialInput,
  UpdateTestimonialInput,
  UpdateTestimonialStatusInput,
} from "./testimonial.input";
import { testimonial } from "@/db/schema/testimonial";

export class TestimonialService {
  constructor(private db: DB) {}

  async list() {
    return this.db
      .select()
      .from(testimonial)
      .where(eq(testimonial.status, "APPROVED"))
      .orderBy(asc(testimonial.sortOrder));
  }

  async featured() {
    return this.db
      .select()
      .from(testimonial)
      .where(eq(testimonial.status, "APPROVED"))
      .orderBy(asc(testimonial.sortOrder))
      .limit(6);
  }

  async listAll() {
    return this.db
      .select()
      .from(testimonial)
      .orderBy(asc(testimonial.sortOrder));
  }

  async create(input: CreateTestimonialInput) {
    const [created] = await this.db
      .insert(testimonial)
      .values({ id: nanoid(), ...input, status: "APPROVED" })
      .returning();
    return created;
  }

  async update(input: UpdateTestimonialInput) {
    const { id, ...data } = input;
    const [updated] = await this.db
      .update(testimonial)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(testimonial.id, id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Testimonial not found");
    return updated;
  }

  async updateStatus(input: UpdateTestimonialStatusInput) {
    const [updated] = await this.db
      .update(testimonial)
      .set({ status: input.status, updatedAt: new Date() })
      .where(eq(testimonial.id, input.id))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: Testimonial not found");
    return updated;
  }

  async delete(id: string) {
    await this.db.delete(testimonial).where(eq(testimonial.id, id));
    return { success: true };
  }
}
