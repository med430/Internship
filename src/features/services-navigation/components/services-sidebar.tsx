"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Briefcase,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Phone,
  Shield,
  Sparkles,
  Target,
  Users,
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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAsyncJobsStore } from "@/lib/stores/async-jobs-store";
import {
  ADMIN_ITEMS,
  CAREER_GUIDE_ITEMS,
  CV_BOOSTER_ITEMS,
  PORTFOLIO_BUILDER_ITEMS,
  VIRTUAL_INTERVIEWER_ITEMS,
} from "../lib/menu";
import { SidebarCollapsibleGroup } from "./sidebar-collapsible-group";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface ServicesSidebarProps {
  role?: string;
}

export function ServicesSidebar({ role }: ServicesSidebarProps) {
  const isAdmin = role === "ADMIN";
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const { resolvedTheme } = useTheme();

  const isHydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const isCollapsed = state === "collapsed";

  const handleStartCall = () => {
    router.push(`/services/call?room=${crypto.randomUUID()}`);
  };

  /* ── async loading indicators ── */
  const isCareerGuideLoading = useAsyncJobsStore((s) => s.isFeatureLoading("career-guide"));
  const isCVRewriterLoading = useAsyncJobsStore((s) => s.isFeatureLoading("cv-rewriter"));
  const isPortfolioBuilderLoading = useAsyncJobsStore((s) => s.isFeatureLoading("portfolio-builder"));

  /* ── collapsible group states ── */
  const [isCVBoosterOpen, setIsCVBoosterOpen] = useState(false);
  const [isCareerGuideOpen, setIsCareerGuideOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isVIOpen, setIsVIOpen] = useState(false);

  /* ── active route helpers ── */
  const is = (prefix: string) => pathname.startsWith(prefix);
  const exact = (url: string) => pathname === url;

  const logoSrc =
    isHydrated && resolvedTheme === "light"
      ? "/stagio_logo_1.png"
      : "/stagio-logo-white.png";

  return (
    <Sidebar collapsible="icon" className="shadow-lg dark:shadow-2xl" suppressHydrationWarning>
      {/* ── Logo ── */}
      <SidebarHeader className="border-b border-sidebar-border h-16 px-4 flex items-center justify-center">
        <Link href="/" className="flex items-center justify-center shrink-0">
          <div className={isCollapsed ? "w-10 h-10 flex items-center justify-center" : "h-10 flex items-center"}>
            <Image
              src={logoSrc}
              alt="Stagio"
              width={isCollapsed ? 40 : 160}
              height={40}
              style={isCollapsed ? { width: 40, height: 40 } : { height: 36, width: "auto" }}
              className="object-contain shrink-0"
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>

        {/* ── Home ── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={exact("/services/dashboard")} tooltip="Dashboard">
                  <Link href="/services/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── AI Career Tools ── */}
        <SidebarGroup>
          <SidebarGroupLabel>AI Career Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarCollapsibleGroup
                title="CV Booster"
                baseUrl="/services/cv-rewriter"
                currentPath={pathname}
                icon={Sparkles}
                isActive={is("/services/cv-rewriter")}
                isCollapsed={isCollapsed}
                isLoading={isHydrated && isCVRewriterLoading}
                items={CV_BOOSTER_ITEMS}
                open={isCVBoosterOpen}
                onOpenChange={setIsCVBoosterOpen}
              />

              <SidebarCollapsibleGroup
                title="Career Guide"
                baseUrl="/services/career-guide"
                currentPath={pathname}
                icon={GraduationCap}
                isActive={is("/services/career-guide")}
                isCollapsed={isCollapsed}
                isLoading={isHydrated && isCareerGuideLoading}
                items={CAREER_GUIDE_ITEMS}
                open={isCareerGuideOpen}
                onOpenChange={setIsCareerGuideOpen}
              />

              <SidebarCollapsibleGroup
                title="Virtual Interviewer"
                baseUrl="/services/virtual-interviewer"
                currentPath={pathname}
                icon={Video}
                isActive={is("/services/virtual-interviewer")}
                isCollapsed={isCollapsed}
                items={VIRTUAL_INTERVIEWER_ITEMS}
                open={isVIOpen}
                onOpenChange={setIsVIOpen}
              />

              <SidebarCollapsibleGroup
                title="Portfolio Builder"
                baseUrl="/services/portfolio-builder"
                currentPath={pathname}
                icon={Briefcase}
                isActive={is("/services/portfolio-builder")}
                isCollapsed={isCollapsed}
                isLoading={isHydrated && isPortfolioBuilderLoading}
                items={PORTFOLIO_BUILDER_ITEMS}
                open={isPortfolioOpen}
                onOpenChange={setIsPortfolioOpen}
              />

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={is("/services/document-generator")} tooltip="CV & Letter Generator">
                  <Link href="/services/document-generator">
                    <FileText className="h-5 w-5" />
                    <span>CV & Letter Generator</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── Job Search ── */}
        <SidebarGroup>
          <SidebarGroupLabel>Job Search</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={is("/services/offers")} tooltip="Offers">
                  <Link href="/services/offers">
                    <Target className="h-5 w-5" />
                    <span>Browse Offers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={exact("/services/jobmatcher")} tooltip="Job Matcher">
                  <Link href="/services/jobmatcher">
                    <Sparkles className="h-5 w-5" />
                    <span>Job Matcher</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={is("/services/applications")} tooltip="Applications">
                  <Link href="/services/applications">
                    <ClipboardList className="h-5 w-5" />
                    <span>My Applications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── Communication & Tools ── */}
        <SidebarGroup>
          <SidebarGroupLabel>Communication</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={is("/services/chat")} tooltip="Messages">
                  <Link href="/services/chat">
                    <MessageSquare className="h-5 w-5" />
                    <span>Messages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={is("/services/calendar")} tooltip="Calendar">
                  <Link href="/services/calendar">
                    <CalendarDays className="h-5 w-5" />
                    <span>Calendar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Video Call"
                  isActive={is("/services/call")}
                  onClick={handleStartCall}
                >
                  <Phone className="h-5 w-5" />
                  <span>Video Call</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Administration (ADMIN only) ── */}
        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {ADMIN_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const IconMap: Record<string, React.ElementType> = {
                      Overview: LayoutDashboard,
                      Users: Users,
                      Offers: Target,
                      Recommendations: Shield,
                    };
                    const AdminIcon = IconMap[item.title] ?? Icon;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={pathname === item.url || pathname.startsWith(item.url + "/")}
                        >
                          <a href={item.url}>
                            <AdminIcon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-muted-foreground hover:text-foreground" tooltip="Contact Us">
              <Link href="/contact">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Contact Us</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
