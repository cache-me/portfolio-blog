import { os } from "@orpc/server";
import type { Context } from "./context";

// Base oRPC instance typed to our context
export const o = os.$context<Context>();

// ─── Auth Middleware ──────────────────────────────────────────────────────────
// Protects any procedure that requires a logged-in user
export const authed = o.use(({ context, next }) => {
  if (!context.user) {
    throw new Error("UNAUTHORIZED: You must be logged in.");
  }
  return next({ context: { ...context, user: context.user } });
});

// ─── Admin Middleware ─────────────────────────────────────────────────────────
// Restricts a procedure to ADMIN role only
export const adminOnly = authed.use(({ context, next }) => {
  if (context.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN: Admin access required.");
  }
  return next({ context });
});
