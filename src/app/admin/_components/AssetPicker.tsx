"use client";

import { useId, useRef, useState } from "react";
import { VscCloudUpload, VscFilePdf, VscLinkExternal } from "react-icons/vsc";
import type { MediaItem } from "@/lib/server/media-list";
import { Field, useToast } from "./ui";
import { useMediaUpload } from "./useMediaUpload";

export default function AssetPicker({
  name,
  defaultValue,
  media,
  kind,
  label,
  error,
}: {
  name: string;
  defaultValue: string;
  media: MediaItem[];
  kind: "image" | "pdf";
  label: string;
  error?: string[];
}) {
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState(media);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, progress, error: uploadError } = useMediaUpload();
  const toast = useToast();
  const id = useId();
  const options = items.filter((m) => m.kind === kind);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const done = await upload(file);
    if (done) {
      setItems((prev) => [{ path: done.path, url: done.url, name: file.name, size: file.size, mime: file.type, createdAt: new Date().toISOString(), kind }, ...prev]);
      setValue(done.url);
      toast("success", "Dosya yüklendi ve seçildi. Kaydetmeyi unutmayın.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Field label={label} error={error ?? (uploadError ? [uploadError] : undefined)} id={id} help="Kütüphaneden seçin, yeni dosya yükleyin ya da /public altındaki bir dosyanın yolunu yazın.">
      <input type="hidden" name={name} value={value} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select id={id} className="adm-select" style={{ flex: "1 1 220px" }} value={options.some((o) => o.url === value) ? value : ""} onChange={(e) => e.target.value && setValue(e.target.value)}>
          <option value="">{options.some((o) => o.url === value) ? "" : "Kütüphaneden seç..."}</option>
          {options.map((o) => (
            <option key={o.path} value={o.url}>
              {o.name}
            </option>
          ))}
        </select>
        <button type="button" className="adm-btn" onClick={() => fileRef.current?.click()} disabled={progress !== null}>
          <VscCloudUpload aria-hidden /> {progress !== null ? `Yükleniyor %${progress}` : "Yükle"}
        </button>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept={kind === "pdf" ? "application/pdf" : "image/png,image/jpeg,image/webp,image/gif"}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      <input
        className="adm-input adm-mono"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={kind === "pdf" ? "/cv.pdf" : "/certificates/ornek.png"}
        aria-label={`${label} yolu`}
        maxLength={2000}
      />
      {progress !== null && (
        <div className="adm-progress" aria-hidden>
          <div style={{ width: `${progress}%` }} />
        </div>
      )}
      {value && (
        <div className="adm-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: 8 }}>
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" style={{ width: 72, height: 54, objectFit: "contain", background: "#111", borderRadius: 4 }} />
          ) : (
            <VscFilePdf size={28} color="#e05252" aria-hidden />
          )}
          <span className="adm-muted" style={{ flex: 1, fontSize: 12 }}>
            {kind === "image" ? "Önizleme" : "PDF seçildi"}
          </span>
          <a className="adm-btn adm-btn-sm adm-btn-ghost" href={value} target="_blank" rel="noopener noreferrer" aria-label="Dosyayı aç">
            <VscLinkExternal aria-hidden />
          </a>
        </div>
      )}
    </Field>
  );
}
