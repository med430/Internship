import {
  Briefcase,
  Database,
  FileText,
  MessageSquareText,
  Shield,
  Target,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface SidebarMenuEntry {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const PRIMARY_ITEMS: SidebarMenuEntry[] = [
  {
    title: "Jobmatcher",
    url: "/services/jobmatcher",
    icon: Target,
  },
  {
    title: "Recommendation Admin",
    url: "/services/admin/recommendations",
    icon: Shield,
  },
];

export const CV_BOOSTER_ITEMS: SidebarMenuEntry[] = [
  {
    title: "Generate",
    url: "/services/cv-rewriter",
    icon: FileText,
  },
  {
    title: "Answer",
    url: "/services/cv-rewriter/answer",
    icon: MessageSquareText,
  },
  {
    title: "History",
    url: "/services/cv-rewriter/database",
    icon: Database,
  },
];

export const PORTFOLIO_BUILDER_ITEMS: SidebarMenuEntry[] = [
  {
    title: "Generate",
    url: "/services/portfolio-builder",
    icon: Briefcase,
  },
  {
    title: "History",
    url: "/services/portfolio-builder/database",
    icon: Database,
  },
];

export const VIRTUAL_INTERVIEWER_ITEMS: SidebarMenuEntry[] = [
  {
    title: "Interview",
    url: "/services/virtual-interviewer",
    icon: Video,
  },
  {
    title: "History",
    url: "/services/virtual-interviewer/database",
    icon: Database,
  },
];

export const CAREER_GUIDE_ITEMS: SidebarMenuEntry[] = [
  {
    title: "Generate",
    url: "/services/career-guide",
    icon: FileText,
  },
  {
    title: "History",
    url: "/services/career-guide/database",
    icon: Database,
  },
];
