import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getServerProfile } from "@/lib/profile/backend";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const profile = await getServerProfile();

  if (!profile) {
    redirect("/complete-profile");
  }

  const isOAuthUser = user.identities?.some(
    (identity) => identity.provider !== "email",
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-6 sm:py-8 lg:py-12">
        <div className="space-y-4 sm:space-y-6">

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/services/dashboard">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Back to Dashboard</span>
                <span className="xs:hidden">Back</span>
              </Link>
            </Button>
            <ThemeToggle />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Profile Settings
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Manage your account and preferences
            </p>
          </div>


          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            <ProfileTabs
              profile={profile}
              userEmail={user.email || ""}
              isOAuthUser={isOAuthUser || false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
