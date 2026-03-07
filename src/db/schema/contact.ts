import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { contactStatus } from "./enums";

export const contact = pgTable(
  "contact",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    phone: text("phone"),
    company: text("company"),
    status: contactStatus("status").default("UNREAD").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("contact_status_idx").on(table.status),
    index("contact_email_idx").on(table.email),
  ],
);
