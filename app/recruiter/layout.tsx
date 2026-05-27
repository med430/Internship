import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RecruiterSidebar } from "@/components/recruiter-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { RecruiterUserNav } from "@/components/recruiter-user-nav";
import { NotificationBell } from "@/components/shared/notification-bell";
import LogoLink from "@/components/logo-link";
import { createClient } from "@/utils/supabase/server";

async function fetchRecruiterAvatar(
  accessToken: string,
  userEmail: string,
): Promise<string | null> {
  try {
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
            user { email avatarUrl }
          }
        }`,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { recruiterProfiles: { user: { email: string; avatarUrl: string | null } }[] };
    };
    return (
      json.data?.recruiterProfiles.find((p) => p.user.email === userEmail)
        ?.user.avatarUrl ?? null
    );
  } catch {
    return null;
  }
}

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthenticated = Boolean(user);

  let avatarUrl: string | null = null;
  if (user?.email && session?.access_token) {
    avatarUrl = await fetchRecruiterAvatar(session.access_token, user.email);
  }

  const userData = {
    name: user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "Recruiter",
    email: user?.email ?? "",
    avatar: avatarUrl ?? undefined,
  };

  if (!isAuthenticated) {
    return <main className="w-full">{children}</main>;
  }

  return (
    <SidebarProvider>
      <RecruiterSidebar />
      <main className="flex-1 w-full">
        <div className="border-b h-16 px-4 flex items-center justify-between bg-slate-100 dark:bg-neutral-950 shadow-sm z-50 fixed top-0 left-0 right-0">
          <div className="flex items-center gap-3">
            <LogoLink width={180} height={80} />
            <SidebarTrigger />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <NotificationBell />
              <ThemeToggle />
            </div>
            <RecruiterUserNav user={userData} />
          </div>
        </div>
        <div className="pt-16 shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.06),inset_0_2px_4px_-2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.3),inset_0_2px_4px_-2px_rgba(0,0,0,0.2)]">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}