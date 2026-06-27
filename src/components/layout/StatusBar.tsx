"use client";

import { useState, useEffect } from "react";

interface StatusBarProps {
  language: string;
  onTogglePanel?: () => void;
}

export default function StatusBar({ language, onTogglePanel }: StatusBarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="vscode-statusbar">
      {/* Left */}
      <div className="statusbar-left">
        <div className="statusbar-item">
          {/* Git branch icon */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="5" cy="3.5" r="1.5" />
            <circle cx="11" cy="3.5" r="1.5" />
            <circle cx="5" cy="12.5" r="1.5" />
            <path d="M5 5v5.5M11 5a5 5 0 01-5 5" />
          </svg>
          <span>main</span>
        </div>
        <div 
          className="statusbar-item" 
          onClick={onTogglePanel}
          style={{ cursor: "pointer" }}
          title="Toggle Bottom Panel"
        >
          {/* Error icon */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="8" cy="8" r="6" />
            <path strokeLinecap="round" d="M8 5v4M8 11v.5" />
          </svg>
          <span>0</span>
          {/* Warning icon */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ marginLeft: 6 }}
          >
            <path
              strokeLinejoin="round"
              d="M8 2L1.5 13.5h13L8 2zM8 6v4M8 11.5v.5"
            />
          </svg>
          <span>0</span>
        </div>
      </div>

      {/* Right */}
      <div className="statusbar-right">
        {time && (
          <div className="statusbar-item">
            <span>{time}</span>
          </div>
        )}
        <div className="statusbar-item">
          <span>Ln 1, Col 1</span>
        </div>
        <div className="statusbar-item">
          <span>UTF-8</span>
        </div>
        <div className="statusbar-item">
          <span>LF</span>
        </div>
        <div className="statusbar-item">
          <span>{language}</span>
        </div>
        <div className="statusbar-item">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3l2 2" />
          </svg>
          <span>Prettier</span>
        </div>
      </div>
    </div>
  );
}
