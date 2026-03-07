import { z } from "zod";
import {
  createSocialLinkInput,
  updateSocialLinkInput,
} from "./socialLink.input";
import { SocialLinkService } from "./socialLink.service";
import { adminOnly, o } from "@/server/orpc";

export const socialLinkRouter = {
  list: o.handler(async ({ context }) => {
    const service = new SocialLinkService(context.db);
    return service.list();
  }),

  listAll: adminOnly.handler(async ({ context }) => {
    const service = new SocialLinkService(context.db);
    return service.listAll();
  }),

  create: adminOnly
    .input(createSocialLinkInput)
    .handler(async ({ input, context }) => {
      const service = new SocialLinkService(context.db);
      return service.create(input);
    }),

  update: adminOnly
    .input(updateSocialLinkInput)
    .handler(async ({ input, context }) => {
      const service = new SocialLinkService(context.db);
      return service.update(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new SocialLinkService(context.db);
      return service.delete(input.id);
    }),
};
