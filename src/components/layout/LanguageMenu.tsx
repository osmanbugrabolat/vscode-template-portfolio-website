"use client";

import { useEffect, useRef, useState } from "react";
import { VscGlobe, VscCheck } from "react-icons/vsc";
import { type Language, useLanguage } from "./LanguageContext";

const languages: { code: Language; label: string }[] = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
];

export default function LanguageMenu({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = language === "tr" ? "Dil" : "Language";

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`lang-menu-wrap ${className}`}>
      <button
        type="button"
        className={`activity-item${open ? " active" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <VscGlobe size={24} />
        {!open && <span className="activity-tooltip">{label}</span>}
      </button>

      {open && (
        <div className="lang-menu" role="menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="menuitemradio"
              aria-checked={language === lang.code}
              className={`lang-menu-item${language === lang.code ? " selected" : ""}`}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
            >
              <span className="lang-menu-check">{language === lang.code && <VscCheck size={14} />}</span>
              <span>{lang.label}</span>
              <span className="lang-menu-code">{lang.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
