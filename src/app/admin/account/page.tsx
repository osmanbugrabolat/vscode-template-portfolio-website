import { requireAdmin } from "@/lib/server/auth";
import AccountForms from "./AccountForms";

export const metadata = { title: "Hesap" };

export default async function AccountPage() {
  const { user } = await requireAdmin();
  return (
    <div className="adm-page">
      <AccountForms email={user.email ?? ""} />
    </div>
  );
}
