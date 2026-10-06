import CodeEditor, { KW, STR, CMT, TYPE, VAR, PROP, PUNCT, PLAIN } from "@/components/ui/CodeEditor";
import type { Lang } from "@/lib/chatbot/types";
import { pick, type Experience, type SiteSettings } from "@/lib/cms/types";

/** JSON.stringify keeps quotes/backslashes in user text from breaking the fake source view. */
const q = (s: string) => JSON.stringify(s);

function ExperienceCard({ exp, lang }: { exp: Experience; lang: Lang }) {
  const location = pick(exp.location_tr, exp.location_en, lang);
  return (
    <div className="experience-card-inline">
      <div className="exp-header">
        <span className="exp-position">{pick(exp.position_tr, exp.position_en, lang)}</span>
        <span className="exp-duration">{pick(exp.duration_tr, exp.duration_en, lang)}</span>
      </div>
      <div className="exp-company">
        @ {exp.company}
        {location && ` · ${location}`}
      </div>
      <p className="exp-description">{pick(exp.description_tr, exp.description_en, lang)}</p>
      <ul className="exp-highlights">
        {pick(exp.highlights_tr, exp.highlights_en, lang).map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {exp.tech.map((t) => (
          <span key={t} className="tech-badge">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ExperienceView({ experiences, settings, lang }: { experiences: Experience[]; settings: SiteSettings; lang: Lang }) {
  const field = (key: string, pad: string, value: string, k: string) => (
    <span key={k}>
      <PLAIN c="  " />
      <PROP c={key} />
      <PUNCT c={`:${pad}`} />
      <STR c={q(value)} />
      <PUNCT c="," />
    </span>
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
      <PUNCT c=" }" /> <KW c="from" /> <STR c='"@/types"' />
      <PUNCT c=";" />
    </span>,
    <PLAIN key="e2" c="" />,
    <CMT key="edu-comment" c="// ——— Education ———" />,
    <span key="edu1">
      <KW c="const" /> <VAR c="education" />
      <PUNCT c=":" /> <TYPE c="Education" /> <PUNCT c="= {" />
    </span>,
    field("degree", "  ", pick(settings.education_degree_tr, settings.education_degree_en, lang), "edu2"),
    field("school", "  ", settings.education_school, "edu3"),
    field("year", "    ", settings.education_years, "edu4"),
    field("gpa", "     ", settings.education_gpa, "edu5"),
    <PUNCT key="edu-close" c="};" />,
    <PLAIN key="e3" c="" />,
    <CMT key="exp-comment" c="// ——— Work Experience ———" />,
    <span key="exp-decl">
      <KW c="const" /> <VAR c="experience" />
      <PUNCT c=":" /> <TYPE c="Experience" />
      <PUNCT c="[]" /> <PUNCT c="= [" />
    </span>,
  ];

  const widgets: { afterLine: number; element: React.ReactNode }[] = [];
  experiences.forEach((exp) => {
    const base = lines.length;
    const inner = (key: string, pad: string, value: string, k: string) => (
      <span key={k}>
        <PLAIN c="    " />
        <PROP c={key} />
        <PUNCT c={`:${pad}`} />
        <STR c={q(value)} />
        <PUNCT c="," />
      </span>
    );
    lines.push(
      <span key={`${exp.id}-1`}>
        <PLAIN c="  " />
        <PUNCT c="{" />
      </span>,
      inner("company", "  ", exp.company, `${exp.id}-2`),
      inner("position", " ", pick(exp.position_tr, exp.position_en, lang), `${exp.id}-3`),
      inner("duration", " ", pick(exp.duration_tr, exp.duration_en, lang), `${exp.id}-4`),
      <span key={`${exp.id}-5`}>
        <PLAIN c="  " />
        <PUNCT c="}," />
      </span>,
    );
    widgets.push({ afterLine: base + 1, element: <ExperienceCard exp={exp} lang={lang} /> });
  });

  lines.push(
    <PUNCT key="close" c="];" />,
    <PLAIN key="e4" c="" />,
    <span key="export">
      <KW c="export" /> <PUNCT c="{ " />
      <VAR c="experience" />
      <PUNCT c=", " />
      <VAR c="education" /> <PUNCT c="};" />
    </span>,
  );

  return <CodeEditor lines={lines} widgets={widgets} />;
}
