"use client";

import { VscFiles, VscCode, VscCopilot, VscGithub, VscMail, VscPerson } from "react-icons/vsc";
import { FaLinkedin, FaMedium } from "react-icons/fa";
import { TbFileCv } from "react-icons/tb";
import { Icon } from "@/lib/icons";
import { nodeName, type ExplorerItem } from "@/lib/cms/types";
import LanguageMenu from "./LanguageMenu";
import { useLanguage } from "./LanguageContext";
import { sortItems, type LayoutSettings } from "./constants";

interface ActivityBarProps {
  items: ExplorerItem[];
  settings: LayoutSettings;
  activeActivity: string;
  onActivityChange: (activity: string) => void;
  onOpenRoute: (route: string) => void;
  chatOpen: boolean;
  activePath: string;
  sidebarOpen: boolean;
}

const LABELS = {
  explorer: { tr: "Gezgin", en: "Explorer" },
  technologies: { tr: "Teknolojiler", en: "Technologies" },
  about: { tr: "Hakkımda", en: "About Me" },
  email: { tr: "E-posta", en: "Email" },
};

interface Activity {
  id: string;
  label: string;
  icon: React.ReactNode;
  route?: string;
}

export default function ActivityBar({ items, settings, activeActivity, onActivityChange, onOpenRoute, chatOpen, activePath, sidebarOpen }: ActivityBarProps) {
  const { language } = useLanguage();
  const hasRoute = (route: string) => items.some((i) => i.kind === "file" && i.route === route && i.file_type !== "link");
  const cv: Activity | null = hasRoute("/cv") ? { id: "cv", label: "CV", route: "/cv", icon: <TbFileCv size={26} strokeWidth={1.5} /> } : null;
  const copilot: Activity = { id: "copilot", label: "BuğrAI", icon: <VscCopilot size={24} /> };

  const desktop: Activity[] = [
    { id: "explorer", label: LABELS.explorer[language], icon: <VscFiles size={24} /> },
    { id: "technologies", label: LABELS.technologies[language], icon: <VscCode size={24} /> },
    ...(cv ? [cv] : []),
    copilot,
  ];

  // On phones every top-level folder gets its own tab, like the original layout.
  const homeFolderId = items.find((i) => i.route === "/")?.parent_id ?? null;
  const folders = sortItems(items.filter((i) => i.kind === "folder" && i.parent_id === null && i.show_in_explorer && i.id !== homeFolderId));
  const mobile: Activity[] = [
    ...(hasRoute("/") ? [{ id: "about", label: LABELS.about[language], route: "/", icon: <VscPerson size={24} /> }] : []),
    ...(cv ? [cv] : []),
    ...folders.map((f) => ({ id: f.id, label: nodeName(f, language), icon: <Icon name={f.icon || "folder"} size={24} color="currentColor" /> })),
    copilot,
  ];

  const social = [
    settings.linkedin_url && { id: "linkedin", label: "LinkedIn", href: settings.linkedin_url, icon: <FaLinkedin size={20} /> },
    settings.github_url && { id: "github", label: "GitHub", href: settings.github_url, icon: <VscGithub size={22} /> },
    settings.medium_url && { id: "medium", label: "Medium", href: settings.medium_url, icon: <FaMedium size={20} /> },
    settings.email && { id: "email", label: LABELS.email[language], href: `mailto:${settings.email}`, icon: <VscMail size={22} /> },
  ].filter(Boolean) as { id: string; label: string; href: string; icon: React.ReactNode }[];

  const isMobileActive = (a: Activity) => {
    if (a.id === "copilot") return chatOpen;
    if (a.route) return activePath === a.route && !sidebarOpen && !chatOpen;
    return sidebarOpen && activeActivity === a.id;
  };

  const activate = (a: Activity) => (a.route ? onOpenRoute(a.route) : onActivityChange(a.id));

  return (
    <nav className="vscode-activitybar" aria-label="Activity bar">
      <div className="activitybar-top">
        {desktop.map((a) => (
          <button
            type="button"
            key={`desktop-${a.id}`}
            className={`activity-item desktop-only${activeActivity === a.id ? " active" : ""}`}
            onClick={() => activate(a)}
            aria-label={a.label}
            aria-pressed={a.id === "copilot" ? chatOpen : undefined}
          >
            {a.icon}
            <span className="activity-tooltip">{a.label}</span>
          </button>
        ))}

        {mobile.map((a) => (
          <button
            type="button"
            key={`mobile-${a.id}`}
            className={`activity-item mobile-only${isMobileActive(a) ? " mobile-active" : ""}`}
            onClick={() => activate(a)}
            aria-label={a.label}
          >
            {a.icon}
          </button>
        ))}

        <LanguageMenu className="mobile-only" />
      </div>
      <div className="activitybar-middle desktop-only">
        <LanguageMenu />
      </div>
      <div className="activitybar-bottom">
        {social.map((s) => (
          <a
            key={s.id}
            className="activity-item"
            href={s.href}
            target={s.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={s.label}
          >
            {s.icon}
            <span className="activity-tooltip">{s.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
