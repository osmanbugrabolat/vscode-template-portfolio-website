import CodeEditor, {
  KW,
  STR,
  CMT,
  TYPE,
  FUNC,
  VAR,
  PROP,
  PUNCT,
  PLAIN,
} from "@/components/ui/CodeEditor";
import { experience, education } from "@/data/portfolio";

const ExperienceCard = ({
  exp,
}: {
  exp: (typeof experience)[number];
}) => (
  <div className="experience-card-inline">
    <div className="exp-header">
      <span className="exp-position">{exp.position}</span>
      <span className="exp-duration">{exp.duration}</span>
    </div>
    <div className="exp-company">
      @ {exp.company} · {exp.location}
    </div>
    <p className="exp-description">{exp.description}</p>
    <ul className="exp-highlights">
      {exp.highlights.map((h, i) => (
        <li key={i}>{h}</li>
      ))}
    </ul>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {exp.tech.map((t) => (
        <span key={t} className="tech-badge">{t}</span>
      ))}
    </div>
  </div>
);

const lines: React.ReactNode[] = [
  <CMT key="c1" c="// =================================================" />,
  <CMT key="c2" c="// experience.ts — Work History & Education" />,
  <CMT key="c3" c="// =================================================" />,
  <PLAIN key="e1" c="" />,
  <span key="i1">
    <KW c="import" /> <PLAIN c=" " />
    <PUNCT c="{ " />
    <TYPE c="Experience" />
    <PUNCT c=", " />
    <TYPE c="Education" />
    <PUNCT c=" }" />
    <PLAIN c=" " />
    <KW c="from" />
    <PLAIN c=" " />
    <STR c='"@/types"' />
    <PUNCT c=";" />
  </span>,
  <PLAIN key="e2" c="" />,
  <CMT key="edu-comment" c="// ——— Education ———" />,
  <span key="edu1">
    <KW c="const" />
    <PLAIN c=" " />
    <VAR c="education" />
    <PUNCT c=":" />
    <PLAIN c=" " />
    <TYPE c="Education" />
    <PLAIN c=" " />
    <PUNCT c="= {" />
  </span>,
  <span key="edu2">
    <PLAIN c="  " />
    <PROP c="degree" />
    <PUNCT c=":  " />
    <STR c={`"${education.degree}"`} />
    <PUNCT c="," />
  </span>,
  <span key="edu3">
    <PLAIN c="  " />
    <PROP c="school" />
    <PUNCT c=":  " />
    <STR c={`"${education.school}"`} />
    <PUNCT c="," />
  </span>,
  <span key="edu4">
    <PLAIN c="  " />
    <PROP c="year" />
    <PUNCT c=":    " />
    <STR c={`"${education.year}"`} />
    <PUNCT c="," />
  </span>,
  <span key="edu5">
    <PLAIN c="  " />
    <PROP c="gpa" />
    <PUNCT c=":     " />
    <STR c={`"${education.gpa}"`} />
    <PUNCT c="," />
  </span>,
  <PUNCT key="edu-close" c="};" />,
  <PLAIN key="e3" c="" />,
  <CMT key="exp-comment" c="// ——— Work Experience ———" />,
  <span key="exp-decl">
    <KW c="const" />
    <PLAIN c=" " />
    <VAR c="experience" />
    <PUNCT c=":" />
    <PLAIN c=" " />
    <TYPE c="Experience" />
    <PUNCT c="[]" />
    <PLAIN c=" " />
    <PUNCT c="= [" />
  </span>,
];

const widgets: { afterLine: number; element: React.ReactNode }[] = [];

experience.forEach((exp, idx) => {
  const base = lines.length;

  lines.push(
    <span key={`exp${idx}-1`}>
      <PLAIN c="  " />
      <PUNCT c="{" />
    </span>,
    <span key={`exp${idx}-2`}>
      <PLAIN c="    " />
      <PROP c="company" />
      <PUNCT c=":  " />
      <STR c={`"${exp.company}"`} />
      <PUNCT c="," />
    </span>,
    <span key={`exp${idx}-3`}>
      <PLAIN c="    " />
      <PROP c="position" />
      <PUNCT c=": " />
      <STR c={`"${exp.position}"`} />
      <PUNCT c="," />
    </span>,
    <span key={`exp${idx}-4`}>
      <PLAIN c="    " />
      <PROP c="duration" />
      <PUNCT c=": " />
      <STR c={`"${exp.duration}"`} />
      <PUNCT c="," />
    </span>,
    <span key={`exp${idx}-5`}>
      <PLAIN c="  " />
      <PUNCT c="}," />
    </span>
  );

  widgets.push({ afterLine: base + 1, element: <ExperienceCard exp={exp} /> });
});

lines.push(<PUNCT key="close" c="];" />);
lines.push(<PLAIN key="e4" c="" />);
lines.push(
  <span key="export">
    <KW c="export" />
    <PLAIN c=" " />
    <PUNCT c="{ " />
    <VAR c="experience" />
    <PUNCT c=", " />
    <VAR c="education" />
    <PLAIN c=" " />
    <PUNCT c="};" />
  </span>
);

export default function ExperiencePage() {
  return <CodeEditor lines={lines} widgets={widgets} />;
}
