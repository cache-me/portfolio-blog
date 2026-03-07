import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import type {
  SubscribeInput,
  UnsubscribeInput,
  ListSubscribersInput,
} from "./newsletter.input";
import { newsletterSubscriber } from "@/db/schema/newsletter";
import { paginationOffset } from "@/server/schemas";

export class NewsletterService {
  constructor(private db: DB) {}

  async subscribe(input: SubscribeInput) {
    const existing = await this.db
      .select()
      .from(newsletterSubscriber)
      .where(eq(newsletterSubscriber.email, input.email))
      .limit(1);

    if (existing[0]) {
      if (existing[0].isActive)
        return { success: true, alreadySubscribed: true };
      await this.db
        .update(newsletterSubscriber)
        .set({
          isActive: true,
          unsubscribedAt: null,
          name: input.name ?? existing[0].name,
        })
        .where(eq(newsletterSubscriber.email, input.email));
      return { success: true, reactivated: true };
    }

    await this.db
      .insert(newsletterSubscriber)
      .values({ id: nanoid(), ...input, isActive: true });

    return { success: true };
  }

  async unsubscribe(input: UnsubscribeInput) {
    await this.db
      .update(newsletterSubscriber)
      .set({ isActive: false, unsubscribedAt: new Date() })
      .where(eq(newsletterSubscriber.email, input.email));
    return { success: true };
  }

  async listSubscribers(input: ListSubscribersInput) {
    const { limit, offset } = paginationOffset(input);
    return this.db
      .select()
      .from(newsletterSubscriber)
      .where(
        input.active !== undefined
          ? eq(newsletterSubscriber.isActive, input.active)
          : undefined,
      )
      .orderBy(desc(newsletterSubscriber.subscribedAt))
      .limit(limit)
      .offset(offset);
  }
}
