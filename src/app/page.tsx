import { personal } from "@/data/portfolio";
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
        <p>{personal.bio}</p>

        <h2>Current Focus</h2>
        <ul>
          {personal.currentFocus.map((focus, index) => (
            <li key={index}>{focus}</li>
          ))}
        </ul>

        <h2>Tech Stack & Skills</h2>
        <p>I specialize in building applications with modern technologies:</p>
        <ul>
          <li><strong>Languages:</strong> TypeScript, JavaScript, Python, SQL</li>
          <li><strong>Frontend:</strong> React, Next.js, Tailwind CSS, Framer Motion</li>
          <li><strong>Backend:</strong> Node.js, Express, PostgreSQL, Prisma</li>
          <li><strong>AI/ML:</strong> PyTorch, Ultralytics YOLO, OpenCV</li>
        </ul>

        {personal.available && (
          <blockquote style={{ marginTop: "32px" }}>
            <p>🌟 <strong>Currently open for new opportunities!</strong> Feel free to reach out via email or LinkedIn.</p>
          </blockquote>
        )}
      </div>
    </div>
  );
}
