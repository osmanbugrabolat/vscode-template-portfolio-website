export const MEDIA_BUCKET = "media";
export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;

/** Allowed upload types and the extension we store them with. SVG is deliberately excluded. */
export const MEDIA_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
} as const;

export type MediaMime = keyof typeof MEDIA_TYPES;

const startsWith = (bytes: Uint8Array, sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

/** Identifies a file by its magic bytes (first 16 bytes are enough). */
export function detectMediaType(bytes: Uint8Array): MediaMime | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)) return "image/webp";
  if (startsWith(bytes, ascii("GIF87a")) || startsWith(bytes, ascii("GIF89a"))) return "image/gif";
  if (startsWith(bytes, ascii("%PDF-"))) return "application/pdf";
  return null;
}
