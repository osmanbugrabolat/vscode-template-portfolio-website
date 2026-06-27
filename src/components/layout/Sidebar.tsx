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
import { FaDatabase, FaNetworkWired, FaRobot, FaLinkedin, FaMedium } from "react-icons/fa";
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
            name: "apart-yonetim-sistemi",
            children: ALL_FILES.filter(f => f.id === "project-1").map((f) => ({ name: f.name, file: f })),
          },
          {
            name: "portfolyo-ai",
            children: ALL_FILES.filter(f => f.id === "project-2").map((f) => ({ name: f.name, file: f })),
          },
          {
            name: "fountain-detection-ai",
            children: ALL_FILES.filter(f => f.id === "project-3").map((f) => ({ name: f.name, file: f })),
          },
          {
            name: "web-scraper",
            children: ALL_FILES.filter(f => f.id === "project-4").map((f) => ({ name: f.name, file: f })),
          },
        ]
      },
      {
        name: "articles",
        children: ALL_FILES.filter(f => ["articles-readme"].includes(f.id)).map((f) => ({ name: f.name, file: f })),
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

const getSkillIcon = (name: string) => {
  const iconProps = { size: 14, style: { marginRight: 8, color: "var(--sidebar-fg)" } };
  switch (name) {
    case "TypeScript": return <SiTypescript {...iconProps} color="#3178C6" />;
    case "JavaScript": return <SiJavascript {...iconProps} color="#F7DF1E" />;
    case "Python": return <SiPython {...iconProps} color="#3776AB" />;
    case "SQL": return <FaDatabase {...iconProps} color="#336791" />;
    case "HTML/CSS": return <SiHtml5 {...iconProps} color="#E34F26" />;
    case "React": return <SiReact {...iconProps} color="#61DAFB" />;
    case "Next.js": return <SiNextdotjs {...iconProps} color="#ffffff" />;
    case "Tailwind CSS": return <SiTailwindcss {...iconProps} color="#06B6D4" />;
    case "Framer Motion": return <SiFramer {...iconProps} color="#0055FF" />;
    case "Node.js": return <SiNodedotjs {...iconProps} color="#339933" />;
    case "Express.js": return <SiExpress {...iconProps} color="#ffffff" />;
    case "Prisma ORM": return <SiPrisma {...iconProps} color="#2D3748" />;
    case "REST APIs": return <FaNetworkWired {...iconProps} />;
    case "PostgreSQL": return <SiPostgresql {...iconProps} color="#4169E1" />;
    case "MongoDB": return <SiMongodb {...iconProps} color="#47A248" />;
    case "Redis": return <SiRedis {...iconProps} color="#DC382D" />;
    case "Git & GitHub": return <SiGithub {...iconProps} color="#ffffff" />;
    case "Docker": return <SiDocker {...iconProps} color="#2496ED" />;
    case "VS Code": return <VscCode {...iconProps} color="#007ACC" />;
    case "Figma": return <SiFigma {...iconProps} color="#F24E1E" />;
    case "Linux/macOS": return <SiLinux {...iconProps} color="#FCC624" />;
    case "PyTorch": return <SiPytorch {...iconProps} color="#EE4C2C" />;
    case "Ultralytics YOLO": return <FaRobot {...iconProps} color="#00FFFF" />;
    case "OpenCV": return <SiOpencv {...iconProps} color="#5C3EE8" />;
    case "Scikit-learn": return <SiScikitlearn {...iconProps} color="#F7931E" />;
    default: return null;
  }
};

export default function Sidebar({ currentPath, onFileClick, activeActivity = "explorer", width }: SidebarProps) {
  // Build tree at render time (inside component), not at module level
  const fileTree = buildFileTree();

  if (activeActivity === "technologies") {
    return (
      <div className="vscode-sidebar" style={width ? { width } : undefined}>
        <div className="sidebar-header">Technologies</div>
        <div className="sidebar-body" style={{ padding: "12px 16px", overflowY: "auto" }}>
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--sidebar-fg)", marginBottom: "12px", fontWeight: "bold", letterSpacing: "0.05em" }}>
                {category.replace("_", " ")}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((skill, i) => (
                  <li key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {getSkillIcon(skill.name)}
                        <span style={{ fontSize: "13px", color: "var(--fg)" }}>{skill.name}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--sidebar-fg)" }}>
                        {skill.level}%
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "4px", backgroundColor: "var(--hover-bg)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${skill.level}%`, height: "100%", backgroundColor: "#007acc" }} />
                    </div>
                  </li>
                ))}
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
