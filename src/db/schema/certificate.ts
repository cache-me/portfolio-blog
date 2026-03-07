import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { skill } from "./skill";

export const certificate = pgTable("certificate", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  issuer: text("issuer").notNull(),
  issuerLogo: text("issuer_logo"),
  credentialId: text("credential_id"),
  credentialUrl: text("credential_url"),
  image: text("image"),
  issuedAt: date("issued_at").notNull(),
  expiresAt: date("expires_at"),
  doesNotExpire: boolean("does_not_expire").default(false).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const certificateSkill = pgTable(
  "certificate_skill",
  {
    certificateId: text("certificate_id")
      .notNull()
      .references(() => certificate.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("certificateSkill_certificateId_idx").on(table.certificateId),
  ],
);

export const certificateRelations = relations(certificate, ({ many }) => ({
  skills: many(certificateSkill),
}));

export const certificateSkillRelations = relations(
  certificateSkill,
  ({ one }) => ({
    certificate: one(certificate, {
      fields: [certificateSkill.certificateId],
      references: [certificate.id],
    }),
    skill: one(skill, {
      fields: [certificateSkill.skillId],
      references: [skill.id],
    }),
  }),
);
