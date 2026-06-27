export const personal = {
  name: "Buğra Bolat",
  title: "Full Stack Developer",
  subtitle: "Building the web, one commit at a time.",
  bio: "Passionate full-stack developer crafting elegant, performant web applications. I thrive at the intersection of design and engineering — turning complex problems into simple, beautiful, and intuitive solutions.",
  location: "Turkey 🇹🇷",
  email: "contact@bugrabolat.dev",
  github: "https://github.com/osmanbugrabolat",
  linkedin: "https://linkedin.com/in/osmanbugrabolat",
  medium: "https://medium.com/@osmanbugrabolat",
  website: "https://bugrabolat.dev",
  available: true,
  currentFocus: [
    "Building scalable Next.js applications",
    "Exploring AI/ML integrations",
    "Apartment Management Systems",
  ],
};

export const projects = [
  {
    id: 1,
    name: "Apart Yönetim Sistemi",
    description:
      "Comprehensive apartment management platform with real-time updates, tenant management, payment tracking, and automated reporting.",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
    github: "https://github.com/osmanbugrabolat",
    live: "http://localhost:3000",
    status: "active" as const,
    year: 2026,
  },
  {
    id: 2,
    name: "Portfolyo AI",
    description:
      "AI-powered portfolio website with a VS Code-inspired theme. Features intelligent content generation and interactive code-like navigation.",
    tech: ["Next.js", "TypeScript", "AI/ML", "Tailwind CSS"],
    github: "https://github.com/osmanbugrabolat",
    live: "#",
    status: "active" as const,
    year: 2026,
  },
  {
    id: 3,
    name: "Fountain Detection AI",
    description:
      "Fine-tuned YOLOv8 & YOLOv11 model for detecting historical Ottoman fountains (hayrat çeşme) in images with high accuracy.",
    tech: ["Python", "YOLOv11", "Ultralytics", "OpenCV", "PyTorch"],
    github: "https://github.com/osmanbugrabolat",
    live: "#",
    status: "completed" as const,
    year: 2025,
  },
  {
    id: 4,
    name: "Web Scraper & Dataset Builder",
    description:
      "Automated image scraping tool for building custom computer vision datasets from Google Images search results.",
    tech: ["Python", "Selenium", "BeautifulSoup", "Requests"],
    github: "https://github.com/osmanbugrabolat",
    live: "#",
    status: "completed" as const,
    year: 2025,
  },
];

export const skills = {
  languages: [
    { name: "TypeScript", level: 90 },
    { name: "JavaScript", level: 92 },
    { name: "Python", level: 78 },
    { name: "SQL", level: 75 },
    { name: "HTML/CSS", level: 95 },
  ],
  frontend: [
    { name: "React", level: 90 },
    { name: "Next.js", level: 88 },
    { name: "Tailwind CSS", level: 92 },
    { name: "Framer Motion", level: 70 },
  ],
  backend: [
    { name: "Node.js", level: 80 },
    { name: "Express.js", level: 78 },
    { name: "Prisma ORM", level: 82 },
    { name: "REST APIs", level: 85 },
  ],
  databases: [
    { name: "PostgreSQL", level: 78 },
    { name: "MongoDB", level: 65 },
    { name: "Redis", level: 60 },
  ],
  tools: [
    { name: "Git & GitHub", level: 88 },
    { name: "Docker", level: 65 },
    { name: "VS Code", level: 99 },
    { name: "Figma", level: 70 },
    { name: "Linux/macOS", level: 75 },
  ],
  ai_ml: [
    { name: "PyTorch", level: 65 },
    { name: "Ultralytics YOLO", level: 72 },
    { name: "OpenCV", level: 68 },
    { name: "Scikit-learn", level: 60 },
  ],
};

export const experience = [
  {
    id: 1,
    company: "Freelance",
    position: "Full Stack Developer",
    duration: "2024 – Present",
    location: "Remote",
    description:
      "Designing and developing custom web applications for clients. Specialized in Next.js, TypeScript, and database architecture.",
    highlights: [
      "Built Apart Yönetim Sistemi for property management",
      "Developed AI-powered portfolio websites",
      "Delivered 5+ projects on time and within scope",
    ],
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
  },
  {
    id: 2,
    company: "Self-Directed Learning",
    position: "AI/ML Engineer (Learning)",
    duration: "2025 – Present",
    location: "Turkey",
    description:
      "Deep diving into computer vision and machine learning. Working on fine-tuning YOLO models for object detection tasks.",
    highlights: [
      "Fine-tuned YOLOv8 & YOLOv11 for fountain detection",
      "Built custom datasets from web scraped images",
      "Achieved 85%+ mAP on custom dataset",
    ],
    tech: ["Python", "PyTorch", "Ultralytics", "OpenCV", "NumPy"],
  },
];

export const education = {
  degree: "Computer Engineering",
  school: "University",
  year: "2020 – 2024",
  gpa: "3.4 / 4.0",
};
