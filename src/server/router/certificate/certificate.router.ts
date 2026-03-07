import { z } from "zod";
import {
  createCertificateInput,
  updateCertificateInput,
} from "./certificate.input";
import { CertificateService } from "./certificate.service";
import { adminOnly, o } from "@/server/orpc";

export const certificateRouter = {
  list: o.handler(async ({ context }) => {
    const service = new CertificateService(context.db);
    return service.list();
  }),

  listAll: adminOnly.handler(async ({ context }) => {
    const service = new CertificateService(context.db);
    return service.listAll();
  }),

  create: adminOnly
    .input(createCertificateInput)
    .handler(async ({ input, context }) => {
      const service = new CertificateService(context.db);
      return service.create(input);
    }),

  update: adminOnly
    .input(updateCertificateInput)
    .handler(async ({ input, context }) => {
      const service = new CertificateService(context.db);
      return service.update(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new CertificateService(context.db);
      return service.delete(input.id);
    }),
};
