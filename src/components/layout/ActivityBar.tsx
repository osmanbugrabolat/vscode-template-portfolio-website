"use client";
import { personal } from "@/data/portfolio";
import {
  VscFiles,
  VscCode,
  VscSparkle,
  VscGithub,
  VscMail,
} from "react-icons/vsc";
import { FaLinkedin, FaMedium } from "react-icons/fa";

interface ActivityBarProps {
  activeActivity: string;
  onActivityChange: (activity: string) => void;
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
    id: "copilot",
    label: "Copilot",
    icon: <VscSparkle size={24} />,
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

export default function ActivityBar({ activeActivity, onActivityChange }: ActivityBarProps) {
  return (
    <div className="vscode-activitybar">
      <div className="activitybar-top">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`activity-item${activeActivity === activity.id ? " active" : ""}`}
            onClick={() => {
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
            {activity.badge && (
              <span className="activity-badge">{activity.badge}</span>
            )}
            <span className="activity-tooltip">{activity.label}</span>
          </div>
        ))}
      </div>
      <div className="activitybar-bottom">
        {bottomActivities.map((activity) => (
          <div
            key={activity.id}
            className={`activity-item${activeActivity === activity.id ? " active" : ""}`}
            onClick={() => {
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
