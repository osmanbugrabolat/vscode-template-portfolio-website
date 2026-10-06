import { revalidateTag } from "next/cache";
import { CMS_TAG } from "@/lib/cms/data";
import { CHAT_TAG } from "@/lib/chatbot/repository";
import { hmac, safeEqual } from "@/lib/server/crypto";
import { serverEnv } from "@/lib/server/env";

/**
 * Called by a database trigger (pg_net) whenever content tables change, so
 * edits made outside the admin panel (SQL editor, Supabase dashboard) show up
 * immediately instead of after the cache lifetime.
 * Auth: a bearer token derived from APP_SECRET; nothing else is accepted.
 */
export function revalidateToken() {
  return hmac("revalidate-webhook", "v1");
}

export async function POST(request: Request) {
  if (!serverEnv.isConfigured) return Response.json({ error: "Not configured" }, { status: 503 });
  const given = request.headers.get("authorization") ?? "";
  if (!safeEqual(given, `Bearer ${revalidateToken()}`)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  revalidateTag(CMS_TAG, { expire: 0 });
  revalidateTag(CHAT_TAG, { expire: 0 });
  return Response.json({ revalidated: true });
}
