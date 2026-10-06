"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VscCloudUpload, VscCopy, VscFileMedia, VscFilePdf, VscLinkExternal, VscTrash, VscWarning } from "react-icons/vsc";
import type { MediaItem } from "@/lib/server/media-list";
import { deleteMedia } from "../_actions/media";
import { DeleteButton, PageHeader, useToast } from "../_components/ui";
import { formatBytes, formatDate } from "../_components/labels";
import { useMediaUpload } from "../_components/useMediaUpload";

function MediaCard({ item, usedBy, deletable }: { item: MediaItem; usedBy: string[]; deletable: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      toast("success", "Adres kopyalandı.");
    } catch {
      toast("error", "Kopyalanamadı.");
    }
  };
  return (
    <article className="adm-card adm-media-item">
      <div className="adm-media-thumb">
        {item.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.name} loading="lazy" />
        ) : (
          <VscFilePdf size={40} color="#e05252" aria-hidden />
        )}
      </div>
      <div className="adm-media-meta">
        <div className="adm-media-name" title={item.name}>
          {item.name}
        </div>
        <div className="adm-list-sub">
          {item.size ? formatBytes(item.size) : "Site ile gelen dosya"}
          {item.createdAt && ` · ${formatDate(item.createdAt)}`}
        </div>
        {usedBy.length > 0 && (
          <span className="adm-badge adm-badge-accent" title={usedBy.join(", ")}>
            {usedBy.length} yerde kullanılıyor
          </span>
        )}
        <div className="adm-btn-group">
          <button type="button" className="adm-btn adm-btn-sm" onClick={copy}>
            <VscCopy aria-hidden /> Adres
          </button>
          <a className="adm-btn adm-btn-sm adm-btn-ghost adm-btn-icon" href={item.url} target="_blank" rel="noopener noreferrer" aria-label="Aç" title="Aç">
            <VscLinkExternal />
          </a>
          {deletable && (
            <DeleteButton
              action={deleteMedia}
              fields={{ path: item.path }}
              title="Dosya silinsin mi?"
              message={usedBy.length ? `Bu dosya şurada kullanılıyor: ${usedBy.join(", ")}. Önce oradan kaldırmanız gerekir.` : `"${item.name}" kalıcı olarak silinecek.`}
              iconOnly={<VscTrash />}
              onDone={() => router.refresh()}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export default function MediaLibrary({ uploaded, bundled, usage }: { uploaded: MediaItem[]; bundled: MediaItem[]; usage: Record<string, string[]> }) {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { upload, progress, error } = useMediaUpload();

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    let ok = 0;
    for (const file of [...files].slice(0, 10)) if (await upload(file)) ok++;
    if (ok) {
      toast("success", `${ok} dosya yüklendi.`);
      router.refresh();
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <PageHeader title="Medya" icon={<VscFileMedia aria-hidden />} description="Görselleri ve PDF dosyalarını yükleyin. Yüklenen dosyalar Gezgin'de görsel ve PDF sayfalarında, profil fotoğrafında seçilebilir." />

      <section className="adm-card adm-card-body">
        <div
          className={`adm-dropzone${dragging ? " is-dragging" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), inputRef.current?.click())}
          onDragOver={(e) => (e.preventDefault(), setDragging(true))}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <VscCloudUpload size={28} aria-hidden />
          <strong>{progress !== null ? `Yükleniyor %${progress}` : "Dosyaları buraya bırakın ya da tıklayıp seçin"}</strong>
          <span>PNG, JPG, WEBP, GIF veya PDF · en fazla 10 MB</span>
          {progress !== null && (
            <div className="adm-progress" style={{ maxWidth: 320 }}>
              <div style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" multiple hidden accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" onChange={(e) => handleFiles(e.target.files)} />
        {error && (
          <p className="adm-alert adm-alert-error" role="alert" style={{ marginTop: 12 }}>
            <VscWarning aria-hidden /> {error}
          </p>
        )}
      </section>

      <section className="adm-form">
        <h2 className="adm-label" style={{ fontSize: 13 }}>
          Yüklenen dosyalar ({uploaded.length})
        </h2>
        {uploaded.length ? (
          <div className="adm-media-grid">
            {uploaded.map((m) => (
              <MediaCard key={m.path} item={m} usedBy={usage[m.url] ?? []} deletable />
            ))}
          </div>
        ) : (
          <div className="adm-card adm-empty">Henüz dosya yüklenmedi.</div>
        )}
      </section>

      <section className="adm-form">
        <h2 className="adm-label" style={{ fontSize: 13 }}>
          Site ile gelen dosyalar ({bundled.length})
        </h2>
        <p className="adm-help">Bu dosyalar sitenin kodunda bulunur; silinemez ama içeriklerde kullanılabilir.</p>
        <div className="adm-media-grid">
          {bundled.map((m) => (
            <MediaCard key={m.path} item={m} usedBy={usage[m.url] ?? []} deletable={false} />
          ))}
        </div>
      </section>
    </>
  );
}
