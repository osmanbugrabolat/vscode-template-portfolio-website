import { projects } from "@/data/portfolio";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const projectId = parseInt(params.id, 10);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="w-full h-full overflow-y-auto">
        <div className="markdown-body">
          <h1>Project Not Found</h1>
          <p>The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body">
        <h1>{project.name}</h1>
        <p>
          <span style={{ fontSize: "0.9em", color: "var(--sidebar-fg)" }}>
            {project.year} • {project.status === "active" ? "🟢 Active" : "✅ Completed"}
          </span>
        </p>
        <p>{project.description}</p>
        
        <h2>Tech Stack</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {project.tech.map((tech, i) => (
            <code key={i}>{tech}</code>
          ))}
        </div>

        <h2>Links</h2>
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
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
    </div>
  );
}
