import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RecruiterSidebar } from "@/components/recruiter-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { RecruiterUserNav } from "@/components/recruiter-user-nav";
import { NotificationBell } from "@/components/shared/notification-bell";
import LogoLink from "@/components/logo-link";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const recruiterToken = cookieStore.get("recruiter_token")?.value;

  const isAuthenticated = Boolean(recruiterToken);

  const userData = {
    name: "Recruiter",
    email: "",
  };

  if (!isAuthenticated) {
    // Allow public recruiter pages (login/signup) to render without forcing a redirect.
    // Protected pages should enforce authentication themselves.
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
