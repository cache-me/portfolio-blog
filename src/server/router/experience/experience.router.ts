import { z } from "zod";
import {
  createExperienceInput,
  updateExperienceInput,
} from "./experience.input";
import { ExperienceService } from "./experience.service";
import { adminOnly, o } from "@/server/orpc";

export const experienceRouter = {
  list: o.handler(async ({ context }) => {
    const service = new ExperienceService(context.db);
    return service.list();
  }),

  listAll: adminOnly.handler(async ({ context }) => {
    const service = new ExperienceService(context.db);
    return service.listAll();
  }),

  getById: o
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new ExperienceService(context.db);
      return service.getById(input.id);
    }),

  create: adminOnly
    .input(createExperienceInput)
    .handler(async ({ input, context }) => {
      const service = new ExperienceService(context.db);
      return service.create(input);
    }),

  update: adminOnly
    .input(updateExperienceInput)
    .handler(async ({ input, context }) => {
      const service = new ExperienceService(context.db);
      return service.update(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new ExperienceService(context.db);
      return service.delete(input.id);
    }),
};
