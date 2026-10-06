"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { VscArrowLeft, VscScreenFull, VscScreenNormal } from "react-icons/vsc";
import type { Lang } from "@/lib/chatbot/types";

const TEXT = {
  back: { tr: "Portfolyoya Dön", en: "Back to Portfolio" },
  full: { tr: "Tam Ekran", en: "Full Screen" },
  exit: { tr: "Küçült", en: "Exit Full Screen" },
};

export default function EmbedView({ src, title, backHref, lang }: { src: string; title: string; backHref: string; lang: Lang }) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  // createPortal needs document.body, so render only on the client.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isFullscreen) setIsFullscreen(false);
      else router.push(backHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, isFullscreen, backHref]);

  const content = (
    <div className={isFullscreen ? "embed-shell embed-shell-full" : "embed-shell"}>
      <div className="embed-toolbar">
        <button type="button" className="embed-button" onClick={() => router.push(backHref)}>
          <VscArrowLeft size={16} aria-hidden />
          {TEXT.back[lang]}
        </button>
        <button type="button" className="embed-button" onClick={() => setIsFullscreen((f) => !f)}>
          {isFullscreen ? <VscScreenNormal size={16} aria-hidden /> : <VscScreenFull size={16} aria-hidden />}
          {isFullscreen ? TEXT.exit[lang] : TEXT.full[lang]}
        </button>
      </div>
      <iframe
        src={src}
        className="embed-frame"
        allow="camera; microphone; autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
        referrerPolicy="no-referrer"
        title={title}
      />
    </div>
  );

  if (!mounted) return null;
  return isFullscreen ? createPortal(content, document.body) : content;
}
