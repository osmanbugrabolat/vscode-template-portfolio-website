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
  const imageUrl = `/certificates/${cert.filename || cert.name}`;

  return (
    <div className="w-full h-full bg-[var(--editor-bg)] flex flex-col p-8 overflow-hidden">
      <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={cert.name}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          className="shadow-2xl drop-shadow-2xl rounded-sm border border-[var(--border-color)]"
        />
      </div>
    </div>
  );
}
