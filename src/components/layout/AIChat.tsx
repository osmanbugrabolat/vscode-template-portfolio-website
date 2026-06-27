"use client";

import { useState, useRef, useEffect } from "react";
import { VscArrowRight, VscSparkle, VscChevronDown } from "react-icons/vsc";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIChat({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm BuğrAI. Ask me anything about Osman Buğra's portfolio." },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("BuğrAI Max");
  const [showDropdown, setShowDropdown] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          role: "ai",
          content: "This is a placeholder response. In a real app, this would connect to an AI backend.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="vscode-aichat">
      <div className="aichat-header">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M12.5 3H3.5a2 2 0 00-2 2v6a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2zM3.5 4h9a1 1 0 011 1v6a1 1 0 01-1 1h-9a1 1 0 01-1-1V5a1 1 0 011-1z" />
            <path d="M5.5 7.5a1 1 0 110-2 1 1 0 010 2zm5 0a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          BuğrAI
        </div>
        {onClose && (
          <div className="aichat-close" onClick={onClose} title="Close Panel">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.707L8 8.707z" />
            </svg>
          </div>
        )}
      </div>
      <div className="aichat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-${msg.role}`}>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
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
            placeholder="Ask me something about myself..."
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
              <VscSparkle size={12} /> {model} <VscChevronDown size={14} style={{ transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
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
              disabled={!input.trim()}
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
