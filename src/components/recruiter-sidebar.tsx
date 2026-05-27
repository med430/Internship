"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, CalendarDays, ClipboardList, Globe, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard",     url: "/recruiter/dashboard",    icon: LayoutDashboard },
  { title: "My Offers",     url: "/recruiter/offers",       icon: Briefcase },
  { title: "Browse Offers", url: "/recruiter/browse",       icon: Globe },
  { title: "Applications",  url: "/recruiter/applications", icon: ClipboardList },
  { title: "Calendar",      url: "/recruiter/calendar",     icon: CalendarDays },
];

export function RecruiterSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="shadow-lg dark:shadow-2xl">
      <SidebarHeader className="border-b border-sidebar-border h-16 px-4 flex items-center">
        <span className="text-sm font-semibold">Recruiter</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.url || pathname.startsWith(`${item.url}/`);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link href={item.url}>
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
