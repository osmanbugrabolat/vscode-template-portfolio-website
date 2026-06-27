import { personal } from "@/data/portfolio";
import { FaGithub, FaLinkedin, FaEnvelope, FaMedium } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body">
        <h1>Contact & Connect 📬</h1>
        <p>I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.</p>

        <h2>Get in Touch</h2>
        <p>The best way to reach me is via email. I usually respond within 24-48 hours.</p>
        
        <ul>
          <li>
            <strong>Email:</strong> <a href={`mailto:${personal.email}`}>{personal.email}</a>
          </li>
          <li>
            <strong>Location:</strong> {personal.location}
          </li>
        </ul>

        <h2>Social Profiles</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          <a href={personal.linkedin} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaLinkedin size={20} /> LinkedIn Profile
          </a>
          <a href={personal.github} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaGithub size={20} /> GitHub Repositories
          </a>
          <a href={personal.medium} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaMedium size={20} /> Medium Articles
          </a>
        </div>

        <blockquote style={{ marginTop: "40px" }}>
          <p>
            <em>"Code is like humor. When you have to explain it, it’s bad."</em> – Cory House
          </p>
        </blockquote>
      </div>
    </div>
  );
}
