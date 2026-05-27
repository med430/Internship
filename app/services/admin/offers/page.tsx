import { createClient } from "@/utils/supabase/server";
import { AdminOffersScreen } from "@/features/admin-offers/components/admin-offers-screen";
import { fetchAdminOffers } from "@/lib/api/admin-client";

export default async function AdminOffersPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const offers = session?.access_token
    ? await fetchAdminOffers(session.access_token).catch(() => [])
    : [];

  return <AdminOffersScreen offers={offers} />;
}
