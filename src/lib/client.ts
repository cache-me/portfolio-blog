import { AppRouter } from "@/server/router";
import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { RouterClient } from "@orpc/server";

const link = new RPCLink({
  url: `http://localhost:3000/api/rpc`,
  headers: () => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const orpcClient = createORPCClient<RouterClient<AppRouter>>(link); // ← wrap with RouterClient<>

export const orpc = createTanstackQueryUtils(orpcClient);
