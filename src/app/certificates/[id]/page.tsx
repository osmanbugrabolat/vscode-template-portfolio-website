import { ALL_FILES } from "@/components/layout/constants";
import Image from "next/image";

export default async function CertificateViewer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Find the certificate in ALL_FILES based on the slug.
  const cert = ALL_FILES.find((f) => f.path === `/certificates/${id}`);

  if (!cert) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[var(--sidebar-fg)]">
        Certificate not found.
      </div>
    );
  }

  // The actual image is stored in public/certificates/
  const imageUrl = `/certificates/${cert.name}`;

  return (
    <div className="w-full h-full bg-[var(--editor-bg)] flex flex-col items-center justify-center overflow-auto p-4 relative">
      <div className="relative w-full max-w-lg flex items-center justify-center flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={cert.name}
          className="max-w-full max-h-[60vh] object-contain shadow-2xl drop-shadow-2xl rounded-sm border border-[var(--border-color)]"
        />
      </div>
      <div className="mt-4 text-sm text-[var(--sidebar-fg)] font-mono text-center">
        {cert.name}
      </div>
    </div>
  );
}
