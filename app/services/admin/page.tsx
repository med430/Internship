import { createClient } from "@/utils/supabase/server";
import { AdminDashboardScreen } from "@/features/admin-dashboard/components/admin-dashboard-screen";
import { fetchAdminStats } from "@/lib/api/admin-client";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const stats = session?.access_token
    ? await fetchAdminStats(session.access_token).catch(() => null)
    : null;

  return <AdminDashboardScreen stats={stats} />;
}
