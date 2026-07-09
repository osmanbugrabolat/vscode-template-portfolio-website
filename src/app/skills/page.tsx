import CodeEditor, {
  KW,
  STR,
  CMT,
  TYPE,
  FUNC,
  VAR,
  PROP,
  PUNCT,
  NUM,
  PLAIN,
} from "@/components/ui/CodeEditor";
import { skills } from "@/data/portfolio";

import { IconType } from "react-icons";

const SkillGroup = ({
  title,
  items,
}: {
  title: string;
  items: { name: string; level: number; icon: IconType }[];
}) => (
  <div className="skill-group-inline">
    {items.map((skill) => {
      const Icon = skill.icon;
      return (
        <div key={skill.name} className="skill-item">
          <span className="skill-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '10px', color: '#e2e8f0' }}>
            <Icon size={18} />
          </span>
          <span className="skill-name">&quot;{skill.name}&quot;</span>
          <div className="skill-bar-bg">
            <div
              className="skill-bar-fill"
              style={{ width: `${skill.level}%` }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

type SkillSection = {
  key: keyof typeof skills;
  label: string;
  typeName: string;
};

const sections: SkillSection[] = [
  { key: "ai_ml",     label: "ai_ml",     typeName: "MLTool[]"        },
  { key: "cloud",     label: "cloud",     typeName: "CloudPlatform[]" },
  { key: "frontend",  label: "frontend",  typeName: "Framework[]"     },
  { key: "backend",   label: "backend",   typeName: "Framework[]"     },
  { key: "databases", label: "databases", typeName: "Database[]"      },
  { key: "tools",     label: "tools",     typeName: "Tool[]"          },
  { key: "ai_tools",  label: "ai_tools",  typeName: "AITool[]"        },
  { key: "project_management", label: "project_management", typeName: "PMTool[]" },
];

const lines: React.ReactNode[] = [
  <CMT key="c1" c="// =================================================" />,
  <CMT key="c2" c="// skills.ts — Technical Skills & Proficiency" />,
  <CMT key="c3" c="// =================================================" />,
  <PLAIN key="e1" c="" />,
  <span key="i1">
    <KW c="import" /> <PLAIN c=" " />
    <PUNCT c="{ " />
    <TYPE c="SkillSet" />
    <PUNCT c=" }" />
    <PLAIN c=" " />
    <KW c="from" />
    <PLAIN c=" " />
    <STR c='"@/types"' />
    <PUNCT c=";" />
  </span>,
  <PLAIN key="e2" c="" />,
  <span key="o1">
    <KW c="const" /> <PLAIN c=" " />
    <VAR c="skills" />
    <PUNCT c=":" /> <PLAIN c=" " />
    <TYPE c="SkillSet" />
    <PLAIN c=" " />
    <PUNCT c="= {" />
  </span>,
];

const widgets: { afterLine: number; element: React.ReactNode }[] = [];

sections.forEach((section) => {
  const base = lines.length;

  lines.push(
    <span key={`${section.key}-head`}>
      <PLAIN c="  " />
      <PROP c={section.label} />
      <PUNCT c=":" /> <PLAIN c=" " />
      <TYPE c={section.typeName} />
      <PLAIN c=" " />
      <PUNCT c="[" />
    </span>,
    <span key={`${section.key}-placeholder`}>
      <PLAIN c="    " />
      <CMT c={`// ${skills[section.key].map((s) => s.name).join(", ")}`} />
    </span>,
    <span key={`${section.key}-close`}>
      <PLAIN c="  " />
      <PUNCT c="]," />
    </span>
  );

  widgets.push({
    afterLine: base + 1,
    element: <SkillGroup title={section.label} items={skills[section.key]} />,
  });
});

lines.push(<PUNCT key="close" c="};" />);
lines.push(<PLAIN key="e3" c="" />);
lines.push(
  <span key="exp">
    <KW c="export" />
    <PLAIN c=" " />
    <PUNCT c="{ " />
    <VAR c="skills" />
    <PLAIN c=" " />
    <PUNCT c="};" />
  </span>
);

export default function SkillsPage() {
  return <CodeEditor lines={lines} widgets={widgets} />;
}
