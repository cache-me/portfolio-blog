import { z } from "zod";
import {
  requestUploadInput,
  confirmUploadInput,
  failUploadInput,
  deleteUploadInput,
  listUploadsInput,
} from "./file.input";
import { UploadService } from "./file.service";
import { adminOnly, authed } from "@/server/orpc";

export const uploadRouter = {
  requestPresignedUrl: authed
    .input(requestUploadInput)
    .handler(async ({ input, context }) => {
      const service = new UploadService(context.db);
      return service.requestPresignedUrl(input, context.user!.id);
    }),

  confirm: authed
    .input(confirmUploadInput)
    .handler(async ({ input, context }) => {
      const service = new UploadService(context.db);
      return service.confirmUpload(input, context.user!.id);
    }),

  fail: authed.input(failUploadInput).handler(async ({ input, context }) => {
    const service = new UploadService(context.db);
    return service.failUpload(input.id, context.user!.id);
  }),

  delete: authed
    .input(deleteUploadInput)
    .handler(async ({ input, context }) => {
      const service = new UploadService(context.db);
      const isAdmin = context.user?.role === "ADMIN";
      return service.deleteUpload(input, context.user!.id, isAdmin);
    }),

  getById: authed
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      const service = new UploadService(context.db);
      return service.getById(input.id);
    }),

  list: authed.input(listUploadsInput).handler(async ({ input, context }) => {
    const service = new UploadService(context.db);
    const isAdmin = context.user?.role === "ADMIN";
    return service.list(input, context.user!.id, isAdmin);
  }),

  adminList: adminOnly
    .input(listUploadsInput)
    .handler(async ({ input, context }) => {
      const service = new UploadService(context.db);
      return service.list(input, context.user!.id, true);
    }),
};
