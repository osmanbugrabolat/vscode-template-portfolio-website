"use server";

import * as z from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, adminSessionCookieOptions, encodeAdminSession } from "@/lib/security/admin-session";
import { audit } from "@/lib/server/auth";
import { hmac } from "@/lib/server/crypto";
import { serverEnv } from "@/lib/server/env";
import { isLoginThrottled, recordLoginAttempt } from "@/lib/server/login-throttle";
import { clientIpHash } from "@/lib/server/request";
import { createSessionClient } from "@/lib/server/supabase";

export interface LoginState {
  error?: string;
  email?: string;
}

const GENERIC_ERROR = "E-posta veya şifre hatalı.";
const THROTTLED_ERROR = "Çok fazla başarısız deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.";
/** Every response takes at least this long, so timing does not reveal which step failed. */
const MIN_RESPONSE_MS = 900;

const LoginSchema = z.object({
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(1).max(128),
});

async function settle(started: number) {
  const remaining = MIN_RESPONSE_MS - (Date.now() - started);
  if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const started = Date.now();
  const rawEmail = typeof formData.get("email") === "string" ? String(formData.get("email")).slice(0, 254) : "";
  const parsed = LoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    await settle(started);
    return { error: GENERIC_ERROR, email: rawEmail };
  }
  if (!serverEnv.isConfigured) {
    await settle(started);
    return { error: "Sunucu yapılandırması eksik.", email: rawEmail };
  }

  const { email, password } = parsed.data;
  const emailHash = hmac("login-email", email);
  const ipHash = await clientIpHash();
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);

  if (await isLoginThrottled(emailHash, ipHash)) {
    await audit(null, "login_throttled", "auth", null, { email_hash: emailHash });
    await settle(started);
    return { error: THROTTLED_ERROR, email };
  }

  const db = await createSessionClient();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    await recordLoginAttempt(emailHash, ipHash, false);
    await settle(started);
    return { error: GENERIC_ERROR, email };
  }

  const { data: isAdmin, error: rpcError } = await db.rpc("is_admin");
  if (rpcError || isAdmin !== true) {
    await db.auth.signOut({ scope: "local" });
    await recordLoginAttempt(emailHash, ipHash, false);
    await audit({ user: { id: data.user.id, email: data.user.email } }, "login_denied_not_admin", "auth", data.user.id);
    await settle(started);
    return { error: GENERIC_ERROR, email };
  }

  await recordLoginAttempt(emailHash, ipHash, true);
  const now = Date.now();
  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    encodeAdminSession(serverEnv.appSecret, { uid: data.user.id, iat: now, lat: now }),
    adminSessionCookieOptions(serverEnv.isProduction),
  );
  await audit({ user: { id: data.user.id, email: data.user.email } }, "login", "auth", data.user.id);
  await settle(started);
  redirect("/admin");
}
