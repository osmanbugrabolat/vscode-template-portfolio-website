"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { VscArrowRight, VscChevronDown, VscCopilot, VscLinkExternal } from "react-icons/vsc";
import { useLanguage } from "./LanguageContext";
import type { ChatLink, ChatResponse, IntentOption, Lang } from "@/lib/chatbot/types";

interface Message {
  role: "user" | "ai";
  content: string;
  options?: IntentOption[];
  links?: ChatLink[];
}

const UI_TEXT = {
  greeting: {
    tr: "Merhaba! Ben BuğrAI. Osman Buğra'nın portfolyosu hakkında merak ettiğiniz her şeyi sorabilirsiniz.",
    en: "Hi! I'm BuğrAI. Ask me anything about Osman Buğra's portfolio.",
  },
  placeholder: {
    tr: "Bana Buğra hakkında bir şey sorun...",
    en: "Ask me something about Buğra...",
  },
  error: {
    tr: "Şu an cevap veremiyorum, lütfen biraz sonra tekrar deneyin.",
    en: "I can't answer right now, please try again in a moment.",
  },
} satisfies Record<string, Record<Lang, string>>;

const STARTER_OPTIONS: Record<Lang, IntentOption[]> = {
  tr: [
    { id: "about-me", title: "Buğra kimdir?" },
    { id: "projects-overview", title: "Hangi projeleri yaptı?" },
    { id: "experience-overview", title: "İş deneyimleri neler?" },
    { id: "contact-email", title: "Buğra'ya nasıl ulaşırım?" },
  ],
  en: [
    { id: "about-me", title: "Who is Buğra?" },
    { id: "projects-overview", title: "What projects has he built?" },
    { id: "experience-overview", title: "What is his work experience?" },
    { id: "contact-email", title: "How can I contact Buğra?" },
  ],
};

function greetingMessage(lang: Lang, greeting?: Record<Lang, string>): Message {
  const text = greeting?.[lang]?.trim() || greeting?.[lang === "tr" ? "en" : "tr"]?.trim() || UI_TEXT.greeting[lang];
  return { role: "ai", content: text, options: STARTER_OPTIONS[lang] };
}

function toMessage(res: ChatResponse): Message {
  if (res.type === "answer") {
    return { role: "ai", content: res.answer, links: res.links, options: res.followUps };
  }
  return { role: "ai", content: res.message, options: res.options };
}

function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !href.endsWith(".pdf");
}

/** Only site paths, https and mailto links are rendered; anything else is dropped. */
function isSafeHref(href: string) {
  return (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("https://") || href.startsWith("mailto:");
}

export default function AIChat({ onClose, width, greeting }: { onClose?: () => void; width?: number; greeting?: Record<Lang, string> }) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(() => [greetingMessage(language, greeting)]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("BuğrAI Max");
  const [showDropdown, setShowDropdown] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Re-greet in the new language while the conversation hasn't started yet.
  const [greetedIn, setGreetedIn] = useState(language);
  if (greetedIn !== language) {
    setGreetedIn(language);
    if (messages.length === 1) setMessages([greetingMessage(language, greeting)]);
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const ask = async (userText: string, payload: { message: string } | { intentId: string }) => {
    if (isLoading) return;
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, lang: language }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ChatResponse = await res.json();
      setMessages((prev) => [...prev, toMessage(data)]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: UI_TEXT.error[language] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    ask(text, { message: text });
  };

  const handleOption = (option: IntentOption) => ask(option.title, { intentId: option.id });

  return (
    <div className="vscode-aichat" style={width ? { width } : undefined}>
      <div className="aichat-header">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <VscCopilot size={16} />
          BuğrAI
        </div>
        {onClose && (
          <button type="button" className="aichat-close" onClick={onClose} aria-label="Close Panel">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.707L8 8.707z" />
            </svg>
          </button>
        )}
      </div>
      <div className="aichat-body">
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          return (
            <div key={i} className={`chat-message chat-${msg.role}`}>
              <div className="chat-bubble">{msg.content}</div>

              {msg.links && msg.links.length > 0 && (
                <div className="chat-links">
                  {msg.links.filter((link) => isSafeHref(link.href)).map((link) =>
                    isInternal(link.href) ? (
                      <Link key={link.href} href={link.href} className="chat-link">
                        {link.label}
                      </Link>
                    ) : (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="chat-link">
                        {link.label} <VscLinkExternal size={11} />
                      </a>
                    ),
                  )}
                </div>
              )}

              {/* Options stay clickable only on the latest message, so old turns read as history. */}
              {msg.options && msg.options.length > 0 && (
                <div className="chat-options">
                  {msg.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className="chat-option"
                      disabled={!isLast || isLoading}
                      onClick={() => handleOption(option)}
                    >
                      {option.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="chat-message chat-ai">
            <div className="chat-bubble chat-typing" aria-label="typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="chat-input-container">
        <form 
          onSubmit={handleSubmit} 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            background: "var(--input-bg)", 
            border: "1px solid var(--border-color)", 
            borderRadius: "8px",
            padding: "8px 12px"
          }}
        >
          <input
            type="text"
            className="chat-input"
            placeholder={UI_TEXT.placeholder[language]}
            maxLength={300}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ 
              background: "transparent", 
              border: "none", 
              outline: "none", 
              color: "var(--editor-fg)",
              fontSize: "13px",
              width: "100%",
              marginBottom: "12px",
              padding: 0,
              minHeight: "unset"
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ fontSize: "11px", color: "#aaa", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: "500", padding: "4px 8px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", userSelect: "none" }}
            >
              <VscCopilot size={14} /> {model} <VscChevronDown size={14} style={{ transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </div>
            
            {showDropdown && (
              <div style={{
                position: "absolute",
                bottom: "100%",
                left: 0,
                marginBottom: "8px",
                background: "var(--sidebar-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                zIndex: 10
              }}>
                {["BuğrAI (Low)", "BuğrAI (High)", "BuğrAI Max", "BuğrAI Ultra (Coming Soon)"].map((m) => {
                  const isComingSoon = m.includes("Coming Soon");
                  return (
                    <div
                      key={m}
                      onClick={() => {
                        if (!isComingSoon) {
                          setModel(m);
                          setShowDropdown(false);
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        fontSize: "11px",
                        color: isComingSoon ? "rgba(255,255,255,0.3)" : (model === m ? "#fff" : "var(--sidebar-fg)"),
                        background: model === m ? "rgba(255,255,255,0.1)" : "transparent",
                        borderRadius: "4px",
                        cursor: isComingSoon ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (model !== m && !isComingSoon) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      }}
                      onMouseLeave={(e) => {
                        if (model !== m && !isComingSoon) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {m}
                    </div>
                  );
                })}
              </div>
            )}
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{ 
                width: "28px", 
                height: "28px", 
                borderRadius: "50%", 
                backgroundColor: input.trim() ? "#007acc" : "rgba(255,255,255,0.1)",
                color: input.trim() ? "#fff" : "#666",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() ? "pointer" : "default",
                transition: "all 0.2s ease"
              }}
            >
              <VscArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
