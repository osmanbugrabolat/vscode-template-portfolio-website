"use client";

import { useState } from "react";
import { ALL_FILES, FileTab } from "./constants";
import { skills } from "@/data/portfolio";
import {
  SiTypescript,
  SiJavascript,
  SiPython,
  SiHtml5,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiFramer,
  SiNodedotjs,
  SiExpress,
  SiPrisma,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiGithub,
  SiDocker,
  SiFigma,
  SiLinux,
  SiPytorch,
  SiOpencv,
  SiScikitlearn,
} from "react-icons/si";
import { FaDatabase, FaNetworkWired, FaRobot, FaLinkedin, FaMedium, FaPlay } from "react-icons/fa";
import { VscCode, VscFileMedia, VscGithub, VscMail } from "react-icons/vsc";

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
        children: [

          {
            name: "pong-with-mediapipe",
            children: ALL_FILES.filter(f => f.id.startsWith("project-5-")).map((f) => ({ name: f.name, file: f })),
          },
          {
            name: "flying-birds-with-mediapipe",
            children: ALL_FILES.filter(f => f.id.startsWith("project-6-")).map((f) => ({ name: f.name, file: f })),
          },
          {
            name: "sihirli-sapan",
            children: ALL_FILES.filter(f => f.id.startsWith("project-7-")).map((f) => ({ name: f.name, file: f })),
          },
          {
            name: "sihirli-sapan-hsd-edition",
            children: ALL_FILES.filter(f => f.id.startsWith("project-8-")).map((f) => ({ name: f.name, file: f })),
          },
          {
            name: "magic-frame",
            children: ALL_FILES.filter(f => f.id.startsWith("project-9-")).map((f) => ({ name: f.name, file: f })),
          },
          {
            name: "kozmik-toz-enstalasyon",
            children: ALL_FILES.filter(f => f.id.startsWith("project-10-")).map((f) => ({ name: f.name, file: f })),
          },
        ]
      },
      {
        name: "articles",
        children: ALL_FILES.filter(f => f.id.startsWith("article-")).map((f) => ({ name: f.name, file: f })),
      },
      {
        name: "certificates",
        children: ALL_FILES.filter(f => f.id.startsWith("cert-")).map((f) => ({ name: f.name, file: f })),
      },
      {
        name: "contact",
        children: ALL_FILES.filter(f => f.id.startsWith("contact-")).map((f) => ({ name: f.name, file: f })),
      },
    ],
  };
}

export interface SidebarProps {
  currentPath: string;
  openTabs: FileTab[];
  onFileClick: (file: FileTab) => void;
  activeActivity?: string;
  width?: number;
}const ExtIcon = ({ ext }: { ext: string }) => {
  if (ext === "jpg" || ext === "png" || ext === "jpeg") {
    return (
      <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <VscFileMedia size={14} color="#a074c4" />
      </span>
    );
  }

  if (ext === "linkedin") return <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaLinkedin size={14} color="#0077b5" /></span>;
  if (ext === "github") return <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><VscGithub size={14} color="#fafafa" /></span>;
  if (ext === "medium") return <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaMedium size={14} color="#ffffff" /></span>;
  if (ext === "email") return <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><VscMail size={14} color="#a074c4" /></span>;
  if (ext === "play") return <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaPlay size={12} color="#10b981" /></span>;

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
          <span style={{ fontSize: 13, color: "var(--sidebar-fg)", marginLeft: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

  const ext = node.file?.ext || node.name.split(".").pop() || "";
  const isActive = !!node.file && node.file.path === currentPath;

  return (
    <div
      className={`tree-file${isActive ? " active" : ""}`}
      style={{ paddingLeft }}
      onClick={() => node.file && onFileClick(node.file)}
    >
      <ExtIcon ext={ext} />
      <span style={{ fontSize: 13, color: "var(--sidebar-fg)", marginLeft: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {node.name}
      </span>
    </div>
  );
}

const categoryNames: Record<string, string> = {
  ai_ml: "AI-ML",
  cloud: "CLOUD PLATFORMS",
  frontend: "FRONTEND",
  backend: "BACKEND",
  databases: "DATABASES",
  tools: "TOOLS & ENVIRONMENTS",
  ai_tools: "AI TOOLS",
  project_management: "PROJECT MANAGEMENT",
};

export default function Sidebar({ currentPath, onFileClick, activeActivity = "explorer", width }: SidebarProps) {
  // Build tree at render time (inside component), not at module level
  const fileTree = buildFileTree();

  if (activeActivity === "technologies") {
    return (
      <div className="vscode-sidebar" style={width ? { width } : undefined}>
        <div className="sidebar-header">TECHNOLOGIES</div>
        <div className="sidebar-body" style={{ padding: "12px 16px", overflowY: "auto" }}>
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--sidebar-fg)", marginBottom: "12px", fontWeight: "bold", letterSpacing: "0.05em" }}>
                {categoryNames[category] || category.replace("_", " ")}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((skill, i) => {
                  const Icon = skill.icon;
                  return (
                  <li key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {Icon && <Icon size={14} style={{ marginRight: 8, color: "var(--sidebar-fg)" }} />}
                        <span style={{ fontSize: "13px", color: "var(--fg)" }}>{skill.name}</span>
                      </div>
                    </div>
                    <div style={{ width: "100%", height: "4px", backgroundColor: "var(--hover-bg)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${skill.level}%`, height: "100%", backgroundColor: "#007acc" }} />
                    </div>
                  </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="vscode-sidebar" style={width ? { width } : undefined}>
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
