"use client";

import { useState } from "react";
import { Icon } from "@/lib/icons";
import { pick, nodeName, type ExplorerItem, type SkillCategory } from "@/lib/cms/types";
import { useLanguage } from "./LanguageContext";
import { sortItems, type FileTab } from "./constants";

export interface SidebarProps {
  items: ExplorerItem[];
  files: FileTab[];
  skillCategories: SkillCategory[];
  currentPath: string;
  onFileClick: (file: FileTab) => void;
  activeActivity?: string;
  width?: number;
}

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
    aria-hidden
    style={{ color: "#bbb", transition: "transform 0.15s ease", transform: open ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}
  >
    <polyline points="6,4 10,8 6,12" />
  </svg>
);

const FolderSvg = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="#dcb67a" style={{ flexShrink: 0 }} aria-hidden>
    <path d="M1.5 3A.5.5 0 001 3.5v9a.5.5 0 00.5.5h13a.5.5 0 00.5-.5V6a.5.5 0 00-.5-.5H7.207L5.854 4.146A.5.5 0 005.5 4H2a.5.5 0 00-.5.5V3z" />
  </svg>
);

interface TreeProps {
  item: ExplorerItem;
  depth: number;
  childrenOf: (id: string) => ExplorerItem[];
  fileById: Map<string, FileTab>;
  currentPath: string;
  onFileClick: (file: FileTab) => void;
}

function TreeNode({ item, depth, childrenOf, fileById, currentPath, onFileClick }: TreeProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(depth < 1);
  const paddingLeft = 8 + depth * 12;
  const label = nodeName(item, language);

  if (item.kind === "folder") {
    return (
      <div className="tree-folder" role="treeitem" aria-expanded={open} aria-selected={false}>
        <button type="button" className="tree-folder-header" style={{ paddingLeft }} onClick={() => setOpen((o) => !o)}>
          <ChevronIcon open={open} />
          <FolderSvg />
          <span className="tree-label">{label}</span>
        </button>
        {open && (
          <div role="group">
            {childrenOf(item.id).map((child) => (
              <TreeNode
                key={child.id}
                item={child}
                depth={depth + 1}
                childrenOf={childrenOf}
                fileById={fileById}
                currentPath={currentPath}
                onFileClick={onFileClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const file = fileById.get(item.id);
  if (!file) return null;
  const isActive = !file.isExternal && file.path === currentPath;

  return (
    <button
      type="button"
      role="treeitem"
      aria-selected={isActive}
      aria-current={isActive ? "page" : undefined}
      className={`tree-file${isActive ? " active" : ""}`}
      style={{ paddingLeft }}
      onClick={() => onFileClick(file)}
      title={file.isExternal ? file.path : undefined}
    >
      <span className="tree-icon">
        <Icon name={file.icon} size={file.icon === "play" ? 12 : 14} />
      </span>
      <span className="tree-label">{label}</span>
    </button>
  );
}

export default function Sidebar({ items, files, skillCategories, currentPath, onFileClick, activeActivity = "explorer", width }: SidebarProps) {
  const { language } = useLanguage();
  const style = width ? { width } : undefined;

  if (activeActivity === "technologies") {
    return (
      <div className="vscode-sidebar" style={style}>
        <div className="sidebar-header">{language === "tr" ? "TEKNOLOJİLER" : "TECHNOLOGIES"}</div>
        <div className="sidebar-body tech-sidebar">
          {skillCategories.map((category) => (
            <div key={category.id} className="tech-group">
              <h3 className="tech-group-title">{pick(category.label_tr, category.label_en, language)}</h3>
              <ul className="tech-list">
                {category.skills.map((skill) => (
                  <li key={skill.id} className="tech-row">
                    <div className="tech-row-head">
                      <Icon name={skill.icon} size={14} color="var(--sidebar-fg)" />
                      <span>{skill.name}</span>
                    </div>
                    <div className="tech-bar">
                      <div className="tech-bar-fill" style={{ width: `${skill.level}%` }} />
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

  const visible = items.filter((i) => i.show_in_explorer);
  const childrenOf = (parentId: string | null) => sortItems(visible.filter((i) => i.parent_id === parentId));
  const fileById = new Map(files.map((f) => [f.id, f]));

  let roots = childrenOf(null);
  let header = "Explorer";
  let depth = 1;
  const folder = activeActivity !== "explorer" ? visible.find((i) => i.id === activeActivity && i.kind === "folder") : undefined;
  if (folder) {
    roots = childrenOf(folder.id);
    header = nodeName(folder, language).toUpperCase();
    depth = 0;
  }

  return (
    <div className="vscode-sidebar" style={style}>
      <div className="sidebar-header">{header}</div>
      <div className="sidebar-body">
        <div className="file-tree" role="tree" aria-label={header}>
          {!folder && (
            <div className="tree-root-header">
              <ChevronIcon open />
              <span>MY-PORTFOLIO-WEBSITE</span>
            </div>
          )}
          {roots.map((item) => (
            <TreeNode
              key={item.id}
              item={item}
              depth={depth}
              childrenOf={childrenOf}
              fileById={fileById}
              currentPath={currentPath}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
