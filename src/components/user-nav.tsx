"use client";

import React from "react";
import Link from "next/link";
import { User, LogOut, Moon, Sun, Bell, Crown } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { useNotificationStore } from "@/lib/stores/notification-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";

interface UserNavProps {
  user: {
    name?: string;
    email?: string;
    avatar?: string;
    profileCompletion?: number;
    profileCompletedAt?: string | null;
    role?: string;
  };
}

export function UserNav({ user }: UserNavProps) {
  const { theme, setTheme } = useTheme();
  const { unreadCount } = useNotificationStore();
  const { isPro, fetchStatus } = useSubscriptionStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    fetchStatus();
  }, [fetchStatus]);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const completion = user.profileCompletion || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
          suppressHydrationWarning
        >
          <Avatar className="h-9 w-9 ring-2 ring-border">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          {/* PRO crown — top-left of avatar */}
          {isPro && (
            <div className="absolute -top-1.5 -left-1.5 flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 border-2 border-card shadow-md">
              <Crown className="h-2.5 w-2.5 text-white" />
            </div>
          )}
          {/* Glassy completion badge — bottom-right of avatar */}
          <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
            <div className="relative h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-primary border-2 border-card shadow-md">
              <span className="text-[8px] font-bold text-primary-foreground">
                {completion}%
              </span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">
                {user.name || "User"}
              </p>
              {isPro && (
                <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white">
                  <Crown className="h-2.5 w-2.5" />
                  PRO
                </span>
              )}
              {user.role === "ADMIN" && (
                <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-destructive text-destructive-foreground">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {completion}%
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mounted && (
          <DropdownMenuItem className="sm:hidden cursor-pointer" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="sm:hidden cursor-pointer relative">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="sm:hidden" />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
