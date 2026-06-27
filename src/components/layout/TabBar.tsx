"use client";

import { FileTab } from "./constants";

interface TabBarProps {
  tabs: FileTab[];
  activeTab: FileTab;
  onTabClick: (tab: FileTab) => void;
  onTabClose: (fileId: string, e: React.MouseEvent) => void;
}

const TabIcon = ({ ext }: { ext: string }) => {
  const colors: Record<string, string> = {
    tsx: "#61dafb",
    ts: "#007acc",
    json: "#cbcb41",
    md: "#519aba",
  };
  const color = colors[ext] || "#888";
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className="tab-icon"
      style={{ flexShrink: 0 }}
    >
      <rect
        x="1"
        y="1"
        width="12"
        height="12"
        rx="2"
        fill={color}
        opacity="0.2"
      />
      <text
        x="7"
        y="10"
        textAnchor="middle"
        fontSize="7"
        fontWeight="bold"
        fill={color}
        fontFamily="monospace"
      >
        {ext === "tsx" ? "R" : ext === "ts" ? "TS" : ext.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  );
};

export default function TabBar({ tabs, activeTab, onTabClick, onTabClose }: TabBarProps) {
  return (
    <div className="vscode-tabbar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab${tab.id === activeTab.id ? " active" : ""}`}
          onClick={() => onTabClick(tab)}
        >
          <TabIcon ext={tab.ext} />
          <span className="tab-name">{tab.name}</span>
          <button
            className="tab-close"
            onClick={(e) => onTabClose(tab.id, e)}
            aria-label={`Close ${tab.name}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
