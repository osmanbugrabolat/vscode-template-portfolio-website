import CodeEditor, { KW, STR, CMT, TYPE, VAR, PROP, PUNCT, PLAIN } from "@/components/ui/CodeEditor";
import { Icon } from "@/lib/icons";
import type { SkillCategory } from "@/lib/cms/types";

function SkillGroup({ category }: { category: SkillCategory }) {
  return (
    <div className="skill-group-inline">
      {category.skills.map((skill) => (
        <div key={skill.id} className="skill-item">
          <span className="skill-icon" style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 10, color: "#e2e8f0" }}>
            <Icon name={skill.icon} size={18} color="#e2e8f0" />
          </span>
          <span className="skill-name">&quot;{skill.name}&quot;</span>
          <div className="skill-bar-bg" role="meter" aria-valuenow={skill.level} aria-valuemin={0} aria-valuemax={100} aria-label={skill.name}>
            <div className="skill-bar-fill" style={{ width: `${skill.level}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SkillsView({ categories }: { categories: SkillCategory[] }) {
  const lines: React.ReactNode[] = [
    <CMT key="c1" c="// =================================================" />,
    <CMT key="c2" c="// skills.ts — Technical Skills & Proficiency" />,
    <CMT key="c3" c="// =================================================" />,
    <PLAIN key="e1" c="" />,
    <span key="i1">
      <KW c="import" /> <PLAIN c=" " />
      <PUNCT c="{ " />
      <TYPE c="SkillSet" />
      <PUNCT c=" }" /> <KW c="from" /> <STR c='"@/types"' />
      <PUNCT c=";" />
    </span>,
    <PLAIN key="e2" c="" />,
    <span key="o1">
      <KW c="const" /> <VAR c="skills" />
      <PUNCT c=":" /> <TYPE c="SkillSet" /> <PUNCT c="= {" />
    </span>,
  ];
  const widgets: { afterLine: number; element: React.ReactNode }[] = [];

  categories.forEach((category) => {
    const base = lines.length;
    lines.push(
      <span key={`${category.id}-head`}>
        <PLAIN c="  " />
        <PROP c={category.key} />
        <PUNCT c=":" /> <TYPE c={category.type_name} /> <PUNCT c="[" />
      </span>,
      <span key={`${category.id}-names`}>
        <PLAIN c="    " />
        <CMT c={`// ${category.skills.map((s) => s.name).join(", ")}`} />
      </span>,
      <span key={`${category.id}-close`}>
        <PLAIN c="  " />
        <PUNCT c="]," />
      </span>,
    );
    widgets.push({ afterLine: base + 1, element: <SkillGroup category={category} /> });
  });

  lines.push(
    <PUNCT key="close" c="};" />,
    <PLAIN key="e3" c="" />,
    <span key="exp">
      <KW c="export" /> <PUNCT c="{ " />
      <VAR c="skills" /> <PUNCT c="};" />
    </span>,
  );

  return <CodeEditor lines={lines} widgets={widgets} />;
}
