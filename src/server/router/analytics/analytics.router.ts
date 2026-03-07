import { adminOnly, o } from "@/server/orpc";
import { trackPageViewInput } from "./analytics.input";
import { AnalyticsService } from "./analytics.service";

export const analyticsRouter = {
  trackPageView: o
    .input(trackPageViewInput)
    .handler(async ({ input, context }) => {
      const service = new AnalyticsService(context.db);
      return service.trackPageView(input);
    }),

  stats: adminOnly.handler(async ({ context }) => {
    const service = new AnalyticsService(context.db);
    return service.getStats();
  }),
};
