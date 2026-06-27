import React from "react";

// ============================================================
// Syntax Token Components — VS Code Dark+ colors
// ============================================================

export const KW = ({ c }: { c: string }) => (
  <span className="tk-keyword">{c}</span>
);
export const STR = ({ c }: { c: string }) => (
  <span className="tk-string">{c}</span>
);
export const CMT = ({ c }: { c: string }) => (
  <span className="tk-comment">{c}</span>
);
export const TYPE = ({ c }: { c: string }) => (
  <span className="tk-type">{c}</span>
);
export const FUNC = ({ c }: { c: string }) => (
  <span className="tk-func">{c}</span>
);
export const NUM = ({ c }: { c: string }) => (
  <span className="tk-num">{c}</span>
);
export const VAR = ({ c }: { c: string }) => (
  <span className="tk-var">{c}</span>
);
export const PROP = ({ c }: { c: string }) => (
  <span className="tk-prop">{c}</span>
);
export const PUNCT = ({ c }: { c: string }) => (
  <span className="tk-punct">{c}</span>
);
export const PLAIN = ({ c }: { c: string }) => (
  <span className="tk-plain">{c}</span>
);
export const TAG = ({ c }: { c: string }) => (
  <span className="tk-tag">{c}</span>
);

// ============================================================
// CodeEditor — wraps content with line numbers
// ============================================================

interface CodeEditorProps {
  lines: React.ReactNode[];
  /** insert a React element after a given line index */
  widgets?: { afterLine: number; element: React.ReactNode }[];
}

export default function CodeEditor({ lines, widgets = [] }: CodeEditorProps) {
  const widgetMap = new Map(widgets.map((w) => [w.afterLine, w.element]));

  return (
    <div className="editor-with-lines">
      {/* Line Numbers */}
      <div className="line-numbers-column">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Code + Widgets */}
      <div className="code-area">
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            <div className="code-line">{line}</div>
            {widgetMap.has(i) && widgetMap.get(i)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
