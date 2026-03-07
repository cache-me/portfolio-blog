import { z } from "zod";
import { createCategoryInput, updateCategoryInput } from "./category.input";
import { CategoryService } from "./category.service";
import { adminOnly, o } from "@/server/orpc";

export const categoryRouter = {
  list: o.handler(async ({ context }) => {
    const service = new CategoryService(context.db);
    return service.list();
  }),

  create: adminOnly
    .input(createCategoryInput)
    .handler(async ({ input, context }) => {
      const service = new CategoryService(context.db);
      return service.create(input);
    }),

  update: adminOnly
    .input(updateCategoryInput)
    .handler(async ({ input, context }) => {
      const service = new CategoryService(context.db);
      return service.update(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new CategoryService(context.db);
      return service.delete(input.id);
    }),
};
