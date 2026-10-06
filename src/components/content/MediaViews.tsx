import { VscFilePdf, VscLinkExternal, VscCloudDownload } from "react-icons/vsc";
import type { Lang } from "@/lib/chatbot/types";

const PDF_TEXT = {
  open: { tr: "PDF'i aç", en: "Open PDF" },
  download: { tr: "İndir", en: "Download" },
  mobileHint: {
    tr: "Mobil tarayıcılar PDF'i sayfa içinde gösteremiyor. Açmak ya da indirmek için aşağıdaki butonları kullanın.",
    en: "Mobile browsers cannot show the PDF inside the page. Use the buttons below to open or download it.",
  },
  newTab: { tr: "PDF'i yeni sekmede aç", en: "Open the PDF in a new tab" },
};

export function PdfView({ src, title, lang }: { src: string; title: string; lang: Lang }) {
  return (
    <div className="pdf-view">
      {/* Desktop: inline viewer. Phones get a card instead (most cannot render PDFs in iframes). */}
      <iframe src={`${src}#view=FitH&toolbar=0&navpanes=0`} title={title} className="pdf-frame" />
      <p className="pdf-fallback">
        <a href={src} target="_blank" rel="noopener noreferrer">
          {PDF_TEXT.newTab[lang]}
        </a>
      </p>
      <div className="pdf-mobile">
        <VscFilePdf size={56} color="#e05252" aria-hidden />
        <strong className="pdf-mobile-title">{title}</strong>
        <p className="pdf-mobile-hint">{PDF_TEXT.mobileHint[lang]}</p>
        <div className="pdf-mobile-actions">
          <a className="pdf-mobile-button pdf-mobile-primary" href={src} target="_blank" rel="noopener noreferrer">
            <VscLinkExternal aria-hidden /> {PDF_TEXT.open[lang]}
          </a>
          <a className="pdf-mobile-button" href={src} download>
            <VscCloudDownload aria-hidden /> {PDF_TEXT.download[lang]}
          </a>
        </div>
      </div>
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
