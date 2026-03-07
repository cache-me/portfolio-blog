import { adminOnly, o } from "@/server/orpc";
import { upsertProfileInput } from "./profile.input";
import { ProfileService } from "./profile.service";

export const profileRouter = {
  get: o.handler(async ({ context }) => {
    const service = new ProfileService(context.db);
    return service.get();
  }),

  upsert: adminOnly
    .input(upsertProfileInput)
    .handler(async ({ input, context }) => {
      const service = new ProfileService(context.db);
      return service.upsert(input);
    }),
};
