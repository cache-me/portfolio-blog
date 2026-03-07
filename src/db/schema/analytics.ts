import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const pageView = pgTable(
  "page_view",
  {
    id: text("id").primaryKey(),
    path: text("path").notNull(),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    country: text("country"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("pageView_path_idx").on(table.path)],
);
