"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function SihirliSapanHSDEditionPlayPage() {
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
          router.push("/projects/sihirli-sapan-hsd-edition");
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
      
      <div className={`absolute top-4 left-4 z-10 flex gap-2 ${isFullscreen ? 'top-6 left-6' : ''}`}>
        <button 
          onClick={() => router.push("/projects/sihirli-sapan-hsd-edition")}
          className="px-4 py-2 bg-black/60 hover:bg-black/90 text-white rounded-lg backdrop-blur-md transition-all flex items-center gap-2 border border-white/20 text-sm font-medium shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Projeye Dön
        </button>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-4 py-2 bg-black/60 hover:bg-black/90 text-white rounded-lg backdrop-blur-md transition-all flex items-center gap-2 border border-white/20 text-sm font-medium shadow-lg"
        >
          {isFullscreen ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4v4m0 0H4m4 0L3 3m13 1v4m0 0h4m-4 0l5-5m-5 13v-4m0 0h4m-4 0l5 5m-13-5v4m0 0H4m4 0l-5 5" />
              </svg>
              Küçült
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Tam Ekran
            </>
          )}
        </button>
      </div>
      <iframe
        src="https://osmanbugrabolat.github.io/sihirli-sapan-hsd-edition/"
        className="w-full h-full border-0 outline-none"
        allow="camera; microphone; autoplay; fullscreen"
        title="Sihirli Sapan HSD Edition"
      />
    </div>
  );

  if (!mounted) return null;

  return isFullscreen ? createPortal(gameContent, document.body) : gameContent;
}
