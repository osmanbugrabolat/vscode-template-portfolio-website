import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/security/admin-session";
import { serverEnv } from "./env";
import { createServiceClient, createSessionClient } from "./supabase";
import { clientIpHash } from "./request";

export interface AdminContext {
  user: Pick<User, "id" | "email">;
  /** Client acting as the admin. All writes go through it so RLS double-checks them. */
  db: SupabaseClient;
}

/**
 * Full admin check, used by every admin page and server action:
 * 1. signed admin_session cookie (absolute + idle timeout)
 * 2. Supabase session verified against the auth server (getUser, not getSession)
 * 3. the same user, and is_admin() true in the database
 */
export const getAdmin = cache(async (): Promise<AdminContext | null> => {
  if (!serverEnv.isConfigured) return null;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifyAdminSession(serverEnv.appSecret, token);
  if (!session.valid) return null;

  const db = await createSessionClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user || data.user.id !== session.payload.uid) return null;

  const { data: isAdmin, error: rpcError } = await db.rpc("is_admin");
  if (rpcError || isAdmin !== true) return null;

  return { user: { id: data.user.id, email: data.user.email }, db };
});

/** For pages: redirect to the login screen when not an admin. */
export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin-login");
  return admin;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

/** For server actions: never trust that the caller came through an admin page. */
export async function requireAdminAction(): Promise<AdminContext> {
  const admin = await getAdmin();
  if (!admin) throw new UnauthorizedError();
  return admin;
}

export async function audit(
  admin: Pick<AdminContext, "user"> | null,
  action: string,
  entity: string,
  entityId: string | null,
  details: Record<string, unknown> = {},
) {
  const { error } = await createServiceClient()
    .from("admin_audit_log")
    .insert({
      actor_id: admin?.user.id ?? null,
      actor_email: admin?.user.email ?? null,
      action,
      entity,
      entity_id: entityId,
      ip_hash: await clientIpHash(),
      details,
    });
  if (error) console.error("[audit] write failed:", error.message);
}
