import { eq } from "drizzle-orm";
import type { DB } from "@/server/db";
import type { UpdateProfileInput, AdminUpdateUserInput } from "./auth.input";
import { auth } from "@/server/auth";
import { session, user } from "@/db/schema/auth";

export class AuthService {
  constructor(private db: DB) {}

  async getSession(headers: Headers) {
    return auth.api.getSession({ headers });
  }

  async listSessions(userId: string) {
    return this.db.select().from(session).where(eq(session.userId, userId));
  }

  async revokeSession(sessionId: string, requestingUserId: string) {
    const [row] = await this.db
      .select()
      .from(session)
      .where(eq(session.id, sessionId))
      .limit(1);

    if (!row) throw new Error("NOT_FOUND: Session not found");
    if (row.userId !== requestingUserId) throw new Error("FORBIDDEN");

    await auth.api.revokeSession({
      body: { token: row.token },
      headers: new Headers(),
    });
    return { success: true };
  }

  async getMe(userId: string) {
    const [row] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!row) throw new Error("NOT_FOUND: User not found");
    return row;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const [updated] = await this.db
      .update(user)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: User not found");
    return updated;
  }

  async listUsers() {
    return this.db.select().from(user);
  }

  async getUserById(id: string) {
    const [row] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);
    if (!row) throw new Error("NOT_FOUND: User not found");
    return row;
  }

  async adminUpdateUser(input: AdminUpdateUserInput) {
    const { userId, ...data } = input;
    const [updated] = await this.db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning();
    if (!updated) throw new Error("NOT_FOUND: User not found");
    return updated;
  }

  async deleteUser(userId: string) {
    await this.db.delete(user).where(eq(user.id, userId));
    return { success: true };
  }
}
