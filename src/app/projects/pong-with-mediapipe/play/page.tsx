"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export default function PongPlayPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/projects/pong-with-mediapipe");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black">
      <button 
        onClick={() => router.push("/projects/pong-with-mediapipe")}
        className="absolute top-6 left-6 z-[10000] px-4 py-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-md transition-all flex items-center gap-2 border border-white/20 text-sm font-medium shadow-lg"
      >
        Geri Dön
      </button>
      <iframe
        src="https://osmanbugrabolat.github.io/pong-with-mediapipe/"
        className="w-full h-full border-0 outline-none"
        allow="camera; microphone; autoplay; fullscreen"
        title="Pong with Mediapipe"
      />
    </div>,
    document.body
  );
}
