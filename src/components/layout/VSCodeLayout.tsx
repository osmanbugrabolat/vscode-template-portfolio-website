"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import ActivityBar from "./ActivityBar";
import TabBar from "./TabBar";
import StatusBar from "./StatusBar";
import AIChat from "./AIChat";
import { ALL_FILES, FileTab } from "./constants";

export default function VSCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [activeActivity, setActiveActivity] = useState("explorer");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openTabs, setOpenTabs] = useState<FileTab[]>([]);
  const [chatOpen, setChatOpen] = useState(true);

  const activeFile =
    ALL_FILES.find((f) => f.path === pathname) || ALL_FILES[0];

  useEffect(() => {
    setOpenTabs((prev) => {
      if (!prev.find((t) => t.id === activeFile.id)) {
        return [...prev, activeFile];
      }
      return prev;
    });
  }, [activeFile]);

  const openTab = (file: FileTab) => {
    if (!openTabs.find((t) => t.id === file.id)) {
      setOpenTabs((prev) => [...prev, file]);
    }
    router.push(file.path);
  };

  const closeTab = (fileId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newTabs = openTabs.filter((t) => t.id !== fileId);
    if (newTabs.length === 0) {
      setOpenTabs([ALL_FILES[0]]);
      router.push(ALL_FILES[0].path);
      return;
    }
    setOpenTabs(newTabs);
    if (activeFile.id === fileId) {
      router.push(newTabs[newTabs.length - 1].path);
    }
  };

  const handleActivityChange = (activity: string) => {
    if (activity === "copilot") {
      setChatOpen((o) => !o);
    } else {
      if (activity === activeActivity) {
        setSidebarOpen((o) => !o);
      } else {
        setActiveActivity(activity);
        setSidebarOpen(true);
      }
    }
  };

  return (
    <div className="vscode-root fade-in">

      <div className="vscode-body">
        <ActivityBar
          activeActivity={activeActivity}
          onActivityChange={handleActivityChange}
        />

        {sidebarOpen && (
          <Sidebar
            currentPath={pathname}
            openTabs={openTabs}
            onFileClick={openTab}
          />
        )}

        <div className="vscode-editor-area">
          <TabBar
            tabs={openTabs}
            activeTab={activeFile}
            onTabClick={(tab) => router.push(tab.path)}
            onTabClose={closeTab}
          />

          <div className="vscode-editor-content">
            <div className="fade-in" style={{ width: "100%" }}>
              {children}
            </div>
          </div>
        </div>

        {chatOpen && <AIChat onClose={() => setChatOpen(false)} />}
      </div>

      <StatusBar language={activeFile.language} />
    </div>
  );
}
