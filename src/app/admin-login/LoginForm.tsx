"use client";

import { useActionState, useState } from "react";
import { VscEye, VscEyeClosed, VscLock, VscMail, VscWarning, VscInfo } from "react-icons/vsc";
import { login, type LoginState } from "./actions";

export default function LoginForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="adm-login-card" noValidate={false}>
      <div className="adm-login-brand">
        <div>
          <h1>Yönetim Paneli</h1>
          <p>my-portfolio-website</p>
        </div>
      </div>

      {expired && !state.error && (
        <p className="adm-alert adm-alert-info" role="status">
          <VscInfo aria-hidden /> Oturum süresi doldu. Lütfen tekrar giriş yapın.
        </p>
      )}
      {state.error && (
        <p className="adm-alert adm-alert-error" role="alert">
          <VscWarning aria-hidden /> {state.error}
        </p>
      )}

      <label className="adm-field">
        <span className="adm-label">E-posta</span>
        <span className="adm-input-wrap">
          <VscMail aria-hidden className="adm-input-icon" />
          <input
            className="adm-input adm-input-with-icon"
            type="email"
            name="email"
            autoComplete="username"
            required
            maxLength={254}
            defaultValue={state.email ?? ""}
            autoFocus
          />
        </span>
      </label>

      <label className="adm-field">
        <span className="adm-label">Şifre</span>
        <span className="adm-input-wrap">
          <VscLock aria-hidden className="adm-input-icon" />
          <input
            className="adm-input adm-input-with-icon adm-input-with-action"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            maxLength={128}
          />
          <button
            type="button"
            className="adm-input-action"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPassword ? <VscEyeClosed /> : <VscEye />}
          </button>
        </span>
      </label>

      <button type="submit" className="adm-btn adm-btn-primary adm-btn-block" disabled={pending}>
        {pending ? "Giriş yapılıyor..." : "Giriş yap"}
      </button>
    </form>
  );
}
