"use client";
import { useState } from "react";
import { personal } from "@/data/portfolio";
import {
  VscFiles,
  VscCode,
  VscSparkle,
  VscGithub,
  VscMail,
  VscPerson,
  VscRocket,
  VscBook,
  VscMortarBoard
} from "react-icons/vsc";
import { FaLinkedin, FaMedium } from "react-icons/fa";
import { TbFileCv } from "react-icons/tb";
import { LuBot } from "react-icons/lu";

interface ActivityBarProps {
  activeActivity: string;
  onActivityChange: (activity: string) => void;
  onFileOpen?: (fileId: string) => void;
  chatOpen?: boolean;
  activeFileId?: string;
  sidebarOpen?: boolean;
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

const mobileActivities = [
  {
    id: "about",
    label: "About Me",
    fileId: "about-readme",
    icon: <VscPerson size={24} />,
  },
  {
    id: "cv",
    label: "CV",
    fileId: "cv-file",
    icon: <TbFileCv size={26} strokeWidth={1.5} />,
  },
  {
    id: "projects",
    label: "Projects",
    icon: <VscRocket size={24} />,
  },
  {
    id: "articles",
    label: "Articles",
    icon: <VscBook size={24} />,
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: <VscMortarBoard size={24} />,
  },
  {
    id: "copilot",
    label: "BuğrAI",
    icon: <LuBot size={24} />,
  },
  {
    id: "contact",
    label: "Contact",
    icon: <VscMail size={24} />,
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

export default function ActivityBar({ activeActivity, onActivityChange, onFileOpen, chatOpen, activeFileId, sidebarOpen }: ActivityBarProps) {
  return (
    <div className="vscode-activitybar">
      <div className="activitybar-top">
        {activities.map((activity) => {
          const isActive = activeActivity === activity.id;
          
          let isMobileActive = false;
          if (activity.id === "copilot") {
            isMobileActive = !!chatOpen;
          } else if (activity.fileId) {
            isMobileActive = activeFileId === activity.fileId && !sidebarOpen && !chatOpen;
          } else {
            isMobileActive = !!sidebarOpen && activeActivity === activity.id;
          }

          return (
            <div
              key={`desktop-${activity.id}`}
              className={`activity-item desktop-only${isActive ? " active" : ""}${isMobileActive ? " mobile-active" : ""}`}
              onClick={() => {
                if ('fileId' in activity && activity.fileId && onFileOpen) {
                  onFileOpen(activity.fileId);
                } else {
                  onActivityChange(activity.id);
                }
              }}
              title={activity.label}
            >
              {activity.icon}
              <span className="activity-tooltip">{activity.label}</span>
            </div>
          );
        })}

        {mobileActivities.map((activity) => {
          let isMobileActive = false;
          if (activity.id === "copilot") {
            isMobileActive = !!chatOpen;
          } else if (activity.fileId) {
            isMobileActive = activeFileId === activity.fileId && !sidebarOpen && !chatOpen;
          } else {
            isMobileActive = !!sidebarOpen && activeActivity === activity.id;
          }

          return (
            <div
              key={`mobile-${activity.id}`}
              className={`activity-item mobile-only${isMobileActive ? " mobile-active" : ""}`}
              onClick={() => {
                if (activity.fileId && onFileOpen) {
                  onFileOpen(activity.fileId);
                } else {
                  onActivityChange(activity.id);
                }
              }}
              title={activity.label}
            >
              {activity.icon}
            </div>
          );
        })}
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
