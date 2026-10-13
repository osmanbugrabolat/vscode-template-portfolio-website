import "server-only";
import { join } from "node:path";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { CvDocument } from "./document";
import type { CvData, CvLang } from "./schema";

// Bundled with the app (see outputFileTracingIncludes in next.config.ts).
const FONT_DIR = join(process.cwd(), "src/lib/cv/fonts");

let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "Poppins",
    fonts: [
      { src: join(FONT_DIR, "Poppins-Regular.ttf"), fontWeight: 400 },
      { src: join(FONT_DIR, "Poppins-Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
      { src: join(FONT_DIR, "Poppins-SemiBold.ttf"), fontWeight: 600 },
      { src: join(FONT_DIR, "Poppins-Bold.ttf"), fontWeight: 700 },
    ],
  });
  // The default hyphenator is English-only and breaks Turkish words oddly.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

export async function renderCvPdf(data: CvData, lang: CvLang): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(<CvDocument data={data} lang={lang} />);
}
