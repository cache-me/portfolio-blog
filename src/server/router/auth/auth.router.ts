import { z } from "zod";
import { updateProfileInput, adminUpdateUserInput } from "./auth.input";
import { AuthService } from "./auth.service";
import { adminOnly, authed } from "@/server/orpc";

export const authRouter = {
  me: authed.handler(async ({ context }) => {
    const service = new AuthService(context.db);
    return service.getMe(context.user!.id);
  }),

  updateProfile: authed
    .input(updateProfileInput)
    .handler(async ({ input, context }) => {
      const service = new AuthService(context.db);
      return service.updateProfile(context.user!.id, input);
    }),

  listSessions: authed.handler(async ({ context }) => {
    const service = new AuthService(context.db);
    return service.listSessions(context.user!.id);
  }),

  revokeSession: authed
    .input(z.object({ sessionId: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new AuthService(context.db);
      return service.revokeSession(input.sessionId, context.user!.id);
    }),

  listUsers: adminOnly.handler(async ({ context }) => {
    const service = new AuthService(context.db);
    return service.listUsers();
  }),

  getUserById: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new AuthService(context.db);
      return service.getUserById(input.id);
    }),

  adminUpdateUser: adminOnly
    .input(adminUpdateUserInput)
    .handler(async ({ input, context }) => {
      const service = new AuthService(context.db);
      return service.adminUpdateUser(input);
    }),

  deleteUser: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new AuthService(context.db);
      return service.deleteUser(input.id);
    }),
};
