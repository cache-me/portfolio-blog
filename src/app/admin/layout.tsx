import { cookies } from "next/headers";
import AdminAppShell from "@/components/admin/app-shell";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <AdminAppShell defaultOpen={defaultOpen}>
      <AdminHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</main>
    </AdminAppShell>
  );
}
