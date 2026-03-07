import { z } from "zod";
import { createTagInput } from "./tag.input";
import { TagService } from "./tag.service";
import { adminOnly, o } from "@/server/orpc";

export const tagRouter = {
  list: o.handler(async ({ context }) => {
    const service = new TagService(context.db);
    return service.list();
  }),

  create: adminOnly
    .input(createTagInput)
    .handler(async ({ input, context }) => {
      const service = new TagService(context.db);
      return service.create(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new TagService(context.db);
      return service.delete(input.id);
    }),
};
