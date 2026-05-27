import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getServerMe } from "@/lib/auth/me";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Role check sources from NeonDB so it matches the backend's RolesGuard. JWT app_metadata is the fallback.
  const me = await getServerMe();
  const role = me?.role ?? user.app_metadata?.role;
  if (role !== "ADMIN") {
    redirect("/services/dashboard");
  }

  return <>{children}</>;
}
