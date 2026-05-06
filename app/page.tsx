import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { HomeLanding } from "@/features/home/components/home-landing";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/services/dashboard");
  }

  return <HomeLanding />;
}
