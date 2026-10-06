"use server";

import { PasswordSchema } from "@/lib/admin-schemas";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { adminAction, ActionError, type ActionResult } from "@/lib/server/admin-action";
import { audit, getAdmin } from "@/lib/server/auth";
import { serverEnv } from "@/lib/server/env";
import { ADMIN_SESSION_COOKIE } from "@/lib/security/admin-session";
import { hmac } from "@/lib/server/crypto";
import { isLoginThrottled, recordLoginAttempt } from "@/lib/server/login-throttle";
import { clientIpHash } from "@/lib/server/request";

const changePasswordImpl = adminAction({
  schema: PasswordSchema,
  audit: { action: "change_password", entity: "auth" },
  run: async ({ current_password, new_password }, { db, user }) => {
    if (!user.email) throw new ActionError("Hesap e-postası bulunamadı.");
    // Guessing the current password here is throttled exactly like the login form.
    const emailHash = hmac("login-email", user.email.toLowerCase());
    const ipHash = await clientIpHash();
    if (await isLoginThrottled(emailHash, ipHash)) {
      throw new ActionError("Çok fazla hatalı deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.");
    }
    // Re-authenticate on a throwaway client so the current session cookies stay untouched.
    const verifier = createClient(serverEnv.supabaseUrl, serverEnv.supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: verifyError } = await verifier.auth.signInWithPassword({ email: user.email, password: current_password });
    if (verifyError) {
      await recordLoginAttempt(emailHash, ipHash, false);
      throw new ActionError("Mevcut şifre hatalı.", { current_password: ["Mevcut şifre hatalı."] });
    }
    await verifier.auth.signOut({ scope: "local" });

    const { error } = await db.auth.updateUser({ password: new_password });
    if (error) {
      const weak = /weak|short|characters|pwned|leaked/i.test(error.message);
      throw new ActionError(weak ? "Bu şifre güvenlik kurallarını karşılamıyor ya da sızdırılmış şifreler listesinde." : "Şifre değiştirilemedi.");
    }
    // Other devices must sign in again with the new password.
    await db.auth.signOut({ scope: "others" });
    return { entityId: user.id, message: "Şifreniz değiştirildi. Diğer cihazlardaki oturumlar kapatıldı." };
  },
});

export async function changePassword(prev: ActionResult | undefined, fd: FormData) {
  return changePasswordImpl(prev, fd);
}

async function endSession(scope: "local" | "global") {
  const admin = await getAdmin();
  if (admin) {
    await admin.db.auth.signOut({ scope });
    await audit(admin, scope === "global" ? "logout_everywhere" : "logout", "auth", admin.user.id);
  }
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  // Clear any Supabase auth cookies that might remain (chunked sb-*-auth-token cookies).
  for (const c of store.getAll()) if (c.name.startsWith("sb-")) store.delete(c.name);
  redirect("/admin-login");
}

export async function logout() {
  await endSession("local");
}

export async function logoutEverywhere() {
  await endSession("global");
}
