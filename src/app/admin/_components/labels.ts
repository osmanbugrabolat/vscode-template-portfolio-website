const ACTIONS: Record<string, string> = {
  save: "kaydedildi",
  update: "güncellendi",
  delete: "silindi",
  reorder: "sıralandı",
  upload: "yüklendi",
  upload_start: "yükleme başladı",
  login: "giriş yapıldı",
  logout: "çıkış yapıldı",
  logout_everywhere: "tüm cihazlardan çıkış",
  login_denied_not_admin: "yetkisiz giriş denemesi",
  login_throttled: "giriş geçici olarak engellendi",
  change_password: "şifre değiştirildi",
  clear_logs: "kayıtlar temizlendi",
  preview: "test edildi",
};

const ENTITIES: Record<string, string> = {
  explorer_node: "Gezgin",
  site_settings: "Site ayarları",
  skill: "Yetenek",
  skill_category: "Yetenek kategorisi",
  experience: "Deneyim",
  chat_intent: "BuğrAI",
  chat_logs: "BuğrAI kayıtları",
  chat_matcher: "BuğrAI testi",
  media: "Medya",
  auth: "Oturum",
};

export const actionLabel = (a: string) => ACTIONS[a] ?? a;
export const entityLabel = (e: string) => ENTITIES[e] ?? e;

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(value));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
