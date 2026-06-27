"use client";

import { useState, useRef, useEffect } from "react";
import { VscArrowRight } from "react-icons/vsc";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIChat({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm BuğrAI. Ask me anything about Osman Buğra's portfolio." },
  ]);
  const [input, setInput] = useState("");
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
        <form onSubmit={handleSubmit} style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="text"
            className="chat-input"
            placeholder="Ask me something about myself..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ paddingRight: "36px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            style={{ 
              position: "absolute", 
              right: "6px", 
              width: "26px", 
              height: "26px", 
              borderRadius: "50%", 
              backgroundColor: "#007acc",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() ? "pointer" : "default",
              transition: "opacity 0.2s",
              opacity: input.trim() ? 1 : 0.6
            }}
          >
            <VscArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
