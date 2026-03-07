import type { db as DB } from "./db";

export type Context = {
  db: typeof DB;
  user: {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
  } | null;
};
