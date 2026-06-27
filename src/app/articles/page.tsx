export default function ArticlesPage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body">
        <h1>Articles 📝</h1>
        <p>I enjoy sharing what I learn and writing about my journey in tech. Here are some of my recent articles.</p>

        <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--border-color)" }}>
          <h2><a href="#" style={{ color: "var(--token-keyword)", textDecoration: "none" }}>Building a VS Code Theme Portfolio with Next.js</a></h2>
          <p>
            <span style={{ fontSize: "0.9em", color: "var(--sidebar-fg)" }}>
              June 2026 • 5 min read
            </span>
          </p>
          <p>An in-depth look at how I built this portfolio website to mimic the VS Code interface, using Next.js, Tailwind CSS, and custom UI components.</p>
        </div>

        <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--border-color)" }}>
          <h2><a href="#" style={{ color: "var(--token-keyword)", textDecoration: "none" }}>Fine-tuning YOLO Models for Custom Object Detection</a></h2>
          <p>
            <span style={{ fontSize: "0.9em", color: "var(--sidebar-fg)" }}>
              May 2026 • 8 min read
            </span>
          </p>
          <p>A step-by-step guide to fine-tuning YOLOv11 and YOLOv8 on custom datasets, focusing on historical fountains detection.</p>
        </div>

      </div>
    </div>
  );
}
