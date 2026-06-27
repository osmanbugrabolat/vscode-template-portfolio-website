import { projects } from "@/data/portfolio";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

export default function ProjectsPage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body">
        <h1>Projects 🚀</h1>
        <p>A selection of some recent projects I've worked on, ranging from full-stack web applications to AI and computer vision experiments.</p>

        {projects.map((project) => (
          <div key={project.id} style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--border-color)" }}>
            <h2>{project.name}</h2>
            <p>
              <span style={{ fontSize: "0.9em", color: "var(--sidebar-fg)" }}>
                {project.year} • {project.status === "active" ? "🟢 Active" : "✅ Completed"}
              </span>
            </p>
            <p>{project.description}</p>
            
            <p><strong>Tech Stack:</strong></p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {project.tech.map((tech, i) => (
                <code key={i}>{tech}</code>
              ))}
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <a href={project.github} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FaGithub /> Source Code
              </a>
              {project.live !== "#" && (
                <a href={project.live} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaExternalLinkAlt /> Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
