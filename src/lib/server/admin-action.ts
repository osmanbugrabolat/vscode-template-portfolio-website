import "server-only";
import * as z from "zod";
import { revalidatePath, updateTag } from "next/cache";
import { fieldErrors, type FieldErrors } from "@/lib/validation";
import { CMS_TAG } from "@/lib/cms/data";
import { CHAT_TAG } from "@/lib/chatbot/repository";
import { audit, requireAdminAction, UnauthorizedError, type AdminContext } from "./auth";

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export const IDLE: ActionResult = { ok: true };

/** Turns Postgres/PostgREST errors into messages that do not leak internals. */
export function describeDbError(error: { code?: string; message?: string } | null | undefined): string {
  switch (error?.code) {
    case "23505":
      if (error.message?.includes("route")) return "Bu adres zaten başka bir sayfada kullanılıyor.";
      if (error.message?.includes("key")) return "Bu anahtar zaten kullanılıyor.";
      return "Bu değer zaten kullanılıyor.";
    case "23514":
      if (error.message?.includes("parent must be a folder")) return "Üst öğe bir klasör olmalı.";
      if (error.message?.includes("into itself")) return "Bir klasör kendi içine taşınamaz.";
      if (error.message?.includes("route_not_reserved")) return "Bu adres sistem tarafından kullanılıyor.";
      return "Girilen değerler kurallara uymuyor.";
    case "23503":
      return "İlişkili kayıt bulunamadı.";
    case "42501":
      return "Bu işlem için yetkiniz yok.";
    case "PGRST116":
    case "P0002":
      return "Kayıt bulunamadı.";
    default:
      return "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
  }
}

export function invalidate(...tags: ("cms" | "chat")[]) {
  for (const tag of tags) updateTag(tag === "cms" ? CMS_TAG : CHAT_TAG);
  // Admin screens read uncached data; this makes the current screen re-render with it.
  revalidatePath("/admin", "layout");
}

interface Options<S extends z.ZodType, T> {
  schema: S;
  /** Audit trail entry (false for read-only helpers); entity id may come from the handler result. */
  audit: { action: string; entity: string } | false;
  run: (input: z.output<S>, admin: AdminContext) => Promise<{ entityId?: string | null; message?: string; data?: T; details?: Record<string, unknown> }>;
}

/**
 * Wraps a server action: authorise -> validate -> run -> audit.
 * Unexpected errors are logged server-side and surfaced as a generic message.
 */
export function adminAction<S extends z.ZodType, T = undefined>(opts: Options<S, T>) {
  return async (_prev: ActionResult<T> | undefined, formData: FormData): Promise<ActionResult<T>> => {
    let admin: AdminContext;
    try {
      admin = await requireAdminAction();
    } catch (e) {
      if (e instanceof UnauthorizedError) return { ok: false, error: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın." };
      throw e;
    }

    const raw = Object.fromEntries([...formData.entries()].filter(([k]) => !k.startsWith("$ACTION")));
    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) {
      // Field names only, never values: helps diagnose without logging content.
      console.warn(`[admin] validation failed for ${opts.audit ? opts.audit.entity : "action"}:`, parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.code}`).join(", "));
      return { ok: false, error: "Lütfen işaretli alanları düzeltin.", fieldErrors: fieldErrors(parsed.error) };
    }

    try {
      const result = await opts.run(parsed.data, admin);
      if (opts.audit) await audit(admin, opts.audit.action, opts.audit.entity, result.entityId ?? null, result.details ?? {});
      return { ok: true, message: result.message ?? "Kaydedildi.", data: result.data };
    } catch (e) {
      if (e instanceof ActionError) return { ok: false, error: e.message, fieldErrors: e.fieldErrors };
      console.error(`[admin] ${opts.audit ? opts.audit.action : "action"} failed:`, e);
      return { ok: false, error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };
    }
  };
}

/** Throw inside a handler to return a specific, user-facing error. */
export class ActionError extends Error {
  constructor(
    message: string,
    public fieldErrors?: FieldErrors,
  ) {
    super(message);
  }
}

export function assertDb<T>(result: { data: T; error: { code?: string; message?: string } | null }): T {
  if (result.error) throw new ActionError(describeDbError(result.error));
  return result.data;
}

/** Like assertDb, but a missing row is also an error. */
export function requireRow<T>(result: { data: T; error: { code?: string; message?: string } | null }): NonNullable<T> {
  const data = assertDb(result);
  if (data === null || data === undefined) throw new ActionError("Kayıt bulunamadı.");
  return data as NonNullable<T>;
}
