import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/server/auth";
import LoginForm from "./LoginForm";
import "../admin/admin.css";

export const metadata: Metadata = {
  title: "Yönetim Girişi",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const { reason } = await searchParams;
  return (
    <main className="adm-login">
      <LoginForm expired={reason === "expired"} />
    </main>
  );
}
