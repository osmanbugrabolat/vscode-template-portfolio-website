import { 
  SiUltralytics, SiMediapipe, SiOpencv, SiPytorch, SiScikitlearn,
  SiHuawei, SiGooglecloud, SiNextdotjs, SiReact, SiFlutter,
  SiFastapi, SiNodedotjs, SiPrisma, SiPostgresql,
  SiGithub, SiDocker, SiFigma, SiLinux, SiClaude, SiGooglegemini,
  SiSlack, SiTrello, SiJira, SiTensorflow
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";
import { DiMsqlServer } from "react-icons/di";
import { VscVscode } from "react-icons/vsc";

export const CustomCursorIcon = (props: React.SVGProps<SVGSVGElement> & { size?: number | string }) => {
  const { size = 24, style, ...rest } = props;
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      fill="currentColor" 
      style={{ display: 'inline-block', ...style }}
      {...rest}
    >
      <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"/>
    </svg>
  );
};

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
  ai_ml: [
    { name: "Ultralytics YOLO", level: 75, icon: SiUltralytics },
    { name: "MediaPipe", level: 75, icon: SiMediapipe },
    { name: "OpenCV", level: 70, icon: SiOpencv },
    { name: "TensorFlow", level: 70, icon: SiTensorflow },
    { name: "PyTorch", level: 65, icon: SiPytorch },
    { name: "Scikit-learn", level: 60, icon: SiScikitlearn },
  ],
  cloud: [
    { name: "Huawei Cloud", level: 70, icon: SiHuawei },
    { name: "GCP", level: 60, icon: SiGooglecloud },
    { name: "AWS", level: 55, icon: FaAws },
  ],
  frontend: [
    { name: "Next.js", level: 90, icon: SiNextdotjs },
    { name: "React", level: 85, icon: SiReact },
    { name: "React Native", level: 80, icon: SiReact },
    { name: "Flutter", level: 70, icon: SiFlutter },
  ],
  backend: [
    { name: "Python FastAPI", level: 75, icon: SiFastapi },
    { name: "Node.js", level: 70, icon: SiNodedotjs },
    { name: "Prisma ORM", level: 60, icon: SiPrisma },
  ],
  databases: [
    { name: "PostgreSQL", level: 75, icon: SiPostgresql },
    { name: "MSSQL", level: 65, icon: DiMsqlServer },
  ],
  tools: [
    { name: "VS Code", level: 99, icon: VscVscode },
    { name: "Git & GitHub", level: 80, icon: SiGithub },
    { name: "Docker", level: 65, icon: SiDocker },
    { name: "Figma", level: 60, icon: SiFigma },
    { name: "Linux", level: 75, icon: SiLinux },
  ],
  ai_tools: [
    { name: "Claude", level: 80, icon: SiClaude },
    { name: "Cursor", level: 70, icon: CustomCursorIcon },
    { name: "Gemini", level: 70, icon: SiGooglegemini },
  ],
  project_management: [
    { name: "Slack", level: 85, icon: SiSlack },
    { name: "Trello", level: 80, icon: SiTrello },
    { name: "Jira", level: 70, icon: SiJira },
  ]
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
