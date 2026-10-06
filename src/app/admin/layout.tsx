import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/auth";
import AdminShell from "./_components/AdminShell";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s | Yönetim Paneli" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Pages and actions re-check on their own; this only decides whether to draw the shell.
  const admin = await requireAdmin();
  return <AdminShell email={admin.user.email ?? ""}>{children}</AdminShell>;
}
