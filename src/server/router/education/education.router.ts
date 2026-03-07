import { z } from "zod";
import { createEducationInput, updateEducationInput } from "./education.input";
import { EducationService } from "./education.service";
import { adminOnly, o } from "@/server/orpc";

export const educationRouter = {
  list: o.handler(async ({ context }) => {
    const service = new EducationService(context.db);
    return service.list();
  }),

  listAll: adminOnly.handler(async ({ context }) => {
    const service = new EducationService(context.db);
    return service.listAll();
  }),

  getById: o
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new EducationService(context.db);
      return service.getById(input.id);
    }),

  create: adminOnly
    .input(createEducationInput)
    .handler(async ({ input, context }) => {
      const service = new EducationService(context.db);
      return service.create(input);
    }),

  update: adminOnly
    .input(updateEducationInput)
    .handler(async ({ input, context }) => {
      const service = new EducationService(context.db);
      return service.update(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new EducationService(context.db);
      return service.delete(input.id);
    }),
};
