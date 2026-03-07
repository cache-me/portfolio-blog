import { RPCHandler } from "@orpc/server/fetch";
import type { NextRequest } from "next/server";
import { appRouter } from "./router";
import { db } from "./db";
import { auth } from "./auth";

const handler = new RPCHandler(appRouter);

async function createContext(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  return {
    db,
    user: session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          role:
            (session.user as { role?: string }).role === "ADMIN"
              ? ("ADMIN" as const)
              : ("USER" as const),
        }
      : null,
  };
}

async function handleRequest(req: NextRequest) {
  const { response } = await handler.handle(req, {
    prefix: "/api/rpc",
    context: await createContext(req),
  });
  return response ?? new Response("Not found", { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
