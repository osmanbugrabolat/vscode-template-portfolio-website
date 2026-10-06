import Link from "next/link";
import { VscHistory } from "react-icons/vsc";
import { requireAdmin } from "@/lib/server/auth";
import { PageHeader } from "../_components/ui";
import { actionLabel, entityLabel, formatDate } from "../_components/labels";

export const metadata = { title: "İşlem Kaydı" };
const PAGE_SIZE = 50;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { db } = await requireAdmin();
  const page = Math.max(1, Math.min(1000, Number.parseInt((await searchParams).page ?? "1", 10) || 1));
  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await db
    .from("admin_audit_log")
    .select("id, created_at, actor_email, action, entity, entity_id, details", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error("İşlem kaydı yüklenemedi.");
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="adm-page">
      <PageHeader
        title="İşlem Kaydı"
        icon={<VscHistory aria-hidden />}
        description="Yönetim panelinde yapılan her değişiklik, giriş denemesi ve oturum hareketi burada değiştirilemez şekilde tutulur. IP adresleri gizlilik için şifrelenmiş (hash) olarak saklanır."
      />
      <section className="adm-card">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Zaman</th>
                <th>İşlem</th>
                <th className="adm-hide-mobile">Kullanıcı</th>
                <th className="adm-hide-mobile">Ayrıntı</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((r) => (
                <tr key={r.id}>
                  <td className="adm-nowrap">{formatDate(r.created_at)}</td>
                  <td>
                    <strong>{entityLabel(r.entity)}</strong>: {actionLabel(r.action)}
                    {typeof r.details?.name === "string" && <div className="adm-list-sub">{r.details.name}</div>}
                  </td>
                  <td className="adm-hide-mobile">{r.actor_email ?? "-"}</td>
                  <td className="adm-hide-mobile adm-mono" style={{ maxWidth: 280, wordBreak: "break-all" }}>
                    {r.entity_id ?? ""}
                  </td>
                </tr>
              ))}
              {!data?.length && (
                <tr>
                  <td colSpan={4} className="adm-empty">
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="adm-card-header" style={{ borderTop: "1px solid var(--adm-border)", borderBottom: "none" }}>
          <span className="adm-muted">
            Sayfa {page} / {pages} · {count ?? 0} kayıt
          </span>
          <div className="adm-btn-group">
            {page > 1 && (
              <Link className="adm-btn adm-btn-sm" href={`/admin/audit?page=${page - 1}`}>
                Önceki
              </Link>
            )}
            {page < pages && (
              <Link className="adm-btn adm-btn-sm" href={`/admin/audit?page=${page + 1}`}>
                Sonraki
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
