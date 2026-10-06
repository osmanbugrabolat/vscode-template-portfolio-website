import { requireAdmin } from "@/lib/server/auth";
import type { Experience } from "@/lib/cms/types";
import ExperienceEditor from "./ExperienceEditor";

export const metadata = { title: "Deneyim" };

export default async function ExperiencePage() {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("experiences").select("*").order("sort_order");
  if (error) throw new Error("Deneyimler yüklenemedi.");
  return (
    <div className="adm-page">
      <ExperienceEditor experiences={data as Experience[]} />
    </div>
  );
}
