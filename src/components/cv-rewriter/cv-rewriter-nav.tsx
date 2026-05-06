"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Database, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Generate",
    href: "/services/cv-rewriter",
    icon: FileText,
  },
  {
    title: "Answer",
    href: "/services/cv-rewriter/answer",
    icon: MessageSquareText,
  },
  {
    title: "History",
    href: "/services/cv-rewriter/database",
    icon: Database,
  },
];

export function CVRewriterNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8">
      <nav className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg border border-border bg-card/40 p-1 backdrop-blur-sm w-full sm:w-fit mx-auto shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isRootGenerateTab = item.href === "/services/cv-rewriter";
          const isActive = isRootGenerateTab
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center gap-1.5 sm:gap-2 rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-all flex-1 sm:flex-initial",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
