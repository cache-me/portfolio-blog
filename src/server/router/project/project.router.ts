import { z } from "zod";
import {
  listProjectsInput,
  getProjectBySlugInput,
  getProjectByIdInput,
  createProjectInput,
  updateProjectInput,
} from "./project.input";
import { ProjectService } from "./project.service";
import { adminOnly, o } from "@/server/orpc";

export const projectRouter = {
  list: o.input(listProjectsInput).handler(async ({ input, context }) => {
    const service = new ProjectService(context.db);
    return service.list(input);
  }),

  getBySlug: o
    .input(getProjectBySlugInput)
    .handler(async ({ input, context }) => {
      const service = new ProjectService(context.db);
      return service.getBySlug(input);
    }),

  getById: o.input(getProjectByIdInput).handler(async ({ input, context }) => {
    const service = new ProjectService(context.db);
    return service.getById(input);
  }),

  getFeatured: o.handler(async ({ context }) => {
    const service = new ProjectService(context.db);
    return service.getFeatured();
  }),

  incrementView: o
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new ProjectService(context.db);
      return service.incrementView(input.id);
    }),

  create: adminOnly
    .input(createProjectInput)
    .handler(async ({ input, context }) => {
      const service = new ProjectService(context.db);
      return service.create(input);
    }),

  update: adminOnly
    .input(updateProjectInput)
    .handler(async ({ input, context }) => {
      const service = new ProjectService(context.db);
      return service.update(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new ProjectService(context.db);
      return service.delete(input.id);
    }),

  publish: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new ProjectService(context.db);
      return service.publish(input.id);
    }),
};
