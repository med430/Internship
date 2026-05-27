"use client";

import { ServicesSidebar } from "@/features/services-navigation/components/services-sidebar";

interface AppSidebarProps {
  role?: string;
}

export function AppSidebar({ role }: AppSidebarProps) {
  return <ServicesSidebar role={role} />;
}
