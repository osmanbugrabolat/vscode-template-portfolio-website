"use client";
import { useState } from "react";
import { personal } from "@/data/portfolio";
import {
  VscFiles,
  VscCode,
  VscSparkle,
  VscGithub,
  VscMail,
} from "react-icons/vsc";
import { FaLinkedin, FaMedium } from "react-icons/fa";
import { TbFileCv } from "react-icons/tb";
import { LuBot } from "react-icons/lu";
import { MdTranslate } from "react-icons/md";

interface ActivityBarProps {
  activeActivity: string;
  onActivityChange: (activity: string) => void;
  onFileOpen?: (fileId: string) => void;
}

const activities = [
  {
    id: "explorer",
    label: "Explorer",
    icon: <VscFiles size={24} />,
  },
  {
    id: "technologies",
    label: "Technologies",
    icon: <VscCode size={24} />,
  },
  {
    id: "cv",
    label: "CV",
    fileId: "cv-file",
    icon: <TbFileCv size={26} strokeWidth={1.5} />,
  },
  {
    id: "copilot",
    label: "BuğrAI",
    icon: <LuBot size={24} />,
  },
];

const bottomActivities = [
  {
    id: "linkedin",
    label: "LinkedIn",
    link: personal.linkedin,
    icon: <FaLinkedin size={20} />,
  },
  {
    id: "github",
    label: "GitHub",
    link: personal.github,
    icon: <VscGithub size={22} />,
  },
  {
    id: "medium",
    label: "Medium",
    link: personal.medium,
    icon: <FaMedium size={20} />,
  },
  {
    id: "email",
    label: "Email",
    link: `mailto:${personal.email}`,
    icon: <VscMail size={22} />,
  },

];

export default function ActivityBar({ activeActivity, onActivityChange, onFileOpen }: ActivityBarProps) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState("tr");

  return (
    <div className="vscode-activitybar">
      <div className="activitybar-top">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`activity-item${activeActivity === activity.id ? " active" : ""}`}
            onClick={() => {
              // @ts-expect-error
              if (activity.link) {
                // @ts-expect-error
                window.open(activity.link, "_blank");
              // @ts-expect-error
              } else if (activity.fileId && onFileOpen) {
                // @ts-expect-error
                onFileOpen(activity.fileId);
              } else {
                onActivityChange(activity.id);
              }
            }}
            title={activity.label}
          >
            {activity.icon}
            {activity.badge && (
              <span className="activity-badge">{activity.badge}</span>
            )}
            <span className="activity-tooltip">{activity.label}</span>
          </div>
        ))}
      </div>
      <div className="activitybar-middle" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
        <div
          className={`activity-item${showLangMenu ? " active" : ""}`}
          onClick={() => setShowLangMenu(!showLangMenu)}
          title="Change Language"
        >
          <MdTranslate size={22} />
          <span className="activity-tooltip">Change Language</span>
        </div>

        {showLangMenu && (
          <div style={{
            position: "absolute",
            left: "100%",
            bottom: "0",
            marginLeft: "8px",
            background: "var(--sidebar-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            zIndex: 100,
            width: "120px"
          }}>
            <div 
              onClick={() => { setCurrentLang("tr"); setShowLangMenu(false); }}
              style={{
                padding: "8px 12px",
                fontSize: "12px",
                color: currentLang === "tr" ? "#fff" : "var(--sidebar-fg)",
                background: currentLang === "tr" ? "rgba(255,255,255,0.1)" : "transparent",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                if (currentLang !== "tr") e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (currentLang !== "tr") e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "14px" }}>🇹🇷</span>
              <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.2)" }} />
              <span>Türkçe</span>
            </div>
            
            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "2px 0" }} />

            <div 
              onClick={() => { setCurrentLang("en"); setShowLangMenu(false); }}
              style={{
                padding: "8px 12px",
                fontSize: "12px",
                color: currentLang === "en" ? "#fff" : "var(--sidebar-fg)",
                background: currentLang === "en" ? "rgba(255,255,255,0.1)" : "transparent",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                if (currentLang !== "en") e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (currentLang !== "en") e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "14px" }}>🇺🇸</span>
              <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.2)" }} />
              <span>English</span>
            </div>
          </div>
        )}
      </div>
      <div className="activitybar-bottom">
        {bottomActivities.map((activity) => (
          <div
            key={activity.id}
            className={`activity-item${activeActivity === activity.id ? " active" : ""}`}
            onClick={() => {
              if (activity.id === "language") {
                alert("Language switcher will be implemented here!");
                return;
              }
              // @ts-ignore
              if (activity.link) {
                // @ts-ignore
                window.open(activity.link, "_blank");
              } else {
                onActivityChange(activity.id);
              }
            }}
            title={activity.label}
          >
            {activity.icon}
            <span className="activity-tooltip">{activity.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
