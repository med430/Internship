import Link from "next/link";
import { ChevronRight, Loader2, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { SidebarMenuEntry } from "../lib/menu";

interface SidebarCollapsibleGroupProps {
  title: string;
  baseUrl: string;
  currentPath: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  isLoading?: boolean;
  items: SidebarMenuEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SidebarCollapsibleGroup({
  title,
  baseUrl,
  currentPath,
  icon: Icon,
  isActive,
  isCollapsed,
  isLoading = false,
  items,
  open,
  onOpenChange,
}: SidebarCollapsibleGroupProps) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {isCollapsed ? (
            <SidebarMenuButton asChild tooltip={title} isActive={isActive}>
              <Link href={baseUrl}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                <span>{title}</span>
              </Link>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton tooltip={title} isActive={isActive}>
              <Icon className="h-5 w-5" />
              <span>{title}</span>
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="space-y-1 mt-1">
            {items.map((item) => {
              const SubIcon = item.icon;
              const isRootItem = item.url === baseUrl;
              const isSubItemActive = isRootItem
                ? currentPath === item.url
                : currentPath === item.url || currentPath.startsWith(`${item.url}/`);
              return (
                <SidebarMenuSubItem key={item.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubItemActive}
                  >
                    <Link href={item.url}>
                      <SubIcon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
