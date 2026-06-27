// Shared constants — imported by both VSCodeLayout and Sidebar
// Keeping this separate avoids circular dependency issues
import { personal } from "@/data/portfolio";

export interface FileTab {
  id: string;
  name: string;
  path: string;
  ext: "tsx" | "ts" | "json" | "md" | "jpg" | "png" | "pdf" | string;
  language: string;
  filename?: string;
  isExternal?: boolean;
}

export const ALL_FILES: FileTab[] = [
  {
    id: "about-readme",
    name: "WhoAmI.md",
    path: "/",
    ext: "md",
    language: "Markdown",
  },
  {
    id: "project-1",
    name: "README.md",
    path: "/projects/1",
    ext: "md",
    language: "Markdown",
  },
  {
    id: "project-2",
    name: "README.md",
    path: "/projects/2",
    ext: "md",
    language: "Markdown",
  },
  {
    id: "project-3",
    name: "README.md",
    path: "/projects/3",
    ext: "md",
    language: "Markdown",
  },
  {
    id: "project-4",
    name: "README.md",
    path: "/projects/4",
    ext: "md",
    language: "Markdown",
  },
  {
    id: "articles-readme",
    name: "README.md",
    path: "/articles",
    ext: "md",
    language: "Markdown",
  },
  {
    id: "cert-oracle",
    name: "SQL & Oracle Database",
    filename: "oracle_cert.jpg",
    path: "/certificates/oracle",
    ext: "jpg",
    language: "Image",
  },
  {
    id: "cv-file",
    name: "cv.pdf",
    path: "/cv",
    ext: "pdf",
    language: "PDF",
  },
  {
    id: "cert-python",
    name: "Python & Tensorflow",
    filename: "python_tensorflow.jpg",
    path: "/certificates/python",
    ext: "jpg",
    language: "Image",
  },
  {
    id: "cert-r",
    name: "R Programming",
    filename: "r_programming.jpg",
    path: "/certificates/r-lang",
    ext: "jpg",
    language: "Image",
  },
  {
    id: "cert-hwend-1",
    name: "Huawei HCCDA-AI",
    filename: "HWEND_177820.png",
    path: "/certificates/hwend-177820",
    ext: "png",
    language: "Image",
  },
  {
    id: "cert-hwend-2",
    name: "Huawei HCCDP-AI",
    filename: "HWEND_721526.png",
    path: "/certificates/hwend-721526",
    ext: "png",
    language: "Image",
  },
  {
    id: "cert-hwend-3",
    name: "Huawei HCCDP-Cloud Migration",
    filename: "HWEND_036679.png",
    path: "/certificates/hwend-036679",
    ext: "png",
    language: "Image",
  },
  {
    id: "cert-hwend-4",
    name: "Huawei HCCDP-Solution Architectures",
    filename: "HWEND_580148.png",
    path: "/certificates/hwend-580148",
    ext: "png",
    language: "Image",
  },
  {
    id: "cert-hwend-5",
    name: "Huawei HCCDA-Cloud Native",
    filename: "HWEND_690969.png",
    path: "/certificates/hwend-690969",
    ext: "png",
    language: "Image",
  },
  {
    id: "cert-hwend-6",
    name: "Huawei HCCDA-Tech Essentials",
    filename: "HWEND_727737.png",
    path: "/certificates/hwend-727737",
    ext: "png",
    language: "Image",
  },
  {
    id: "contact-linkedin",
    name: "LinkedIn",
    path: personal.linkedin,
    ext: "linkedin",
    language: "Social",
    isExternal: true,
  },
  {
    id: "contact-github",
    name: "GitHub",
    path: personal.github,
    ext: "github",
    language: "Social",
    isExternal: true,
  },
  {
    id: "contact-medium",
    name: "Medium",
    path: personal.medium,
    ext: "medium",
    language: "Social",
    isExternal: true,
  },
  {
    id: "contact-email",
    name: "E-Mail",
    path: `mailto:${personal.email}`,
    ext: "email",
    language: "Email",
    isExternal: true,
  },
];
