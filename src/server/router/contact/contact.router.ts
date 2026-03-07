import { z } from "zod";
import {
  submitContactInput,
  listContactsInput,
  updateContactStatusInput,
} from "./contact.input";
import { ContactService } from "./contact.service";
import { adminOnly, o } from "@/server/orpc";

export const contactRouter = {
  submit: o.input(submitContactInput).handler(async ({ input, context }) => {
    const service = new ContactService(context.db);
    return service.submit(input);
  }),

  list: adminOnly
    .input(listContactsInput)
    .handler(async ({ input, context }) => {
      const service = new ContactService(context.db);
      return service.list(input);
    }),

  getById: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new ContactService(context.db);
      return service.getById(input.id);
    }),

  updateStatus: adminOnly
    .input(updateContactStatusInput)
    .handler(async ({ input, context }) => {
      const service = new ContactService(context.db);
      return service.updateStatus(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new ContactService(context.db);
      return service.delete(input.id);
    }),
};
