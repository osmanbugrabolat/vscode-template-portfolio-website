"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import ActivityBar from "./ActivityBar";
import TabBar from "./TabBar";
import StatusBar from "./StatusBar";
import AIChat from "./AIChat";
import BottomPanel from "./BottomPanel";
import { ALL_FILES, FileTab } from "./constants";

export default function VSCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeActivity, setActiveActivity] = useState("explorer");
  const [openTabs, setOpenTabs] = useState<FileTab[]>([ALL_FILES[0]]);
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [chatWidth, setChatWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [isChatResizing, setIsChatResizing] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Sadece masaüstünde chat penceresini varsayılan olarak açık tut
    if (window.innerWidth > 768) {
      setChatOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        // Activity Bar width is ~48px
        const newWidth = Math.max(150, Math.min(e.clientX - 48, 800));
        setSidebarWidth(newWidth);
      } else if (isChatResizing) {
        const newWidth = Math.max(200, Math.min(window.innerWidth - e.clientX, 800));
        setChatWidth(newWidth);
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
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing, isChatResizing]);

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
    if (file.isExternal) {
      window.open(file.path, "_blank");
      return;
    }
    if (!openTabs.find((t) => t.id === file.id)) {
      setOpenTabs((prev) => [...prev, file]);
    }
    router.push(file.path);
    
    // Auto-close sidebar on mobile
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
      setChatOpen(false);
    }
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
      setChatOpen((o) => {
        if (!o && window.innerWidth <= 768) {
          setSidebarOpen(false);
        }
        return !o;
      });
    } else {
      if (activity === activeActivity) {
        setSidebarOpen((o) => !o);
      } else {
        setActiveActivity(activity);
        setSidebarOpen(true);
        if (window.innerWidth <= 768) {
          setChatOpen(false);
        }
      }
    }
  };

  return (
    <div className="vscode-root fade-in">

      <div className="vscode-body">
        <ActivityBar
          activeActivity={activeActivity}
          onActivityChange={handleActivityChange}
          chatOpen={chatOpen}
          activeFileId={activeFile.id}
          sidebarOpen={sidebarOpen}
          onFileOpen={(fileId) => {
            const file = ALL_FILES.find((f) => f.id === fileId);
            if (file) {
              openTab(file);
              router.push(file.path);
            }
          }}
        />

        {sidebarOpen && (
          <>
            <Sidebar
              currentPath={pathname}
              openTabs={openTabs}
              onFileClick={openTab}
              activeActivity={activeActivity}
              width={sidebarWidth}
            />
            <div 
              className={`sidebar-resizer ${isResizing ? 'is-resizing' : ''}`} 
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
            />
          </>
        )}

        <div className="vscode-editor-area">
          <TabBar
            tabs={openTabs}
            activeTab={activeFile}
            onTabClick={(tab) => router.push(tab.path)}
            onTabClose={closeTab}
          />

          <div className="vscode-editor-content">
            <div className="fade-in" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, minHeight: 0 }}>
              <div style={{ flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column" }}>
                {children}
              </div>
              {bottomPanelOpen && (
                <BottomPanel onClose={() => setBottomPanelOpen(false)} />
              )}
            </div>
          </div>
        </div>

        {chatOpen && (
          <>
            <div 
              className={`sidebar-resizer ${isChatResizing ? 'is-resizing' : ''}`} 
              onMouseDown={(e) => {
                e.preventDefault();
                setIsChatResizing(true);
              }}
            />
            <AIChat onClose={() => setChatOpen(false)} width={chatWidth} />
          </>
        )}
      </div>

      <StatusBar 
        language={activeFile.language} 
        onTogglePanel={() => setBottomPanelOpen(!bottomPanelOpen)} 
      />
    </div>
  );
}
