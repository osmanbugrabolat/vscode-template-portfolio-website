"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function KozmikTozPlayPage() {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          router.push("/projects/kozmik-toz-enstalasyon");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, isFullscreen]);

  const gameContent = (
    <div className={isFullscreen 
      ? "fixed inset-0 z-[9999] bg-black" 
      : "flex flex-col w-full h-[calc(100vh-120px)] min-h-[600px] bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-2xl relative mt-4"}>
      
      <div className={`absolute top-4 left-4 z-10 flex gap-4 ${isFullscreen ? 'top-6 left-6' : ''}`}>
        <button 
          onClick={() => router.push("/projects/kozmik-toz-enstalasyon")}
          style={{ padding: '10px 24px', flexShrink: 0 }}
          className="bg-black/40 hover:bg-white/10 border border-white/10 backdrop-blur-xl rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 text-sm font-medium text-white/90 hover:text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] group whitespace-nowrap"
        >
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Portfolyoya Dön
        </button>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          style={{ padding: '10px 24px', flexShrink: 0 }}
          className="bg-black/40 hover:bg-white/10 border border-white/10 backdrop-blur-xl rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 text-sm font-medium text-white/90 hover:text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] group whitespace-nowrap"
        >
          {isFullscreen ? (
            <>
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5v4H5M9 9L4 4 M15 5v4h4M15 9l5-5 M9 19v-4H5M9 15l-5 5 M15 19v-4h4M15 15l5 5" />
              </svg>
              Küçült
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M4 4l5 5 M20 8V4h-4M20 4l-5 5 M4 16v4h4M4 20l5-5 M20 16v4h-4M20 20l-5-5" />
              </svg>
              Tam Ekran
            </>
          )}
        </button>
      </div>
      <iframe
        src="https://osmanbugrabolat.github.io/kozmik-toz-enstalasyon/"
        className="w-full h-full border-0 outline-none"
        allow="camera; microphone; autoplay; fullscreen"
        title="Kozmik Toz Enstalasyonu"
      />
    </div>
  );

  if (!mounted) return null;

  return isFullscreen ? createPortal(gameContent, document.body) : gameContent;
}
