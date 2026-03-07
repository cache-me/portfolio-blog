import { adminOnly, o } from "@/server/orpc";
import {
  subscribeInput,
  unsubscribeInput,
  listSubscribersInput,
} from "./newsletter.input";
import { NewsletterService } from "./newsletter.service";

export const newsletterRouter = {
  subscribe: o.input(subscribeInput).handler(async ({ input, context }) => {
    const service = new NewsletterService(context.db);
    return service.subscribe(input);
  }),

  unsubscribe: o.input(unsubscribeInput).handler(async ({ input, context }) => {
    const service = new NewsletterService(context.db);
    return service.unsubscribe(input);
  }),

  listSubscribers: adminOnly
    .input(listSubscribersInput)
    .handler(async ({ input, context }) => {
      const service = new NewsletterService(context.db);
      return service.listSubscribers(input);
    }),
};
