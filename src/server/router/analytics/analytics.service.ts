import { nanoid } from "nanoid";

import type { TrackPageViewInput } from "./analytics.input";
import { pageView } from "@/db/schema/analytics";
import { DB } from "@/server/db";

export class AnalyticsService {
  constructor(private db: DB) {}

  async trackPageView(input: TrackPageViewInput) {
    await this.db.insert(pageView).values({ id: nanoid(), ...input });
    return { success: true };
  }

  async getStats() {
    const views = await this.db.select({ path: pageView.path }).from(pageView);

    const total = views.length;

    const byPath = views.reduce<Record<string, number>>((acc, v) => {
      acc[v.path] = (acc[v.path] ?? 0) + 1;
      return acc;
    }, {});

    const topPages = Object.entries(byPath)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    return { total, topPages };
  }
}
