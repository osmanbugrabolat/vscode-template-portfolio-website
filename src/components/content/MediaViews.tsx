import type { Lang } from "@/lib/chatbot/types";

export function PdfView({ src, title, lang }: { src: string; title: string; lang: Lang }) {
  return (
    <div className="pdf-view">
      <iframe src={`${src}#view=FitH&toolbar=0&navpanes=0`} title={title} className="pdf-frame" />
      <p className="pdf-fallback">
        <a href={src} target="_blank" rel="noopener noreferrer">
          {lang === "tr" ? "PDF'i yeni sekmede aç" : "Open the PDF in a new tab"}
        </a>
      </p>
    </div>
  );
}

export function ImageView({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="image-view">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="image-view-img" />
    </div>
  );
}
