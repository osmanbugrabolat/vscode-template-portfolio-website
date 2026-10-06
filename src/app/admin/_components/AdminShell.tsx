"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  VscAccount,
  VscCode,
  VscDashboard,
  VscFiles,
  VscFileMedia,
  VscHistory,
  VscLinkExternal,
  VscMenu,
  VscCopilot,
  VscSettingsGear,
  VscSignOut,
  VscBriefcase,
  VscVscode,
} from "react-icons/vsc";
import { logout } from "../_actions/account";
import { ToastProvider } from "./ui";

const NAV = [
  { section: "Genel" },
  { href: "/admin", label: "Panel", icon: VscDashboard, exact: true },
  { section: "İçerik" },
  { href: "/admin/explorer", label: "Gezgin ve Sayfalar", icon: VscFiles },
  { href: "/admin/settings", label: "Site Ayarları", icon: VscSettingsGear },
  { href: "/admin/skills", label: "Yetenekler", icon: VscCode },
  { href: "/admin/experience", label: "Deneyim", icon: VscBriefcase },
  { href: "/admin/media", label: "Medya", icon: VscFileMedia },
  { section: "BuğrAI" },
  { href: "/admin/chatbot", label: "Soru ve Cevaplar", icon: VscCopilot },
  { section: "Güvenlik" },
  { href: "/admin/audit", label: "İşlem Kaydı", icon: VscHistory },
  { href: "/admin/account", label: "Hesap", icon: VscAccount },
] as const;

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  // Close the drawer after navigating on mobile.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setNavOpen(false);
  }

  useEffect(() => {
    if (!navOpen) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [navOpen]);

  const current = NAV.find((n) => "href" in n && ("exact" in n ? pathname === n.href : pathname.startsWith(n.href)));

  return (
    <ToastProvider>
      <div className={`adm adm-shell${navOpen ? " is-nav-open" : ""}`}>
        <aside className="adm-sidebar" aria-label="Yönetim menüsü">
          <div className="adm-brand">
            <VscVscode size={22} color="#1a8ad4" aria-hidden />
            <div>
              Yönetim Paneli
              <small>my-portfolio-website</small>
            </div>
          </div>
          <nav className="adm-nav">
            {NAV.map((item, i) => {
              if (!("href" in item)) {
                return (
                  <div key={i} className="adm-nav-section">
                    {item.section}
                  </div>
                );
              }
              const active = "exact" in item ? pathname === item.href : pathname.startsWith(item.href);
              const ItemIcon = item.icon;
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
                  <ItemIcon size={16} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="adm-sidebar-foot">
            <div className="adm-user" title={email}>
              <VscAccount aria-hidden />
              <span>{email}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="adm-btn adm-btn-block">
                <VscSignOut aria-hidden /> Çıkış yap
              </button>
            </form>
          </div>
        </aside>
        <div className="adm-backdrop" onClick={() => setNavOpen(false)} aria-hidden />

        <header className="adm-topbar">
          <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-menu-toggle" onClick={() => setNavOpen(true)} aria-label="Menüyü aç" aria-expanded={navOpen}>
            <VscMenu size={18} />
          </button>
          <span className="adm-topbar-title">{current && "label" in current ? current.label : "Yönetim Paneli"}</span>
          <span className="adm-topbar-spacer" />
          <a className="adm-btn adm-btn-sm" href="/" target="_blank" rel="noopener noreferrer">
            <VscLinkExternal aria-hidden />
            <span className="adm-hide-mobile">Siteyi görüntüle</span>
          </a>
        </header>

        <main className="adm-main" id="admin-main">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
