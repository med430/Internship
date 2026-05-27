"use client";

import { useState } from "react";
import { User, Lock, Image, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SecurityTab } from "@/components/profile/security-tab";
import { RecruiterProfileInfoTab } from "./tabs/recruiter-profile-info-tab";
import { RecruiterAvatarTab } from "./tabs/recruiter-avatar-tab";
import { RecruiterDangerZoneTab } from "./tabs/recruiter-danger-zone-tab";
import type { RecruiterProfileData } from "@/lib/api/recruiter-profile-api";

interface RecruiterProfileTabsProps {
  profile: RecruiterProfileData;
  userEmail: string;
  isOAuthUser: boolean;
}

const tabs = [
  { id: "profile",  label: "Profile",     icon: User },
  { id: "avatar",   label: "Avatar",      icon: Image },
  { id: "security", label: "Security",    icon: Lock },
  { id: "danger",   label: "Danger Zone", icon: AlertTriangle, isDanger: true },
];

export function RecruiterProfileTabs({ profile, userEmail, isOAuthUser }: RecruiterProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <>
      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0">
        <Card className="sticky top-8">
          <CardContent className="p-3 sm:p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      tab.isDanger && activeTab === tab.id && "text-destructive",
                      tab.isDanger && activeTab !== tab.id && "hover:text-destructive",
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <Card>
          <CardContent className="p-3 sm:p-6 lg:p-8">
            {activeTab === "profile"  && <RecruiterProfileInfoTab profile={profile} />}
            {activeTab === "avatar"   && <RecruiterAvatarTab profile={profile} />}
            {activeTab === "security" && <SecurityTab userEmail={userEmail} isOAuthUser={isOAuthUser} />}
            {activeTab === "danger"   && <RecruiterDangerZoneTab />}
          </CardContent>
        </Card>
      </div>
    </>
  );
}