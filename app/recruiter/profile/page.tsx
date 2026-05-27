import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { RecruiterProfileScreen } from "@/features/recruiter/profile/components/recruiter-profile-screen";
import type { RecruiterProfileData } from "@/lib/api/recruiter-profile-api";

async function fetchRecruiterProfileServer(
  accessToken: string,
  userEmail: string,
): Promise<RecruiterProfileData | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const res = await fetch(`${apiBase}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `query {
        recruiterProfiles(pageNumber: 1, pageSize: 500) {
          id
          company
          companyDescription
          website
          user {
            id
            name
            lastname
            username
            email
            phone
            avatarUrl
          }
        }
      }`,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = (await res.json()) as {
    data?: { recruiterProfiles: RecruiterProfileData[] };
  };

  return (
    json.data?.recruiterProfiles.find((p) => p.user.email === userEmail) ?? null
  );
}

export default async function RecruiterProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) redirect("/login");

  const profile = await fetchRecruiterProfileServer(session.access_token, user.email);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
        Profile not found. Make sure your account is set up correctly.
      </div>
    );
  }

  const isOAuthUser = user.identities?.some(
    (identity) => identity.provider !== "email",
  ) ?? false;

  return (
    <RecruiterProfileScreen
      profile={profile}
      userEmail={user.email}
      isOAuthUser={isOAuthUser}
    />
  );
}