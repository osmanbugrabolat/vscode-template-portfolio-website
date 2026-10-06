"use server";

import { NodeSchema } from "@/lib/admin-schemas";
import * as z from "zod";
import { headers } from "next/headers";
import { adminAction, assertDb, requireRow, ActionError, invalidate, type ActionResult } from "@/lib/server/admin-action";
import { uuid } from "@/lib/validation";

const save = adminAction({
  schema: NodeSchema,
  audit: { action: "save", entity: "explorer_node" },
  run: async (v, { db }) => {
    if (v.kind === "file" && v.file_type === "embed" && v.url) {
      // Embedding our own origin would let the iframe escape its sandbox.
      const host = (await headers()).get("host");
      if (host && new URL(v.url).host === host) {
        throw new ActionError("Sitenin kendi adresi gömülemez.", { url: ["Sitenin kendi adresi gömülemez."] });
      }
    }
    const isFolder = v.kind === "folder";
    const isLink = v.file_type === "link";
    const row = {
      kind: v.kind,
      parent_id: v.parent_id,
      name: v.name,
      name_en: v.name_en,
      file_type: isFolder ? null : v.file_type,
      route: isFolder || isLink ? null : v.route,
      url: isFolder ? null : isLink || v.file_type === "embed" ? v.url : null,
      asset_url: isFolder ? null : v.file_type === "pdf" || v.file_type === "image" ? v.asset_url : null,
      content_tr: isFolder || isLink ? "" : v.content_tr,
      content_en: isFolder || isLink ? "" : v.content_en,
      icon: v.icon,
      sort_order: v.sort_order,
      is_published: v.is_published,
      show_in_explorer: v.show_in_explorer,
    };

    if (v.id) {
      const existing = assertDb(await db.from("explorer_nodes").select("kind").eq("id", v.id).maybeSingle());
      if (!existing) throw new ActionError("Kayıt bulunamadı.");
      if (existing.kind !== v.kind) throw new ActionError("Klasör ve dosya türü sonradan değiştirilemez.");
      assertDb(await db.from("explorer_nodes").update(row).eq("id", v.id).select("id").single());
      invalidate("cms");
      return { entityId: v.id, message: "Değişiklikler kaydedildi.", data: { id: v.id }, details: { name: v.name } };
    }
    const created = requireRow(await db.from("explorer_nodes").insert(row).select("id").single());
    invalidate("cms");
    return { entityId: created.id, message: isFolder ? "Klasör oluşturuldu." : "Dosya oluşturuldu.", data: { id: created.id }, details: { name: v.name } };
  },
});

const remove = adminAction({
  schema: z.object({ id: uuid }),
  audit: { action: "delete", entity: "explorer_node" },
  run: async ({ id }, { db }) => {
    const deleted = requireRow(await db.from("explorer_nodes").delete().eq("id", id).select("id, name"));
    if (!deleted.length) throw new ActionError("Kayıt bulunamadı.");
    invalidate("cms");
    return { entityId: id, message: "Silindi.", details: { name: deleted[0].name } };
  },
});

const move = adminAction({
  schema: z.object({ id: uuid, direction: z.coerce.number().int().refine((d) => d === -1 || d === 1) }),
  audit: { action: "reorder", entity: "explorer_node" },
  run: async ({ id, direction }, { db }) => {
    assertDb(await db.rpc("admin_move", { p_table: "explorer_nodes", p_id: id, p_direction: direction }));
    invalidate("cms");
    return { entityId: id, message: "Sıralama güncellendi." };
  },
});

export async function saveNode(prev: ActionResult<{ id: string }> | undefined, formData: FormData) {
  return save(prev, formData);
}
export async function deleteNode(prev: ActionResult | undefined, formData: FormData) {
  return remove(prev, formData);
}
export async function moveNode(prev: ActionResult | undefined, formData: FormData) {
  return move(prev, formData);
}
