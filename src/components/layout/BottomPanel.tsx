"use client";

import { useState } from "react";
import { VscClose } from "react-icons/vsc";

interface BottomPanelProps {
  onClose: () => void;
}

export default function BottomPanel({ onClose }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState("TERMINAL");
  
  const tabs = ["PROBLEMS", "OUTPUT", "DEBUG CONSOLE", "TERMINAL"];

  return (
    <div style={{
      height: "250px",
      borderTop: "1px solid var(--border-color)",
      background: "var(--sidebar-bg)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      zIndex: 10
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
        height: "35px",
        borderBottom: "1px solid var(--border-color)",
      }}>
        <div style={{ display: "flex", gap: "20px" }}>
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-sans)",
                color: activeTab === tab ? "var(--fg)" : "var(--sidebar-fg)",
                borderBottom: activeTab === tab ? "1px solid var(--accent)" : "1px solid transparent",
                padding: "8px 0",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {tab}
            </div>
          ))}
        </div>
        <div 
          onClick={onClose} 
          style={{ cursor: "pointer", color: "var(--sidebar-fg)", padding: "4px" }}
          title="Close Panel"
        >
          <VscClose size={16} />
        </div>
      </div>
      <div style={{ flex: 1, padding: "10px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--sidebar-fg)", overflowY: "auto", lineHeight: "1.5" }}>
        {activeTab === "PROBLEMS" && <div>No problems have been detected in the workspace.</div>}
        {activeTab === "OUTPUT" && <div>[Info] Starting development server...<br/>[Info] Ready in 1250ms</div>}
        {activeTab === "DEBUG CONSOLE" && <div>Please start a debug session to evaluate expressions.</div>}
        {activeTab === "TERMINAL" && (
          <div>
            <span style={{ color: "#4ade80" }}>osmanbugrabolat@MacBook-Pro</span> <span style={{ color: "#60a5fa" }}>~/Desktop/portfolyo-ai/frontend</span><br/>
            $ npm run dev<br/>
            <br/>
            &gt; frontend@0.1.0 dev<br/>
            &gt; next dev<br/>
            <br/>
            ready - started server on 0.0.0.0:3000, url: http://localhost:3000<br/>
            event - compiled client and server successfully in 1250 ms (154 modules)<br/>
            <br/>
            <span className="terminal-cursor" style={{ display: "inline-block", width: "8px", height: "15px", background: "var(--sidebar-fg)", verticalAlign: "middle" }} />
          </div>
        )}
      </div>
    </div>
  );
}
