import Link from "next/link";
import { VscBriefcase, VscCode, VscFiles, VscHistory, VscQuestion, VscRobot, VscEyeClosed, VscArrowRight } from "react-icons/vsc";
import { requireAdmin } from "@/lib/server/auth";
import { PageHeader } from "./_components/ui";
import { actionLabel, entityLabel, formatDate } from "./_components/labels";

export const metadata = { title: "Panel" };

export default async function AdminDashboard() {
  const { db } = await requireAdmin();
  const count = (table: string) => db.from(table).select("*", { count: "exact", head: true });

  const [nodes, hidden, skills, experiences, intents, unanswered, recent] = await Promise.all([
    count("explorer_nodes"),
    db.from("explorer_nodes").select("*", { count: "exact", head: true }).eq("is_published", false),
    count("skills"),
    count("experiences"),
    count("chat_intents"),
    db.from("chat_unanswered").select("query, times_asked, last_asked").limit(6),
    db.from("admin_audit_log").select("id, created_at, action, entity, details").order("created_at", { ascending: false }).limit(8),
  ]);

  const stats = [
    { label: "Gezgin öğesi", value: nodes.count ?? 0, icon: VscFiles, href: "/admin/explorer" },
    { label: "Yayında olmayan", value: hidden.count ?? 0, icon: VscEyeClosed, href: "/admin/explorer" },
    { label: "Yetenek", value: skills.count ?? 0, icon: VscCode, href: "/admin/skills" },
    { label: "Deneyim", value: experiences.count ?? 0, icon: VscBriefcase, href: "/admin/experience" },
    { label: "BuğrAI konusu", value: intents.count ?? 0, icon: VscRobot, href: "/admin/chatbot" },
  ];

  return (
    <div className="adm-page">
      <PageHeader title="Panel" description="Sitenin tüm içeriğini buradan yönetebilirsiniz. Yaptığınız değişiklikler kaydettiğiniz anda sitede yayına girer." />

      <div className="adm-stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="adm-card adm-stat">
            <span className="adm-stat-icon">
              <s.icon size={18} aria-hidden />
            </span>
            <span>
              <span className="adm-stat-value">{s.value}</span>
              <br />
              <span className="adm-stat-label">{s.label}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="adm-grid-2">
        <section className="adm-card">
          <div className="adm-card-header">
            <h2>
              <VscQuestion aria-hidden /> BuğrAI&apos;ın net cevap veremediği sorular
            </h2>
            <Link href="/admin/chatbot?tab=unanswered" className="adm-btn adm-btn-sm adm-btn-ghost">
              Tümü <VscArrowRight aria-hidden />
            </Link>
          </div>
          {unanswered.data?.length ? (
            <ul className="adm-list">
              {unanswered.data.map((u) => (
                <li key={u.query} className="adm-list-item">
                  <div className="adm-list-main">
                    <div className="adm-list-title">{u.query}</div>
                    <div className="adm-list-sub">Son: {formatDate(u.last_asked)}</div>
                  </div>
                  <span className="adm-badge adm-badge-warning">{u.times_asked} kez</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="adm-empty">Cevapsız soru yok.</div>
          )}
        </section>

        <section className="adm-card">
          <div className="adm-card-header">
            <h2>
              <VscHistory aria-hidden /> Son işlemler
            </h2>
            <Link href="/admin/audit" className="adm-btn adm-btn-sm adm-btn-ghost">
              Tümü <VscArrowRight aria-hidden />
            </Link>
          </div>
          {recent.data?.length ? (
            <ul className="adm-list">
              {recent.data.map((r) => (
                <li key={r.id} className="adm-list-item">
                  <div className="adm-list-main">
                    <div className="adm-list-title">
                      {entityLabel(r.entity)}: {actionLabel(r.action)}
                    </div>
                    <div className="adm-list-sub">
                      {formatDate(r.created_at)}
                      {typeof r.details?.name === "string" && ` · ${r.details.name}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="adm-empty">Henüz işlem yok.</div>
          )}
        </section>
      </div>
    </div>
  );
}
