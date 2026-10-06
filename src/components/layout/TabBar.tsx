"use client";

import { VscClose } from "react-icons/vsc";
import { Icon } from "@/lib/icons";
import type { FileTab } from "./constants";

interface TabBarProps {
  tabs: FileTab[];
  activeTabId?: string;
  onTabClick: (tab: FileTab) => void;
  onTabClose: (fileId: string, e: React.MouseEvent) => void;
}

export default function TabBar({ tabs, activeTabId, onTabClick, onTabClose }: TabBarProps) {
  return (
    <div className="vscode-tabbar" role="tablist">
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        return (
          <div key={tab.id} className={`tab${active ? " active" : ""}`} role="presentation">
            <button type="button" role="tab" aria-selected={active} className="tab-main" onClick={() => onTabClick(tab)}>
              <Icon name={tab.icon} size={14} />
              <span className="tab-name">{tab.name}</span>
            </button>
            <button type="button" className="tab-close" onClick={(e) => onTabClose(tab.id, e)} aria-label={`Close ${tab.name}`}>
              <VscClose size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
