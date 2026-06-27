// Shared constants — imported by both VSCodeLayout and Sidebar
// Keeping this separate avoids circular dependency issues

export interface FileTab {
  id: string;
  name: string;
  path: string;
  ext: "tsx" | "ts" | "json" | "md";
  language: string;
}

export const ALL_FILES: FileTab[] = [
  {
    id: "about-readme",
    name: "README.md",
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
    name: "oracle_cert.jpg",
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
    name: "python_tensorflow.jpg",
    path: "/certificates/python",
    ext: "jpg",
    language: "Image",
  },
  {
    id: "cert-r",
    name: "r_programming.jpg",
    path: "/certificates/r-lang",
    ext: "jpg",
    language: "Image",
  },
  {
    id: "cert-hwend-1",
    name: "HWEND_177820.png",
    path: "/certificates/hwend-177820",
    ext: "png",
    language: "Image",
  },
  {
    id: "cert-hwend-2",
    name: "HWEND_721526.png",
    path: "/certificates/hwend-721526",
    ext: "png",
    language: "Image",
  },
  {
    id: "cert-hwend-3",
    name: "HWEND_036679.png",
    path: "/certificates/hwend-036679",
    ext: "png",
    language: "Image",
  },
  {
    id: "cert-hwend-4",
    name: "HWEND_580148.png",
    path: "/certificates/hwend-580148",
    ext: "png",
    language: "Image",
  },
  {
    id: "cert-hwend-5",
    name: "HWEND_690969.png",
    path: "/certificates/hwend-690969",
    ext: "png",
    language: "Image",
  },
  {
    id: "cert-hwend-6",
    name: "HWEND_727737.png",
    path: "/certificates/hwend-727737",
    ext: "png",
    language: "Image",
  },
  {
    id: "contact-readme",
    name: "README.md",
    path: "/contact",
    ext: "md",
    language: "Markdown",
  },
];
