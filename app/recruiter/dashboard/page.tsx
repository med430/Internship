import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { RecruiterDashboardScreen } from "@/features/recruiter/dashboard/components/recruiter-dashboard-screen";

export default async function RecruiterDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name =
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Recruiter";

  return <RecruiterDashboardScreen userName={name} />;
}
