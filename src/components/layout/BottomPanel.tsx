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
        {activeTab === "PROBLEMS" && <div>No problems have been detected in the workspace. Because good engineers solve problems. =)</div>}
        {activeTab === "OUTPUT" && (
          <div>
            <span style={{ color: "#569CD6" }}>[Info]</span> Initializing neural networks...<br/>
            <span style={{ color: "#569CD6" }}>[Info]</span> Loading dataset 'osman_bugra_skills_v1.0'...<br/>
            <span style={{ color: "#C586C0" }}>[Training]</span> Epoch 100/100 completed successfully.<br/>
            <span style={{ color: "#DCDCAA" }}>[Metrics]</span> Accuracy: 99.9%, Loss: 0.001<br/>
            <strong style={{ color: "#4CAF50" }}>[System] Model is ready to solve complex problems!</strong>
          </div>
        )}
        {activeTab === "DEBUG CONSOLE" && <div>System running flawlessly. No debugging required today. You can grab a coffee ☕️</div>}
        {activeTab === "TERMINAL" && (
          <div>
            <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } } .blinking-cursor { animation: blink 1.2s step-end infinite; font-weight: bold; }`}</style>
            <span style={{ color: "var(--accent)" }}>osmanbugrabolat@AI-MacBook-Pro</span>
            <span style={{ color: "var(--sidebar-fg)" }}> ~/Desktop/portfolio-ai</span>
            <br />
            $ whoami<br />
            <span style={{ color: "#4CAF50" }}>&gt; Osman Buğra BOLAT - AI powered AI & Cloud Engineer</span><br />
            <br />
            $ ./deploy_future.sh<br />
            &gt; Loading AI modules... 100%<br />
            &gt; Connecting to Cloud infrastructure... Done.<br />
            &gt; Success! Welcome to my digital workspace.<br />
            <span className="blinking-cursor">_</span>
          </div>
        )}
      </div>
    </div>
  );
}
