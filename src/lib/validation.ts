import * as z from "zod";
import { ICON_KEYS } from "./icon-keys";

/** Emoji are not allowed anywhere in site content; icons are used instead. */
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{20E3}]/u;
// Pictographic set includes a few ordinary symbols that are fine in text.
const ALLOWED_SYMBOLS = /[©®™←-⇿•–—·…]/gu;

export function containsEmoji(value: string): boolean {
  return EMOJI.test(value.replace(ALLOWED_SYMBOLS, ""));
}

const noEmoji = (s: string) => !containsEmoji(s);
const NO_EMOJI_MESSAGE = "Emoji kullanılamaz; ikon kullanın.";
// Control characters other than tab/newline have no place in content.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function textSchema(max: number, min: number, singleLineOnly: boolean) {
  return z
    .string()
    .transform((s) => {
      const normalised = s.replace(/\r\n?/g, "\n");
      return singleLineOnly ? normalised.trim() : normalised;
    })
    .pipe(
      z
        .string()
        .max(max, { error: `En fazla ${max} karakter olabilir.` })
        // Length is checked after trimming, so "   " does not satisfy a required field.
        .refine((s) => s.trim().length >= min, { error: min === 1 ? "Bu alan zorunlu." : `En az ${min} karakter olmalı.` })
        .refine((s) => !CONTROL_CHARS.test(s), { error: "Geçersiz karakter içeriyor." })
        .refine((s) => !singleLineOnly || !s.includes("\n"), { error: "Tek satır olmalı." })
        .refine(noEmoji, { error: NO_EMOJI_MESSAGE }),
    );
}

export const text = (max: number, min = 0) => textSchema(max, min, false);
export const singleLine = (max: number, min = 0) => textSchema(max, min, true);

export const RESERVED_ROUTE = /^\/(api|admin|admin-login|_next|auth)(\/|$)/;
export const ROUTE_PATTERN = /^\/([a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*)?$/;

export const routeSchema = z
  .string()
  .trim()
  .max(200)
  .regex(ROUTE_PATTERN, { error: "Adres / ile başlamalı; sadece küçük harf, rakam ve tire içerebilir. Örn: /projects/oyun" })
  .refine((r) => !RESERVED_ROUTE.test(r), { error: "Bu adres sistem tarafından kullanılıyor." });

function isSafeHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !!u.hostname && !u.username && !u.password;
  } catch {
    return false;
  }
}

export const httpsUrl = z
  .string()
  .trim()
  .max(2000)
  .refine(isSafeHttpsUrl, { error: "Geçerli bir https:// adresi girin." });

export const optionalHttpsUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || isSafeHttpsUrl(v), { error: "Geçerli bir https:// adresi girin ya da boş bırakın." });

export const emailSchema = z.email({ error: "Geçerli bir e-posta adresi girin." }).trim().toLowerCase().max(254);

export const linkUrl = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (v) => isSafeHttpsUrl(v) || (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v) && v.length <= 320),
    { error: "https:// ile başlayan bir adres ya da mailto:ornek@alan.com girin." },
  );

function isLocalDevUrl(value: string): boolean {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" && (u.hostname === "127.0.0.1" || u.hostname === "localhost");
  } catch {
    return false;
  }
}

/** Asset path: an uploaded media URL on our storage, or a file under /public. */
export const assetUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => (/^\/[A-Za-z0-9._\-/]+$/.test(v) && !v.includes("..") && !v.startsWith("//")) || isSafeHttpsUrl(v) || isLocalDevUrl(v), {
    error: "Geçerli bir dosya seçin.",
  });

export const iconKey = z.enum(ICON_KEYS as [string, ...string[]], { error: "Geçersiz ikon." });
export const optionalIconKey = z.union([iconKey, z.literal("")]).transform((v) => (v === "" ? null : v));

export const uuid = z.uuid({ error: "Geçersiz kayıt." });

export const sortOrder = z.coerce.number().int().min(-100000).max(100000);

/** Unchecked checkboxes are absent from FormData, so the key must be optional. */
export const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
  .optional()
  .transform((v) => v === "on" || v === "true");

/** One item per line, blank lines dropped. */
export const lineList = (maxItems: number, maxLen: number) =>
  text(maxItems * (maxLen + 1)).transform((s, ctx) => {
    const items = s
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (items.length > maxItems) {
      ctx.addIssue({ code: "custom", message: `En fazla ${maxItems} satır olabilir.` });
      return z.NEVER;
    }
    if (items.some((i) => i.length > maxLen)) {
      ctx.addIssue({ code: "custom", message: `Her satır en fazla ${maxLen} karakter olabilir.` });
      return z.NEVER;
    }
    return items;
  });

/** Comma separated tags. */
export const tagList = (maxItems: number, maxLen: number) =>
  singleLine(maxItems * (maxLen + 2)).transform((s, ctx) => {
    const items = s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (items.length > maxItems || items.some((i) => i.length > maxLen)) {
      ctx.addIssue({ code: "custom", message: `En fazla ${maxItems} etiket, her biri en fazla ${maxLen} karakter.` });
      return z.NEVER;
    }
    return items;
  });

export const passwordPolicy = z
  .string()
  .min(12, { error: "Şifre en az 12 karakter olmalı." })
  .max(128, { error: "Şifre en fazla 128 karakter olabilir." })
  .refine((p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p), {
    error: "Şifre büyük harf, küçük harf, rakam ve sembol içermeli.",
  });

/** Empty or missing form values become null (fields hidden for some types are not submitted at all). */
export const emptyToNull = (v: unknown) => (v === undefined || v === null || (typeof v === "string" && v.trim() === "") ? null : v);

export type FieldErrors = Record<string, string[] | undefined>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}
