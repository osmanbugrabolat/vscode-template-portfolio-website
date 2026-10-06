"use client";

import { useCallback, useState } from "react";
import { createUpload, finalizeUpload } from "../_actions/media";
import { MEDIA_MAX_BYTES, MEDIA_TYPES } from "@/lib/media";

export interface UploadedFile {
  path: string;
  url: string;
}

function put(url: string, file: File, contentType: string, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", contentType);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "max-age=3600");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(file);
  });
}

/**
 * Upload flow: server issues a signed URL (admin-checked) -> browser PUTs the
 * file straight to storage -> server verifies the bytes and returns the URL.
 */
export function useMediaUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<UploadedFile | null> => {
    setError(null);
    if (!(file.type in MEDIA_TYPES)) {
      setError("Desteklenmeyen dosya türü. PNG, JPG, WEBP, GIF veya PDF yükleyin.");
      return null;
    }
    if (file.size > MEDIA_MAX_BYTES) {
      setError("Dosya en fazla 10 MB olabilir.");
      return null;
    }
    setProgress(0);
    try {
      const startForm = new FormData();
      startForm.set("name", file.name.slice(0, 255));
      startForm.set("type", file.type);
      startForm.set("size", String(file.size));
      const ticket = await createUpload(undefined, startForm);
      if (!ticket.ok || !ticket.data) throw new Error(ticket.ok ? "Yükleme başlatılamadı." : ticket.error);

      await put(ticket.data.signedUrl, file, ticket.data.contentType, setProgress);

      const doneForm = new FormData();
      doneForm.set("path", ticket.data.path);
      const done = await finalizeUpload(undefined, doneForm);
      if (!done.ok || !done.data) throw new Error(done.ok ? "Yükleme doğrulanamadı." : done.error);
      return done.data;
    } catch (e) {
      setError(e instanceof Error && e.message && !e.message.startsWith("HTTP") ? e.message : "Dosya yüklenemedi.");
      return null;
    } finally {
      setProgress(null);
    }
  }, []);

  return { upload, progress, error, clearError: () => setError(null) };
}
