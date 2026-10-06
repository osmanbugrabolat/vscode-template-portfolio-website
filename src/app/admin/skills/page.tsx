import { requireAdmin } from "@/lib/server/auth";
import type { SkillCategory } from "@/lib/cms/types";
import SkillsEditor from "./SkillsEditor";

export const metadata = { title: "Yetenekler" };

export default async function SkillsPage() {
  const { db } = await requireAdmin();
  const [categories, skills] = await Promise.all([
    db.from("skill_categories").select("*").order("sort_order"),
    db.from("skills").select("*").order("sort_order"),
  ]);
  if (categories.error || skills.error) throw new Error("Yetenekler yüklenemedi.");
  const data: SkillCategory[] = categories.data.map((c) => ({ ...c, skills: skills.data.filter((s) => s.category_id === c.id) }));
  return (
    <div className="adm-page">
      <SkillsEditor categories={data} />
    </div>
  );
}
