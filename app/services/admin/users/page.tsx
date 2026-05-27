import { createClient } from "@/utils/supabase/server";
import { AdminUsersScreen } from "@/features/admin-users/components/admin-users-screen";
import { fetchAdminUsers } from "@/lib/api/admin-client";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const users = session?.access_token
    ? await fetchAdminUsers(session.access_token).catch(() => [])
    : [];

  return <AdminUsersScreen users={users} />;
}