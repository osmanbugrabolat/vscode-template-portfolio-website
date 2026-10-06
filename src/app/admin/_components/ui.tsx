"use client";

import {
  createContext,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { VscCheck, VscClose, VscError, VscInfo, VscSearch, VscWarning } from "react-icons/vsc";
import { ICON_GROUPS, ICON_LABELS, isIconKey } from "@/lib/icon-keys";
import { Icon } from "@/lib/icons";
import type { ActionResult } from "@/lib/server/admin-action";
import type { FieldErrors } from "@/lib/validation";

// ------------------------------------------------------------------ toasts

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

const ToastContext = createContext<(kind: ToastKind, text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const push = useCallback((kind: ToastKind, text: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 7000 : 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast-${t.kind}`}>
            {t.kind === "success" ? <VscCheck aria-hidden /> : t.kind === "error" ? <VscError aria-hidden /> : <VscInfo aria-hidden />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ------------------------------------------------------------------ actions

type ServerAction<T> = (prev: ActionResult<T> | undefined, formData: FormData) => Promise<ActionResult<T>>;

/**
 * useActionState + toast feedback. Returns field errors for the latest result.
 */
export function useAdminAction<T = undefined>(
  action: ServerAction<T>,
  options: { onSuccess?: (result: Extract<ActionResult<T>, { ok: true }>) => void; silent?: boolean } = {},
) {
  const [state, formAction, pending] = useActionState<ActionResult<T> | undefined, FormData>(action, undefined);
  const toast = useToast();
  const handled = useRef<ActionResult<T> | undefined>(undefined);
  const onSuccess = useRef(options.onSuccess);
  useEffect(() => {
    onSuccess.current = options.onSuccess;
  });

  useEffect(() => {
    if (!state || handled.current === state) return;
    handled.current = state;
    if (state.ok) {
      if (!options.silent && state.message) toast("success", state.message);
      onSuccess.current?.(state);
    } else {
      toast("error", state.error);
    }
  }, [state, toast, options.silent]);

  const errors: FieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const [, startTransition] = useTransition();
  /**
   * Use as <form onSubmit={onSubmit}>. Unlike <form action>, React does not
   * reset the fields afterwards, so a validation error never wipes the input.
   */
  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      startTransition(() => formAction(data));
    },
    [formAction],
  );
  return { state, formAction, onSubmit, pending, errors };
}

// ------------------------------------------------------------------ fields

export function Field({
  label,
  hint,
  help,
  error,
  children,
  className = "",
  id,
}: {
  label: ReactNode;
  hint?: ReactNode;
  help?: ReactNode;
  error?: string[] | string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={`adm-field ${className}`}>
      <label className="adm-label" htmlFor={id}>
        {label}
        {hint && <span className="adm-label-hint">{hint}</span>}
      </label>
      {children}
      {message ? (
        <p className="adm-error-text" id={id ? `${id}-error` : undefined}>
          <VscWarning aria-hidden /> {message}
        </p>
      ) : (
        help && <p className="adm-help">{help}</p>
      )}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; hint?: ReactNode; help?: ReactNode; errors?: FieldErrors; wrapClassName?: string; mono?: boolean };

export function TextField({ label, hint, help, errors, name, wrapClassName, mono, className = "", ...rest }: InputProps) {
  const id = useId();
  const error = name ? errors?.[name] : undefined;
  return (
    <Field label={label} hint={hint} help={help} error={error} className={wrapClassName} id={id}>
      <input
        id={id}
        name={name}
        className={`adm-input ${mono ? "adm-mono" : ""} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </Field>
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: ReactNode; hint?: ReactNode; help?: ReactNode; errors?: FieldErrors; wrapClassName?: string; mono?: boolean };

export function TextAreaField({ label, hint, help, errors, name, wrapClassName, mono, className = "", ...rest }: TextAreaProps) {
  const id = useId();
  const error = name ? errors?.[name] : undefined;
  return (
    <Field label={label} hint={hint} help={help} error={error} className={wrapClassName} id={id}>
      <textarea
        id={id}
        name={name}
        className={`adm-textarea ${mono ? "adm-mono" : ""} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </Field>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: ReactNode; hint?: ReactNode; help?: ReactNode; errors?: FieldErrors; wrapClassName?: string };

export function SelectField({ label, hint, help, errors, name, wrapClassName, children, ...rest }: SelectProps) {
  const id = useId();
  const error = name ? errors?.[name] : undefined;
  return (
    <Field label={label} hint={hint} help={help} error={error} className={wrapClassName} id={id}>
      <select id={id} name={name} className="adm-select" aria-invalid={error ? true : undefined} {...rest}>
        {children}
      </select>
    </Field>
  );
}

export function Toggle({ name, label, description, defaultChecked, checked, onChange }: { name: string; label: string; description?: string; defaultChecked?: boolean; checked?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className="adm-check">
      <input
        type="checkbox"
        name={name}
        role="switch"
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        checked={checked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
      />
      <span className="adm-check-text">
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </span>
    </label>
  );
}

export function SubmitButton({ pending, children, className = "adm-btn adm-btn-primary", disabled }: { pending: boolean; children: ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-busy={pending}>
      {pending ? "Kaydediliyor..." : children}
    </button>
  );
}

export function FormError({ state }: { state: ActionResult<unknown> | undefined }) {
  if (!state || state.ok) return null;
  return (
    <p className="adm-alert adm-alert-error" role="alert">
      <VscWarning aria-hidden /> {state.error}
    </p>
  );
}

// ------------------------------------------------------------------ language tabs

/** Renders TR and EN inputs side by side in tabs; both stay in the form. */
export function LangTabs({ children, errorsIn, initial = "tr" }: { children: (lang: "tr" | "en") => ReactNode; errorsIn?: { tr: boolean; en: boolean }; initial?: "tr" | "en" }) {
  const [lang, setLang] = useState<"tr" | "en">(initial);
  return (
    <div className="adm-field">
      <div className="adm-tabs" role="tablist">
        {(["tr", "en"] as const).map((l) => (
          <button key={l} type="button" role="tab" aria-selected={lang === l} className="adm-tab" onClick={() => setLang(l)}>
            {l === "tr" ? "Türkçe" : "English"}
            {errorsIn?.[l] && <VscWarning aria-label="hata var" color="var(--adm-danger)" />}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: 12 }}>
        {(["tr", "en"] as const).map((l) => (
          <div key={l} hidden={lang !== l}>
            {children(l)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ confirm dialog

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Sil",
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="adm-dialog" onCancel={(e) => (e.preventDefault(), onCancel())} aria-labelledby="adm-dialog-title">
      <div className="adm-dialog-body">
        <VscWarning size={22} className="adm-dialog-icon" aria-hidden />
        <div>
          <h2 id="adm-dialog-title">{title}</h2>
          <p>{message}</p>
        </div>
      </div>
      <div className="adm-dialog-actions">
        <button type="button" className="adm-btn" onClick={onCancel} disabled={pending}>
          Vazgeç
        </button>
        <button type="button" className="adm-btn adm-btn-danger-solid" onClick={onConfirm} disabled={pending} autoFocus>
          {pending ? "Siliniyor..." : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

/** A delete button that asks for confirmation, then posts { id } (and extra fields) to the action. */
export function DeleteButton<T>({
  action,
  fields,
  title,
  message,
  label = "Sil",
  iconOnly,
  onDone,
  size = "sm",
}: {
  action: ServerAction<T>;
  fields: Record<string, string>;
  title: string;
  message: ReactNode;
  label?: string;
  iconOnly?: ReactNode;
  onDone?: () => void;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  // Called directly (not via useActionState): the row this button lives in is
  // usually gone from the re-rendered page by the time the result arrives.
  const submit = () =>
    startTransition(async () => {
      const result = await action(undefined, toFormData(fields));
      if (result.ok) {
        toast("success", result.message ?? "Silindi.");
        setOpen(false);
        onDone?.();
      } else {
        toast("error", result.error);
      }
    });
  return (
    <>
      <button
        type="button"
        className={`adm-btn adm-btn-danger ${size === "sm" ? "adm-btn-sm" : ""} ${iconOnly ? "adm-btn-icon" : ""}`}
        onClick={() => setOpen(true)}
        aria-label={iconOnly ? label : undefined}
        title={iconOnly ? label : undefined}
      >
        {iconOnly ?? label}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        message={message}
        confirmLabel={label}
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={submit}
      />
    </>
  );
}

/** Small form button that posts fixed fields (e.g. move up/down). */
export function InlineActionButton<T>({ action, fields, label, children, disabled }: { action: ServerAction<T>; fields: Record<string, string>; label: string; children: ReactNode; disabled?: boolean }) {
  const [, startTransition] = useTransition();
  const { formAction, pending } = useAdminAction(action, { silent: true });
  return (
    <button
      type="button"
      className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm"
      aria-label={label}
      title={label}
      disabled={pending || disabled}
      onClick={() => startTransition(() => formAction(toFormData(fields)))}
    >
      {children}
    </button>
  );
}

function toFormData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

// ------------------------------------------------------------------ icon picker

export function IconPicker({ name, defaultValue, groups = ["file", "folder", "tech"], label = "İkon", errors, allowEmpty = true }: { name: string; defaultValue?: string | null; groups?: (keyof typeof ICON_GROUPS)[]; label?: string; errors?: FieldErrors; allowEmpty?: boolean }) {
  const [value, setValue] = useState<string>(isIconKey(defaultValue) ? defaultValue : "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const q = query.trim().toLocaleLowerCase("tr");
  const options = groups.flatMap((g) => ICON_GROUPS[g].map(([k, l]) => ({ key: k as string, label: l as string })))
    .filter((o) => !q || o.key.includes(q) || o.label.toLocaleLowerCase("tr").includes(q));

  return (
    <Field label={label} error={errors?.[name]} id={id}>
      <div className="adm-icon-picker" ref={ref}>
        <input type="hidden" name={name} value={value} />
        <button id={id} type="button" className="adm-btn adm-icon-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog">
          {value ? <Icon name={value} size={16} /> : <span className="adm-muted">Varsayılan</span>}
          <span>{value ? ICON_LABELS[value as keyof typeof ICON_LABELS] : ""}</span>
        </button>
        {open && (
          <div className="adm-icon-popover" role="dialog" aria-label="İkon seç">
            <div className="adm-input-wrap">
              <VscSearch className="adm-input-icon" aria-hidden />
              <input className="adm-input adm-input-with-icon" placeholder="İkon ara..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
            </div>
            <div className="adm-icon-grid">
              {allowEmpty && (
                <button type="button" className="adm-icon-cell" aria-pressed={value === ""} title="Varsayılan" onClick={() => (setValue(""), setOpen(false))}>
                  <VscClose aria-hidden />
                </button>
              )}
              {options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className="adm-icon-cell"
                  aria-pressed={value === o.key}
                  title={o.label}
                  aria-label={o.label}
                  onClick={() => {
                    setValue(o.key);
                    setOpen(false);
                  }}
                >
                  <Icon name={o.key} size={18} color="currentColor" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}

export function PageHeader({ title, icon, description, actions }: { title: string; icon?: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="adm-page-header">
      <div>
        <h1>
          {icon}
          {title}
        </h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="adm-btn-group">{actions}</div>}
    </div>
  );
}
