"use client";

import { useRef, useState } from "react";
import { VscAccount, VscKey, VscShield, VscSignOut } from "react-icons/vsc";
import { changePassword, logoutEverywhere } from "../_actions/account";
import { FormError, PageHeader, SubmitButton, TextField, useAdminAction, ConfirmDialog } from "../_components/ui";

function strength(p: string) {
  let score = 0;
  if (p.length >= 12) score++;
  if (p.length >= 16) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
}

export default function AccountForms({ email }: { email: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pw, setPw] = useState("");
  const [confirmOut, setConfirmOut] = useState(false);
  const { state, onSubmit, pending, errors } = useAdminAction(changePassword, {
    onSuccess: () => {
      formRef.current?.reset();
      setPw("");
    },
  });
  const s = strength(pw);
  const labels = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü", "Çok güçlü"];

  return (
    <>
      <PageHeader title="Hesap" icon={<VscAccount aria-hidden />} description={`Giriş yapılan hesap: ${email}`} />

      <section className="adm-card">
        <div className="adm-card-header">
          <h2>
            <VscKey aria-hidden /> Şifre değiştir
          </h2>
        </div>
        <form ref={formRef} onSubmit={onSubmit} className="adm-card-body adm-form" style={{ maxWidth: 520 }}>
          <FormError state={state} />
          <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />
          <TextField label="Mevcut şifre" name="current_password" type="password" autoComplete="current-password" required maxLength={128} errors={errors} />
          <TextField
            label="Yeni şifre"
            name="new_password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={128}
            errors={errors}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            help="En az 12 karakter; büyük harf, küçük harf, rakam ve sembol içermeli."
          />
          {pw && (
            <div className="adm-field">
              <div className="adm-progress" aria-hidden>
                <div style={{ width: `${(s / 5) * 100}%`, background: s >= 4 ? "var(--adm-success)" : s >= 3 ? "var(--adm-warning)" : "var(--adm-danger)" }} />
              </div>
              <span className="adm-help">Güç: {labels[s]}</span>
            </div>
          )}
          <TextField label="Yeni şifre (tekrar)" name="confirm_password" type="password" autoComplete="new-password" required maxLength={128} errors={errors} />
          <div className="adm-form-actions">
            <SubmitButton pending={pending}>Şifreyi değiştir</SubmitButton>
          </div>
        </form>
      </section>

      <section className="adm-card">
        <div className="adm-card-header">
          <h2>
            <VscShield aria-hidden /> Oturumlar
          </h2>
        </div>
        <div className="adm-card-body adm-form">
          <p className="adm-help">
            Oturumlar 60 dakika işlem yapılmadığında ve en geç 8 saat sonra kendiliğinden kapanır. Şüpheli bir durum varsa tüm cihazlardaki oturumları hemen kapatın.
          </p>
          <div>
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => setConfirmOut(true)}>
              <VscSignOut aria-hidden /> Tüm cihazlardan çıkış yap
            </button>
          </div>
          <form id="logout-everywhere" action={logoutEverywhere} hidden />
          <ConfirmDialog
            open={confirmOut}
            title="Tüm oturumlar kapatılsın mı?"
            message="Bu cihaz dahil, hesabınızın açık olduğu her yerde oturum kapatılacak."
            confirmLabel="Çıkış yap"
            onCancel={() => setConfirmOut(false)}
            onConfirm={() => (document.getElementById("logout-everywhere") as HTMLFormElement | null)?.requestSubmit()}
          />
        </div>
      </section>
    </>
  );
}
