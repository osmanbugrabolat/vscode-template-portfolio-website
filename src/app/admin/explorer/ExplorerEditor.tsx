"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  VscArrowDown,
  VscArrowUp,
  VscChevronDown,
  VscChevronRight,
  VscCircleSlash,
  VscCollapseAll,
  VscExpandAll,
  VscEyeClosed,
  VscFiles,
  VscLinkExternal,
  VscNewFile,
  VscNewFolder,
  VscSearch,
  VscTrash,
  VscInfo,
} from "react-icons/vsc";
import { Icon } from "@/lib/icons";
import { DEFAULT_FILE_ICON, type ExplorerNode, type FileType, type SiteSettings, type SkillCategory } from "@/lib/cms/types";
import type { MediaItem } from "@/lib/server/media-list";
import { deleteNode, moveNode, saveNode } from "../_actions/explorer";
import AssetPicker from "../_components/AssetPicker";
import MarkdownEditor from "../_components/MarkdownEditor";
import {
  DeleteButton,
  FormError,
  IconPicker,
  InlineActionButton,
  LangTabs,
  PageHeader,
  SelectField,
  SubmitButton,
  TextField,
  Toggle,
  useAdminAction,
} from "../_components/ui";

const FILE_TYPE_INFO: Record<FileType, { label: string; help: string }> = {
  markdown: { label: "Markdown sayfası", help: "README gibi metin sayfası. Başlık, liste, bağlantı, görsel ve bileşen içerebilir." },
  home: { label: "Ana sayfa (Markdown)", help: "Markdown sayfasıyla aynıdır; adresi genellikle / olur." },
  experience: { label: "Deneyim görünümü", help: "Deneyim bölümündeki kayıtları kod editörü görünümünde listeler." },
  skills: { label: "Yetenekler görünümü", help: "Yetenekler bölümündeki kayıtları kod editörü görünümünde listeler." },
  pdf: { label: "PDF görüntüleyici", help: "Bir PDF dosyasını sayfa içinde gösterir (örn. CV)." },
  image: { label: "Görsel görüntüleyici", help: "Bir görseli tam ekran gösterir (örn. sertifika)." },
  embed: { label: "Gömülü uygulama / oyun", help: "Başka bir https sitesini (örn. GitHub Pages oyunu) çerçeve içinde açar." },
  link: { label: "Dış bağlantı", help: "Tıklanınca yeni sekmede bir adres ya da e-posta açar. Kendi sayfası yoktur." },
};

type Selection = { mode: "edit"; id: string } | { mode: "new"; kind: "folder" | "file"; parentId: string | null } | null;

function slugify(s: string) {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\.(md|ts|tsx|pdf|png|jpe?g)$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function ExplorerEditor({
  nodes,
  settings,
  skillCategories,
  media,
  initialSelected,
}: {
  nodes: ExplorerNode[];
  settings: SiteSettings;
  skillCategories: SkillCategory[];
  media: MediaItem[];
  initialSelected: string | null;
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<Selection>(initialSelected && nodes.some((n) => n.id === initialSelected) ? { mode: "edit", id: initialSelected } : null);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const open = new Set(nodes.filter((n) => n.kind === "folder" && n.parent_id === null).map((n) => n.id));
    // Make sure the initially selected node is visible.
    let cursor = nodes.find((n) => n.id === initialSelected)?.parent_id ?? null;
    while (cursor) {
      open.add(cursor);
      cursor = nodes.find((n) => n.id === cursor)?.parent_id ?? null;
    }
    return open;
  });
  const [query, setQuery] = useState("");
  const [dirty, setDirty] = useState(false);
  const editorRef = useRef<HTMLElement>(null);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const childrenOf = useMemo(() => {
    const map = new Map<string | null, ExplorerNode[]>();
    for (const n of nodes) map.set(n.parent_id, [...(map.get(n.parent_id) ?? []), n]);
    for (const list of map.values()) list.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "tr"));
    return (id: string | null) => map.get(id) ?? [];
  }, [nodes]);

  const pathOf = (id: string | null): ExplorerNode[] => {
    const chain: ExplorerNode[] = [];
    let cursor = id ? byId.get(id) : undefined;
    while (cursor && chain.length < 64) {
      chain.unshift(cursor);
      cursor = cursor.parent_id ? byId.get(cursor.parent_id) : undefined;
    }
    return chain;
  };

  const descendantsCount = (id: string): number => childrenOf(id).reduce((sum, c) => sum + 1 + descendantsCount(c.id), 0);

  const q = query.trim().toLocaleLowerCase("tr");
  const matches = (n: ExplorerNode): boolean =>
    !q || n.name.toLocaleLowerCase("tr").includes(q) || (n.route ?? "").includes(q) || childrenOf(n.id).some(matches);

  const confirmLeave = () => !dirty || window.confirm("Kaydedilmemiş değişiklikler var. Yine de devam edilsin mi?");

  const select = (next: Selection) => {
    if (!confirmLeave()) return;
    setDirty(false);
    setSelection(next);
    if (next?.mode === "edit") router.replace(`/admin/explorer?node=${next.id}`, { scroll: false });
    // On narrow screens the editor sits below the tree: bring it into view.
    if (window.matchMedia("(max-width: 1100px)").matches) {
      requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const selectedParent = (): string | null => {
    if (selection?.mode !== "edit") return null;
    const n = byId.get(selection.id);
    if (!n) return null;
    return n.kind === "folder" ? n.id : n.parent_id;
  };

  const renderTree = (parentId: string | null, depth: number): React.ReactNode =>
    childrenOf(parentId)
      .filter(matches)
      .map((n, index, siblings) => {
        const isFolder = n.kind === "folder";
        const isOpen = q ? true : expanded.has(n.id);
        const isSelected = selection?.mode === "edit" && selection.id === n.id;
        return (
          <div key={n.id} role="treeitem" aria-expanded={isFolder ? isOpen : undefined} aria-selected={isSelected}>
            <div
              className={`adm-tree-row${isSelected ? " is-selected" : ""}${n.is_published ? "" : " is-unpublished"}`}
              style={{ paddingLeft: 6 + depth * 14 }}
            >
              {isFolder ? (
                <button
                  type="button"
                  className="adm-tree-toggle"
                  aria-label={isOpen ? "Daralt" : "Genişlet"}
                  onClick={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(n.id)) next.delete(n.id);
                      else next.add(n.id);
                      return next;
                    })
                  }
                >
                  {isOpen ? <VscChevronDown /> : <VscChevronRight />}
                </button>
              ) : (
                <span style={{ width: 20, flexShrink: 0 }} />
              )}
              <button type="button" className="adm-tree-select" onClick={() => select({ mode: "edit", id: n.id })}>
                <Icon name={n.icon || (isFolder ? "folder" : n.file_type ? DEFAULT_FILE_ICON[n.file_type] : "file")} size={14} />
                <span className="adm-tree-name">{n.name}</span>
                <span className="adm-tree-flags">
                  {!n.is_published && <VscEyeClosed size={12} aria-label="Yayında değil" />}
                  {!n.show_in_explorer && <VscCircleSlash size={12} aria-label="Gezginde gizli" />}
                </span>
              </button>
              <span className="adm-tree-actions">
                <InlineActionButton action={moveNode} fields={{ id: n.id, direction: "-1" }} label="Yukarı taşı" disabled={index === 0}>
                  <VscArrowUp size={13} />
                </InlineActionButton>
                <InlineActionButton action={moveNode} fields={{ id: n.id, direction: "1" }} label="Aşağı taşı" disabled={index === siblings.length - 1}>
                  <VscArrowDown size={13} />
                </InlineActionButton>
              </span>
            </div>
            {isFolder && isOpen && <div role="group">{renderTree(n.id, depth + 1)}</div>}
          </div>
        );
      });

  const selectedNode = selection?.mode === "edit" ? byId.get(selection.id) : undefined;

  return (
    <>
      <PageHeader
        title="Gezgin ve Sayfalar"
        icon={<VscFiles aria-hidden />}
        description="Sitenin sol tarafındaki MY-PORTFOLIO-WEBSITE ağacı. Klasör ve dosya ekleyin, içerikleri düzenleyin, sıralayın, gizleyin ya da silin."
      />
      <div className="adm-split">
        <section className="adm-card adm-split-pane" aria-label="Dosya ağacı">
          <div className="adm-card-header">
            <div className="adm-toolbar">
              <button type="button" className="adm-btn adm-btn-sm" onClick={() => select({ mode: "new", kind: "folder", parentId: selectedParent() })}>
                <VscNewFolder aria-hidden /> Klasör
              </button>
              <button type="button" className="adm-btn adm-btn-sm" onClick={() => select({ mode: "new", kind: "file", parentId: selectedParent() })}>
                <VscNewFile aria-hidden /> Dosya
              </button>
            </div>
            <div className="adm-btn-group">
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" aria-label="Tümünü genişlet" title="Tümünü genişlet" onClick={() => setExpanded(new Set(nodes.filter((n) => n.kind === "folder").map((n) => n.id)))}>
                <VscExpandAll />
              </button>
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" aria-label="Tümünü daralt" title="Tümünü daralt" onClick={() => setExpanded(new Set())}>
                <VscCollapseAll />
              </button>
            </div>
          </div>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--adm-border)" }}>
            <div className="adm-input-wrap">
              <VscSearch className="adm-input-icon" aria-hidden />
              <input className="adm-input adm-input-with-icon" placeholder="Ad ya da adres ara..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Ağaçta ara" />
            </div>
          </div>
          <div className="adm-card-scroll">
            <div className="adm-tree" role="tree" aria-label="MY-PORTFOLIO-WEBSITE">
              {nodes.length ? renderTree(null, 0) : <div className="adm-empty">Henüz öğe yok. Yukarıdan klasör ya da dosya ekleyin.</div>}
            </div>
          </div>
          <div className="adm-md-status adm-tree-legend">
            <span>
              <VscEyeClosed size={11} aria-hidden /> yayında değil
            </span>
            <span>
              <VscCircleSlash size={11} aria-hidden /> gezginde gizli
            </span>
          </div>
        </section>

        <section className="adm-card" aria-label="Düzenleyici" ref={editorRef} style={{ scrollMarginTop: 12 }}>
          {selection === null || (selection.mode === "edit" && !selectedNode) ? (
            <div className="adm-empty" style={{ padding: 48 }}>
              <VscInfo size={28} aria-hidden />
              <p style={{ margin: 0 }}>Düzenlemek için soldan bir öğe seçin ya da yeni klasör/dosya oluşturun.</p>
            </div>
          ) : (
            <NodeForm
              key={selection.mode === "edit" ? selection.id : `new-${selection.kind}-${selection.parentId}`}
              node={selectedNode}
              newKind={selection.mode === "new" ? selection.kind : undefined}
              newParentId={selection.mode === "new" ? selection.parentId : undefined}
              nodes={nodes}
              childrenOf={childrenOf}
              pathOf={pathOf}
              descendantsCount={descendantsCount}
              settings={settings}
              skillCategories={skillCategories}
              media={media}
              onDirty={setDirty}
              onSaved={(id) => {
                setDirty(false);
                setSelection({ mode: "edit", id });
                router.replace(`/admin/explorer?node=${id}`, { scroll: false });
                router.refresh();
              }}
              onDeleted={() => {
                setDirty(false);
                setSelection(null);
                router.replace("/admin/explorer", { scroll: false });
                router.refresh();
              }}
            />
          )}
        </section>
      </div>
    </>
  );
}

function NodeForm({
  node,
  newKind,
  newParentId,
  nodes,
  childrenOf,
  pathOf,
  descendantsCount,
  settings,
  skillCategories,
  media,
  onDirty,
  onSaved,
  onDeleted,
}: {
  node?: ExplorerNode;
  newKind?: "folder" | "file";
  newParentId?: string | null;
  nodes: ExplorerNode[];
  childrenOf: (id: string | null) => ExplorerNode[];
  pathOf: (id: string | null) => ExplorerNode[];
  descendantsCount: (id: string) => number;
  settings: SiteSettings;
  skillCategories: SkillCategory[];
  media: MediaItem[];
  onDirty: (dirty: boolean) => void;
  onSaved: (id: string) => void;
  onDeleted: () => void;
}) {
  const kind = node?.kind ?? newKind ?? "file";
  const isFolder = kind === "folder";
  const [fileType, setFileType] = useState<FileType>(node?.file_type ?? "markdown");
  const [parentId, setParentId] = useState<string | null>(node ? node.parent_id : (newParentId ?? null));
  const [name, setName] = useState(node?.name ?? "");
  const [route, setRoute] = useState(node?.route ?? "");

  const { state, onSubmit, pending, errors } = useAdminAction(saveNode, {
    onSuccess: (r) => r.data && onSaved(r.data.id),
  });

  // A folder cannot be moved into itself or its own subtree.
  const blocked = new Set<string>();
  if (node?.kind === "folder") {
    const walk = (id: string) => {
      blocked.add(id);
      childrenOf(id).forEach((c) => walk(c.id));
    };
    walk(node.id);
  }
  const folderOptions = nodes
    .filter((n) => n.kind === "folder" && !blocked.has(n.id))
    .map((n) => ({ id: n.id, label: pathOf(n.id).map((p) => p.name).join(" / ") }))
    .sort((a, b) => a.label.localeCompare(b.label, "tr"));

  const siblings = childrenOf(parentId).filter((n) => n.id !== node?.id);
  const defaultSort = node?.sort_order ?? (siblings.length ? Math.max(...siblings.map((s) => s.sort_order)) + 10 : 0);

  const suggestRoute = () => {
    const folders = pathOf(parentId).filter((p) => p.kind === "folder").map((p) => slugify(p.name)).filter(Boolean);
    const own = slugify(name);
    setRoute(`/${[...folders, own].filter(Boolean).join("/")}`);
  };

  const hasPage = !isFolder && fileType !== "link";
  const ctx = { lang: "tr" as const, settings, skillCategories };
  const ctxEn = { ...ctx, lang: "en" as const };
  const title = node ? node.name : isFolder ? "Yeni klasör" : "Yeni dosya";

  return (
    <form onSubmit={onSubmit} className="adm-form" onInput={() => onDirty(true)} onChange={() => onDirty(true)}>
      <div className="adm-card-header">
        <h2>
          <Icon name={node?.icon || (isFolder ? "folder" : DEFAULT_FILE_ICON[fileType])} size={16} />
          {title}
          {node && !node.is_published && <span className="adm-badge adm-badge-warning">Yayında değil</span>}
        </h2>
        {node && hasPage && node.route && node.is_published && (
          <a className="adm-btn adm-btn-sm" href={node.route} target="_blank" rel="noopener noreferrer">
            <VscLinkExternal aria-hidden /> Sitede aç
          </a>
        )}
      </div>

      <div className="adm-card-body adm-form">
        <FormError state={state} />
        <input type="hidden" name="id" value={node?.id ?? ""} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="sort_order" value={defaultSort} />

        <div className="adm-form-grid">
          <TextField
            label={isFolder ? "Klasör adı" : "Dosya adı"}
            hint="(gezginde görünen)"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            errors={errors}
            placeholder={isFolder ? "projects" : "README.md"}
          />
          <TextField
            label="İngilizce ad"
            hint="(isteğe bağlı)"
            name="name_en"
            defaultValue={node?.name_en ?? ""}
            maxLength={120}
            errors={errors}
            help="Site İngilizce görüntülenirken bu ad kullanılır; boşsa yukarıdaki ad gösterilir."
          />

          <SelectField label="Bulunduğu klasör" name="parent_id" value={parentId ?? ""} onChange={(e) => setParentId(e.target.value || null)} errors={errors}>
            <option value="">(Kök) MY-PORTFOLIO-WEBSITE</option>
            {folderOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </SelectField>

          {!isFolder && (
            <SelectField
              label="Dosya türü"
              name="file_type"
              value={fileType}
              onChange={(e) => setFileType(e.target.value as FileType)}
              errors={errors}
              help={FILE_TYPE_INFO[fileType].help}
            >
              {(Object.keys(FILE_TYPE_INFO) as FileType[]).map((t) => (
                <option key={t} value={t}>
                  {FILE_TYPE_INFO[t].label}
                </option>
              ))}
            </SelectField>
          )}

          {hasPage && (
            <div className="adm-field adm-span-2">
              <label className="adm-label" htmlFor="node-route">
                Sayfa adresi <span className="adm-label-hint">(URL)</span>
              </label>
              <div className="adm-addon">
                <input
                  id="node-route"
                  name="route"
                  className="adm-input adm-mono"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="/projects/yeni-proje"
                  maxLength={200}
                  aria-invalid={errors.route ? true : undefined}
                />
                <button type="button" className="adm-btn" onClick={suggestRoute}>
                  Öner
                </button>
              </div>
              {errors.route ? <p className="adm-error-text">{errors.route[0]}</p> : <p className="adm-help">Küçük harf, rakam ve tire. Ana sayfa için yalnızca /.</p>}
            </div>
          )}

          {!isFolder && (fileType === "link" || fileType === "embed") && (
            <TextField
              wrapClassName="adm-span-2"
              label={fileType === "link" ? "Bağlantı adresi" : "Gömülecek sayfa adresi"}
              name="url"
              defaultValue={node?.url ?? ""}
              placeholder={fileType === "link" ? "https://github.com/... ya da mailto:ad@alan.com" : "https://kullanici.github.io/oyun/"}
              mono
              maxLength={2000}
              errors={errors}
            />
          )}

          {!isFolder && (fileType === "pdf" || fileType === "image") && (
            <div className="adm-span-2">
              <AssetPicker
                name="asset_url"
                defaultValue={node?.asset_url ?? ""}
                media={media}
                kind={fileType === "pdf" ? "pdf" : "image"}
                label={fileType === "pdf" ? "PDF dosyası" : "Görsel dosyası"}
                error={errors.asset_url}
              />
            </div>
          )}

          <IconPicker name="icon" defaultValue={node?.icon} groups={isFolder ? ["folder", "file"] : ["file", "folder", "tech"]} errors={errors} />
        </div>

        {!isFolder && (fileType === "markdown" || fileType === "home") && (
          <LangTabs errorsIn={{ tr: !!errors.content_tr, en: !!errors.content_en }} initial={!node?.content_tr && node?.content_en ? "en" : "tr"}>
            {(lang) => (
              <MarkdownEditor
                name={`content_${lang}`}
                label={lang === "tr" ? "İçerik (Türkçe)" : "Content (English)"}
                defaultValue={(lang === "tr" ? node?.content_tr : node?.content_en) ?? ""}
                ctx={lang === "tr" ? ctx : ctxEn}
                error={errors[`content_${lang}`]}
              />
            )}
          </LangTabs>
        )}

        {!isFolder && fileType === "embed" && (
          <div className="adm-form-grid">
            <TextField label="Çerçeve başlığı (Türkçe)" name="content_tr" defaultValue={node?.content_tr ?? ""} maxLength={200} errors={errors} help="Ekran okuyucular için başlık; boşsa dosya adı kullanılır." />
            <TextField label="Frame title (English)" name="content_en" defaultValue={node?.content_en ?? ""} maxLength={200} errors={errors} />
          </div>
        )}

        {!isFolder && (fileType === "experience" || fileType === "skills") && (
          <p className="adm-alert adm-alert-info">
            <VscInfo aria-hidden />
            Bu sayfanın içeriği {fileType === "experience" ? "Deneyim" : "Yetenekler"} bölümünden gelir. Kayıtları oradan düzenleyin.
          </p>
        )}

        {!isFolder && (fileType === "markdown" || fileType === "home") && (
          <p className="adm-help">
            Bir dilde içerik boş bırakılırsa ziyaretçiye diğer dildeki içerik gösterilir. Ham HTML desteklenmez; bu, siteyi zararlı kodlara karşı korur.
          </p>
        )}

        <div className="adm-form-grid">
          <Toggle name="is_published" label="Yayında" description="Kapalıyken ziyaretçiler göremez; klasörse içindekiler de gizlenir." defaultChecked={node?.is_published ?? true} />
          <Toggle name="show_in_explorer" label="Gezginde göster" description="Kapalıyken sayfa adresiyle açılabilir ama ağaçta listelenmez." defaultChecked={node?.show_in_explorer ?? true} />
        </div>

        <div className="adm-form-actions adm-sticky-actions">
          <SubmitButton pending={pending}>{node ? "Değişiklikleri kaydet" : isFolder ? "Klasörü oluştur" : "Dosyayı oluştur"}</SubmitButton>
          {node && (
            <DeleteButton
              action={deleteNode}
              fields={{ id: node.id }}
              title={isFolder ? "Klasör silinsin mi?" : "Dosya silinsin mi?"}
              message={
                isFolder
                  ? `"${node.name}" ve içindeki ${descendantsCount(node.id)} öğe kalıcı olarak silinecek. Bu işlem geri alınamaz.`
                  : `"${node.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`
              }
              label="Sil"
              size="md"
              iconOnly={<VscTrash />}
              onDone={onDeleted}
            />
          )}
        </div>
      </div>
    </form>
  );
}
