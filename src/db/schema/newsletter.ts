import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const newsletterSubscriber = pgTable(
  "newsletter_subscriber",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    isActive: boolean("is_active").default(true).notNull(),
    subscribedAt: timestamp("subscribed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (table) => [index("newsletter_email_idx").on(table.email)],
);
