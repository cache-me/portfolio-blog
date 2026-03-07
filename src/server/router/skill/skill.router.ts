import { z } from "zod";
import {
  listSkillsInput,
  createSkillInput,
  updateSkillInput,
  createSkillCategoryInput,
  updateSkillCategoryInput,
} from "./skill.input";
import { SkillService } from "./skill.service";
import { adminOnly, o } from "@/server/orpc";

export const skillRouter = {
  listCategories: o.handler(async ({ context }) => {
    const service = new SkillService(context.db);
    return service.listCategories();
  }),

  createCategory: adminOnly
    .input(createSkillCategoryInput)
    .handler(async ({ input, context }) => {
      const service = new SkillService(context.db);
      return service.createCategory(input);
    }),

  updateCategory: adminOnly
    .input(updateSkillCategoryInput)
    .handler(async ({ input, context }) => {
      const service = new SkillService(context.db);
      return service.updateCategory(input);
    }),

  deleteCategory: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new SkillService(context.db);
      return service.deleteCategory(input.id);
    }),

  list: o
    .input(listSkillsInput.optional())
    .handler(async ({ input, context }) => {
      const service = new SkillService(context.db);
      return service.list(input);
    }),

  grouped: o.handler(async ({ context }) => {
    const service = new SkillService(context.db);
    return service.grouped();
  }),

  create: adminOnly
    .input(createSkillInput)
    .handler(async ({ input, context }) => {
      const service = new SkillService(context.db);
      return service.create(input);
    }),

  update: adminOnly
    .input(updateSkillInput)
    .handler(async ({ input, context }) => {
      const service = new SkillService(context.db);
      return service.update(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new SkillService(context.db);
      return service.delete(input.id);
    }),
};
