import { paginationSchema } from "@/server/schemas";
import { z } from "zod";

export const subscribeInput = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export const unsubscribeInput = z.object({
  email: z.string().email(),
});

export const listSubscribersInput = paginationSchema.extend({
  active: z.boolean().optional(),
});

export type SubscribeInput = z.infer<typeof subscribeInput>;
export type UnsubscribeInput = z.infer<typeof unsubscribeInput>;
export type ListSubscribersInput = z.infer<typeof listSubscribersInput>;
