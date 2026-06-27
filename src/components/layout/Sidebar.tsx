"use client";

import { useState } from "react";
import { ALL_FILES, FileTab } from "./constants";

type TreeFile = { name: string; file: FileTab };
type TreeFolder = { name: string; children: (TreeFolder | TreeFile)[] };

function isTreeFolder(node: TreeFolder | TreeFile): node is TreeFolder {
  return "children" in node;
}

function buildFileTree(): TreeFolder {
  return {
    name: "MY-PORTFOLIO-WEBSITE",
    children: [
      {
        name: "about-me",
        children: ALL_FILES.filter(f => ["about-readme"].includes(f.id)).map((f) => ({ name: f.name, file: f })),
      },
      {
        name: "projects",
        children: ALL_FILES.filter(f => ["projects-readme"].includes(f.id)).map((f) => ({ name: f.name, file: f })),
      },
      {
        name: "certificates",
        children: ALL_FILES.filter(f => f.id.startsWith("cert-")).map((f) => ({ name: f.name, file: f })),
      },
      {
        name: "contact",
        children: ALL_FILES.filter(f => ["contact-readme"].includes(f.id)).map((f) => ({ name: f.name, file: f })),
      },
    ],
  };
}

export interface SidebarProps {
  currentPath: string;
  openTabs: FileTab[];
  onFileClick: (file: FileTab) => void;
}const ExtIcon = ({ ext }: { ext: string }) => {
  const map: Record<string, { color: string; letter: string }> = {
    tsx:  { color: "#61dafb", letter: "R"  },
    ts:   { color: "#007acc", letter: "TS" },
    json: { color: "#cbcb41", letter: "{}" },
    md:   { color: "#519aba", letter: "M"  },
  };
  const info = map[ext] || { color: "#888", letter: "F" };
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "9px",
        fontWeight: 700,
        color: info.color,
        width: 16,
        height: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {info.letter}
    </span>
  );
};

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      color: "#bbb",
      transition: "transform 0.15s ease",
      transform: open ? "rotate(90deg)" : "rotate(0deg)",
    }}
  >
    <polyline points="6,4 10,8 6,12" />
  </svg>
);

const FolderSvg = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="#dcb67a" style={{ flexShrink: 0 }}>
    <path d="M1.5 3A.5.5 0 001 3.5v9a.5.5 0 00.5.5h13a.5.5 0 00.5-.5V6a.5.5 0 00-.5-.5H7.207L5.854 4.146A.5.5 0 005.5 4H2a.5.5 0 00-.5.5V3z" />
  </svg>
);

function FileNode({
  node,
  depth,
  currentPath,
  onFileClick,
}: {
  node: TreeFolder | TreeFile;
  depth: number;
  currentPath: string;
  onFileClick: (file: FileTab) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  const paddingLeft = 8 + depth * 12;

  if (isTreeFolder(node)) {
    return (
      <div className="tree-folder">
        <div
          className="tree-folder-header"
          style={{ paddingLeft }}
          onClick={() => setOpen((o) => !o)}
        >
          <ChevronIcon open={open} />
          <FolderSvg />
          <span style={{ fontSize: 13, color: "var(--sidebar-fg)", marginLeft: 3 }}>
            {node.name}
          </span>
        </div>
        {open && (
          <div>
            {node.children.map((child, i) => (
              <FileNode
                key={i}
                node={child}
                depth={depth + 1}
                currentPath={currentPath}
                onFileClick={onFileClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const ext = node.name.split(".").pop() || "";
  const isActive = !!node.file && node.file.path === currentPath;

  return (
    <div
      className={`tree-file${isActive ? " active" : ""}`}
      style={{ paddingLeft }}
      onClick={() => node.file && onFileClick(node.file)}
    >
      <ExtIcon ext={ext} />
      <span style={{ fontSize: 13, color: "var(--sidebar-fg)", marginLeft: 2 }}>
        {node.name}
      </span>
    </div>
  );
}

export default function Sidebar({ currentPath, onFileClick }: SidebarProps) {
  // Build tree at render time (inside component), not at module level
  const fileTree = buildFileTree();

  return (
    <div className="vscode-sidebar">
      <div className="sidebar-header">Explorer</div>
      <div className="sidebar-body">
        <div className="file-tree">
          {/* Root label */}
          <div
            className="tree-folder-header"
            style={{
              paddingLeft: 8,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <ChevronIcon open={true} />
            <span style={{ color: "var(--sidebar-fg)", marginLeft: 4 }}>
              MY-PORTFOLIO-WEBSITE
            </span>
          </div>

          {fileTree.children.map((child, i) => (
            <FileNode
              key={i}
              node={child}
              depth={1}
              currentPath={currentPath}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
