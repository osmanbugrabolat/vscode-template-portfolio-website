import { personal, skills } from "@/data/portfolio";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body">
        <h1>Hi, I'm {personal.name} 👋</h1>
        <p>
          <strong>{personal.title}</strong> based in {personal.location}.<br />
          <em>{personal.subtitle}</em>
        </p>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px", marginBottom: "32px" }}>
          <a href={personal.github} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FaGithub /> GitHub
          </a>
          <a href={personal.linkedin} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FaLinkedin /> LinkedIn
          </a>
          <a href={`mailto:${personal.email}`} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FaEnvelope /> Email
          </a>
        </div>

        <h2>About Me</h2>
        <p>
          As a computer engineering graduate ranking 3rd in the Faculty of Technology and 2nd in my department at Selçuk University (graduated in 2026 with a 3.75 GPA), I have aligned my technical focus on integrating Computer Vision and Deep Learning models into cloud infrastructures throughout my studies, and I continue to advance my expertise in these fields.
        </p>
        <p>
          During my undergraduate years, I gained hands-on experience in the automation and deployment of AI-based operational processes based on Docker, CI/CD pipelines, DevOps, and MLOps principles.
        </p>
        <p>
          I combine this strong academic foundation with leadership and communication skills developed through technology community leadership and project management roles. I am a dynamic engineer who quickly adapts to the operational requirements of complex projects, takes responsibility in technical processes, and thrives in collaborative team environments.
        </p>

        <h2>Current Focus</h2>
        <ul>
          {personal.currentFocus.map((focus, index) => (
            <li key={index}>{focus}</li>
          ))}
        </ul>

        <h2>Tech Stack & Ecosystem</h2>
        <p>A high-level overview of the technologies I use to bring ideas to life:</p>
        <ul>
          {Object.entries(skills).map(([category, items]) => {
            const labels: Record<string, string> = {
              ai_ml: "AI-ML",
              cloud: "Cloud",
              frontend: "Frontend",
              backend: "Backend",
              databases: "Databases",
              tools: "Tools",
              ai_tools: "AI Tools",
              project_management: "Project Management"
            };
            const categoryName = labels[category] || category;
            const names = items.map(i => i.name).join(", ");
            return (
              <li key={category}><strong>{categoryName}:</strong> {names}</li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
