"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Briefcase,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Sparkles,
  Video,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAsyncJobsStore } from "@/lib/stores/async-jobs-store";
import {
  CAREER_GUIDE_ITEMS,
  COVER_LETTER_ITEMS,
  CV_BOOSTER_ITEMS,
  PORTFOLIO_BUILDER_ITEMS,
  PRIMARY_ITEMS,
  VIRTUAL_INTERVIEWER_ITEMS,
} from "../lib/menu";
import { SidebarCollapsibleGroup } from "./sidebar-collapsible-group";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ServicesSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { resolvedTheme } = useTheme();
  const isHydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const [isCVBoosterOpen, setIsCVBoosterOpen] = useState(true);
  const [isCareerGuideOpen, setIsCareerGuideOpen] = useState(true);
  const [isPortfolioBuilderOpen, setIsPortfolioBuilderOpen] = useState(true);
  const [isVirtualInterviewerOpen, setIsVirtualInterviewerOpen] = useState(true);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(true);

  const isCareerGuideLoading = useAsyncJobsStore((store) =>
    store.isFeatureLoading("career-guide"),
  );
  const isCVRewriterLoading = useAsyncJobsStore((store) =>
    store.isFeatureLoading("cv-rewriter"),
  );
  const isPortfolioBuilderLoading = useAsyncJobsStore((store) =>
    store.isFeatureLoading("portfolio-builder"),
  );

  const isCareerGuideLoadingVisible = isHydrated && isCareerGuideLoading;
  const isCVRewriterLoadingVisible = isHydrated && isCVRewriterLoading;
  const isPortfolioBuilderLoadingVisible =
    isHydrated && isPortfolioBuilderLoading;

  const isCollapsed = state === "collapsed";
  const isCVBoosterActive = pathname.startsWith("/services/cv-rewriter");
  const isCareerGuideActive = pathname.startsWith("/services/career-guide");
  const isCoverLetterActive = pathname.startsWith("/services/cover-letters");
  const isPortfolioBuilderActive = pathname.startsWith(
    "/services/portfolio-builder",
  );
  const isVirtualInterviewerActive = pathname.startsWith(
    "/services/virtual-interviewer",
  );

  const logoSrc = isCollapsed
    ? isHydrated && resolvedTheme === "light"
      ? "/stagio_logo_1.png"
      : "/stagio-logo-white.png"
    : isHydrated && resolvedTheme === "light"
      ? "/stagio_logo_1.png"
      : "/stagio-logo-white.png";

  return (
    <Sidebar
      collapsible="icon"
      className="shadow-lg dark:shadow-2xl"
      suppressHydrationWarning
    >
      <SidebarHeader className="border-b border-sidebar-border h-16 px-4 flex items-center justify-center">
        <Link href="/" className="flex items-center justify-center shrink-0">
          <div
            className={
              isCollapsed
                ? "min-w-[48px] min-h-[48px] w-[48px] h-[48px] flex items-center justify-center"
                : "h-10 flex items-center justify-center"
            }
          >
            <Image
              src={logoSrc}
              alt="Stagio Logo"
              width={isCollapsed ? 48 : 180}
              height={isCollapsed ? 48 : 180}
              style={
                isCollapsed
                  ? {
                      width: "48px",
                      height: "48px",
                      minWidth: "48px",
                      minHeight: "48px",
                    }
                  : { height: "44px", width: "auto" }
              }
              className="object-contain shrink-0"
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/services/dashboard"}
                >
                  <Link href="/services/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarCollapsibleGroup
                title="CV Booster"
                baseUrl="/services/cv-rewriter"
                currentPath={pathname}
                icon={Sparkles}
                isActive={isCVBoosterActive}
                isCollapsed={isCollapsed}
                isLoading={isCVRewriterLoadingVisible}
                items={CV_BOOSTER_ITEMS}
                open={isCVBoosterOpen}
                onOpenChange={setIsCVBoosterOpen}
              />

              <SidebarCollapsibleGroup
                title="Virtual Interviewer"
                baseUrl="/services/virtual-interviewer"
                currentPath={pathname}
                icon={Video}
                isActive={isVirtualInterviewerActive}
                isCollapsed={isCollapsed}
                items={VIRTUAL_INTERVIEWER_ITEMS}
                open={isVirtualInterviewerOpen}
                onOpenChange={setIsVirtualInterviewerOpen}
              />

              {PRIMARY_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <SidebarCollapsibleGroup
                title="Portfolio Builder"
                baseUrl="/services/portfolio-builder"
                currentPath={pathname}
                icon={Briefcase}
                isActive={isPortfolioBuilderActive}
                isCollapsed={isCollapsed}
                isLoading={isPortfolioBuilderLoadingVisible}
                items={PORTFOLIO_BUILDER_ITEMS}
                open={isPortfolioBuilderOpen}
                onOpenChange={setIsPortfolioBuilderOpen}
              />

              <SidebarCollapsibleGroup
                title="Career Guide"
                baseUrl="/services/career-guide"
                currentPath={pathname}
                icon={GraduationCap}
                isActive={isCareerGuideActive}
                isCollapsed={isCollapsed}
                isLoading={isCareerGuideLoadingVisible}
                items={CAREER_GUIDE_ITEMS}
                open={isCareerGuideOpen}
                onOpenChange={setIsCareerGuideOpen}
              />

              <SidebarCollapsibleGroup
                title="Cover Letters"
                baseUrl="/services/cover-letters"
                currentPath={pathname}
                icon={Mail}
                isActive={isCoverLetterActive}
                isCollapsed={isCollapsed}
                items={COVER_LETTER_ITEMS}
                open={isCoverLetterOpen}
                onOpenChange={setIsCoverLetterOpen}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="opacity-50 hover:opacity-100">
              <Link href="/contact">
                <Mail className="h-5 w-5" />
                <span>Contact Us</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
