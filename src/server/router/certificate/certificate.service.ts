import { asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import type {
  CreateCertificateInput,
  UpdateCertificateInput,
} from "./certificate.input";
import { certificate, certificateSkill } from "@/db/schema/certificate";

export class CertificateService {
  constructor(private db: DB) {}

  async list() {
    return this.db.query.certificate.findMany({
      where: eq(certificate.isVisible, true),
      with: { skills: { with: { skill: true } } },
      orderBy: [asc(certificate.sortOrder)],
    });
  }

  async listAll() {
    return this.db.query.certificate.findMany({
      with: { skills: { with: { skill: true } } },
      orderBy: [asc(certificate.sortOrder)],
    });
  }

  async create(input: CreateCertificateInput) {
    const { skillIds, ...data } = input;
    const id = nanoid();

    const [created] = await this.db
      .insert(certificate)
      .values({ id, ...data })
      .returning();

    if (skillIds.length) {
      await this.db
        .insert(certificateSkill)
        .values(skillIds.map((skillId) => ({ certificateId: id, skillId })));
    }

    return created;
  }

  async update(input: UpdateCertificateInput) {
    const { id, skillIds, ...data } = input;

    const [updated] = await this.db
      .update(certificate)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(certificate.id, id))
      .returning();

    if (!updated) throw new Error("NOT_FOUND: Certificate not found");

    await this.db
      .delete(certificateSkill)
      .where(eq(certificateSkill.certificateId, id));
    if (skillIds.length) {
      await this.db
        .insert(certificateSkill)
        .values(skillIds.map((skillId) => ({ certificateId: id, skillId })));
    }

    return updated;
  }

  async delete(id: string) {
    await this.db.delete(certificate).where(eq(certificate.id, id));
    return { success: true };
  }
}
