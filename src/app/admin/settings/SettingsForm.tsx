"use client";

import { useRouter } from "next/navigation";
import { VscSettingsGear, VscPerson, VscMortarBoard, VscGlobe, VscRobot, VscLink } from "react-icons/vsc";
import type { SiteSettings } from "@/lib/cms/types";
import type { MediaItem } from "@/lib/server/media-list";
import { saveSettings } from "../_actions/content";
import AssetPicker from "../_components/AssetPicker";
import { FormError, LangTabs, PageHeader, SubmitButton, TextAreaField, TextField, Toggle, useAdminAction } from "../_components/ui";

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="adm-card">
      <div className="adm-card-header">
        <h2>
          {icon}
          {title}
        </h2>
      </div>
      <div className="adm-card-body adm-form">{children}</div>
    </section>
  );
}

export default function SettingsForm({ settings: s, media }: { settings: SiteSettings; media: MediaItem[] }) {
  const router = useRouter();
  const { state, onSubmit, pending, errors } = useAdminAction(saveSettings, { onSuccess: () => router.refresh() });
  const has = (...keys: string[]) => keys.some((k) => errors[k]);

  return (
    <form onSubmit={onSubmit} className="adm-form">
      <PageHeader
        title="Site Ayarları"
        icon={<VscSettingsGear aria-hidden />}
        description="Profil bilgileri, bağlantılar, eğitim, arama motoru açıklamaları ve BuğrAI karşılama mesajı. Bu bilgiler sitedeki bileşenlerde otomatik kullanılır."
        actions={<SubmitButton pending={pending}>Kaydet</SubmitButton>}
      />
      <FormError state={state} />

      <Section title="Profil" icon={<VscPerson aria-hidden />}>
        <div className="adm-form-grid">
          <TextField label="Ad soyad" name="name" defaultValue={s.name} required maxLength={120} errors={errors} />
          <div>
            <AssetPicker name="avatar_url" defaultValue={s.avatar_url} media={media} kind="image" label="Profil fotoğrafı" error={errors.avatar_url} />
          </div>
        </div>
        <LangTabs errorsIn={{ tr: has("title_tr", "subtitle_tr", "location_tr", "current_focus_tr"), en: has("title_en", "subtitle_en", "location_en", "current_focus_en") }}>
          {(l) => (
            <div className="adm-form-grid">
              <TextField label={l === "tr" ? "Unvan" : "Title"} name={`title_${l}`} defaultValue={s[`title_${l}`]} maxLength={160} errors={errors} />
              <TextField label={l === "tr" ? "Konum" : "Location"} name={`location_${l}`} defaultValue={s[`location_${l}`]} maxLength={120} errors={errors} />
              <TextField wrapClassName="adm-span-2" label={l === "tr" ? "Alt başlık / slogan" : "Subtitle"} name={`subtitle_${l}`} defaultValue={s[`subtitle_${l}`]} maxLength={240} errors={errors} />
              <TextAreaField
                wrapClassName="adm-span-2"
                label={l === "tr" ? "Şu anki odak (her satır bir madde)" : "Current focus (one per line)"}
                name={`current_focus_${l}`}
                defaultValue={s[`current_focus_${l}`].join("\n")}
                rows={4}
                errors={errors}
              />
            </div>
          )}
        </LangTabs>
        <Toggle name="available_for_work" label="İş tekliflerine açığım" description="Profil bilgisinde kullanılmak üzere saklanır." defaultChecked={s.available_for_work} />
      </Section>

      <Section title="İletişim ve bağlantılar" icon={<VscLink aria-hidden />}>
        <div className="adm-form-grid">
          <TextField label="E-posta" name="email" type="email" defaultValue={s.email} maxLength={254} errors={errors} />
          <TextField label="Web sitesi" name="website_url" type="url" defaultValue={s.website_url} placeholder="https://" errors={errors} />
          <TextField label="GitHub" name="github_url" type="url" defaultValue={s.github_url} placeholder="https://github.com/..." errors={errors} />
          <TextField label="LinkedIn" name="linkedin_url" type="url" defaultValue={s.linkedin_url} placeholder="https://linkedin.com/in/..." errors={errors} />
          <TextField label="Medium" name="medium_url" type="url" defaultValue={s.medium_url} placeholder="https://medium.com/@..." errors={errors} />
        </div>
      </Section>

      <Section title="Eğitim" icon={<VscMortarBoard aria-hidden />}>
        <div className="adm-form-grid">
          <TextField label="Bölüm (Türkçe)" name="education_degree_tr" defaultValue={s.education_degree_tr} maxLength={160} errors={errors} />
          <TextField label="Degree (English)" name="education_degree_en" defaultValue={s.education_degree_en} maxLength={160} errors={errors} />
          <TextField label="Okul" name="education_school" defaultValue={s.education_school} maxLength={160} errors={errors} />
          <TextField label="Yıllar" name="education_years" defaultValue={s.education_years} maxLength={60} placeholder="2021 – 2026" errors={errors} />
          <TextField label="Not ortalaması" name="education_gpa" defaultValue={s.education_gpa} maxLength={40} placeholder="3.75 / 4.0" errors={errors} />
        </div>
      </Section>

      <Section title="Arama motorları (SEO)" icon={<VscGlobe aria-hidden />}>
        <TextField label="Site başlığı" name="seo_title" defaultValue={s.seo_title} maxLength={120} errors={errors} help="Tarayıcı sekmesinde ve arama sonuçlarında görünür." />
        <div className="adm-form-grid">
          <TextAreaField label="Açıklama (Türkçe)" name="seo_description_tr" defaultValue={s.seo_description_tr} maxLength={320} rows={3} errors={errors} />
          <TextAreaField label="Description (English)" name="seo_description_en" defaultValue={s.seo_description_en} maxLength={320} rows={3} errors={errors} />
        </div>
      </Section>

      <Section title="BuğrAI ve terminal" icon={<VscRobot aria-hidden />}>
        <div className="adm-form-grid">
          <TextAreaField label="Karşılama mesajı (Türkçe)" name="chat_greeting_tr" defaultValue={s.chat_greeting_tr} maxLength={500} rows={3} errors={errors} />
          <TextAreaField label="Greeting (English)" name="chat_greeting_en" defaultValue={s.chat_greeting_en} maxLength={500} rows={3} errors={errors} />
          <TextField wrapClassName="adm-span-2" label="Terminal whoami çıktısı" name="terminal_whoami" defaultValue={s.terminal_whoami} maxLength={200} mono errors={errors} help="Alttaki panelde $ whoami komutunun çıktısı." />
        </div>
      </Section>

      <div className="adm-form-actions">
        <SubmitButton pending={pending}>Kaydet</SubmitButton>
      </div>
    </form>
  );
}
