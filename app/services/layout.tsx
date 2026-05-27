import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";
import { NotificationBell } from "@/components/shared/notification-bell";
import { ChatNotificationProvider } from "@/components/shared/chat-notification-provider";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import LogoLink from "@/components/logo-link";
import { getServerProfile } from "@/lib/profile/backend";

export default async function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If Supabase session is missing, allow backend JWT (interview_token) to authenticate server-side pages.
  const cookieStore = await cookies();
  const interviewToken = cookieStore.get("interview_token")?.value;

  if ((error || !user) && !interviewToken) {
    redirect("/login");
  }

  const profile = await getServerProfile();
  // user may be null when the page is accessed via an interviewToken-only session
  const role = (user?.app_metadata?.role as string | undefined) ?? undefined;

  const userData = {
    name: profile?.name || user?.user_metadata?.name || "User",
    email: profile?.email || user?.email || "",
    avatar:
      (profile?.avatar_url as string) || user?.user_metadata?.avatar_url || "",
    profileCompletion: calculateProfileCompletion(profile),
    role,
  };

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
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
            <UserNav user={userData} />
          </div>
        </div>
        <div className="pt-16 shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.06),inset_0_2px_4px_-2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.3),inset_0_2px_4px_-2px_rgba(0,0,0,0.2)]">
          <ChatNotificationProvider />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
