"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import ActivityBar from "./ActivityBar";
import TabBar from "./TabBar";
import StatusBar from "./StatusBar";
import AIChat from "./AIChat";
import BottomPanel from "./BottomPanel";
import { useLanguage } from "./LanguageContext";
import { toFileTab, type FileTab, type LayoutSettings } from "./constants";
import type { ExplorerItem, SkillCategory } from "@/lib/cms/types";

const MOBILE_BREAKPOINT = 768;

function subscribeToResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

export default function VSCodeLayout({
  children,
  items,
  skillCategories,
  settings,
}: {
  children: React.ReactNode;
  items: ExplorerItem[];
  skillCategories: SkillCategory[];
  settings: LayoutSettings;
}) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const files = useMemo(
    () => items.map((i) => toFileTab(i, language)).filter((f): f is FileTab => f !== null),
    [items, language],
  );
  const homeFile = files.find((f) => f.path === "/" && !f.isExternal) ?? files.find((f) => !f.isExternal);

  const [activeActivity, setActiveActivity] = useState("explorer");
  const [openTabIds, setOpenTabIds] = useState<string[]>(() => (homeFile ? [homeFile.id] : []));
  // null = not toggled yet: the chat starts open on desktop, closed on phones.
  const [chatToggled, setChatToggled] = useState<boolean | null>(null);
  const isDesktop = useSyncExternalStore(subscribeToResize, () => window.innerWidth > MOBILE_BREAKPOINT, () => false);
  const chatOpen = chatToggled ?? isDesktop;
  // Same for the explorer: on phones it is an overlay, so it starts closed.
  // Until the user toggles a panel, CSS decides its visibility (.panel-default-desktop),
  // so the server-rendered HTML is right on every screen size without a flash.
  const [sidebarToggled, setSidebarToggled] = useState<boolean | null>(null);
  const sidebarOpen = sidebarToggled ?? isDesktop;
  const setSidebarOpen = (value: boolean | ((open: boolean) => boolean)) =>
    setSidebarToggled(typeof value === "function" ? value(sidebarOpen) : value);
  const setChatOpen = (value: boolean | ((open: boolean) => boolean)) =>
    setChatToggled(typeof value === "function" ? value(chatOpen) : value);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [chatWidth, setChatWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [isChatResizing, setIsChatResizing] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        setSidebarWidth(Math.max(150, Math.min(e.clientX - 48, 800)));
      } else if (isChatResizing) {
        setChatWidth(Math.max(200, Math.min(window.innerWidth - e.clientX, 800)));
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      setIsChatResizing(false);
    };

    if (isResizing || isChatResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing, isChatResizing]);

  const activeFile = files.find((f) => !f.isExternal && f.path === pathname);

  // Opening a page by URL (or via a link) adds its tab.
  const [trackedId, setTrackedId] = useState<string | undefined>(undefined);
  if (activeFile && activeFile.id !== trackedId) {
    setTrackedId(activeFile.id);
    if (!openTabIds.includes(activeFile.id)) setOpenTabIds([...openTabIds, activeFile.id]);
  }

  const openTabs = openTabIds.map((id) => files.find((f) => f.id === id)).filter((f): f is FileTab => !!f);

  const closeMobilePanels = () => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      setSidebarOpen(false);
      setChatOpen(false);
    }
  };

  const openTab = (file: FileTab) => {
    if (file.isExternal) {
      window.open(file.path, "_blank", "noopener,noreferrer");
      return;
    }
    if (!openTabIds.includes(file.id)) setOpenTabIds((prev) => [...prev, file.id]);
    router.push(file.path);
    closeMobilePanels();
  };

  const closeTab = (fileId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const remaining = openTabIds.filter((id) => id !== fileId);
    if (remaining.length === 0) {
      if (homeFile) {
        setOpenTabIds([homeFile.id]);
        router.push(homeFile.path);
      }
      return;
    }
    setOpenTabIds(remaining);
    if (activeFile?.id === fileId) {
      const last = files.find((f) => f.id === remaining[remaining.length - 1]);
      if (last) router.push(last.path);
    }
  };

  const handleActivityChange = (activity: string) => {
    if (activity === "copilot") {
      setChatOpen((open) => {
        if (!open && window.innerWidth <= MOBILE_BREAKPOINT) setSidebarOpen(false);
        return !open;
      });
      return;
    }
    if (activity === activeActivity) {
      setSidebarOpen((open) => !open);
    } else {
      setActiveActivity(activity);
      setSidebarOpen(true);
      if (window.innerWidth <= MOBILE_BREAKPOINT) setChatOpen(false);
    }
  };

  return (
    <div className="vscode-root fade-in">
      <div className="vscode-body">
        <ActivityBar
          items={items}
          settings={settings}
          activeActivity={activeActivity}
          onActivityChange={handleActivityChange}
          chatOpen={chatOpen}
          activePath={pathname}
          sidebarOpen={sidebarOpen}
          onOpenRoute={(route) => {
            const file = files.find((f) => f.path === route && !f.isExternal);
            if (file) openTab(file);
          }}
        />

        {(sidebarToggled ?? true) && (
          <div className={`panel-slot${sidebarToggled === null ? " panel-default-desktop" : ""}`}>
            <Sidebar
              items={items}
              files={files}
              skillCategories={skillCategories}
              currentPath={pathname}
              onFileClick={openTab}
              activeActivity={activeActivity}
              width={sidebarWidth}
            />
            <div
              className={`sidebar-resizer ${isResizing ? "is-resizing" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
            />
          </div>
        )}

        <div className="vscode-editor-area">
          <TabBar tabs={openTabs} activeTabId={activeFile?.id} onTabClick={(tab) => router.push(tab.path)} onTabClose={closeTab} />

          <div className="vscode-editor-content">
            <div className="fade-in editor-frame">
              <div className="editor-scroll">{children}</div>
              {bottomPanelOpen && <BottomPanel onClose={() => setBottomPanelOpen(false)} whoami={settings.terminal_whoami} />}
            </div>
          </div>
        </div>

        {(chatToggled ?? true) && (
          <div className={`panel-slot${chatToggled === null ? " panel-default-desktop" : ""}`}>
            <div
              className={`sidebar-resizer ${isChatResizing ? "is-resizing" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsChatResizing(true);
              }}
            />
            <AIChat
              onClose={() => setChatOpen(false)}
              width={chatWidth}
              greeting={{ tr: settings.chat_greeting_tr, en: settings.chat_greeting_en }}
            />
          </div>
        )}
      </div>

      <StatusBar language={activeFile?.language ?? "Markdown"} onTogglePanel={() => setBottomPanelOpen(!bottomPanelOpen)} />
    </div>
  );
}
