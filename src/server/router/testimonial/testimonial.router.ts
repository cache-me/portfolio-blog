import { z } from "zod";
import {
  createTestimonialInput,
  updateTestimonialInput,
  updateTestimonialStatusInput,
} from "./testimonial.input";
import { TestimonialService } from "./testimonial.service";
import { adminOnly, o } from "@/server/orpc";

export const testimonialRouter = {
  list: o.handler(async ({ context }) => {
    const service = new TestimonialService(context.db);
    return service.list();
  }),

  featured: o.handler(async ({ context }) => {
    const service = new TestimonialService(context.db);
    return service.featured();
  }),

  listAll: adminOnly.handler(async ({ context }) => {
    const service = new TestimonialService(context.db);
    return service.listAll();
  }),

  create: adminOnly
    .input(createTestimonialInput)
    .handler(async ({ input, context }) => {
      const service = new TestimonialService(context.db);
      return service.create(input);
    }),

  update: adminOnly
    .input(updateTestimonialInput)
    .handler(async ({ input, context }) => {
      const service = new TestimonialService(context.db);
      return service.update(input);
    }),

  updateStatus: adminOnly
    .input(updateTestimonialStatusInput)
    .handler(async ({ input, context }) => {
      const service = new TestimonialService(context.db);
      return service.updateStatus(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new TestimonialService(context.db);
      return service.delete(input.id);
    }),
};
