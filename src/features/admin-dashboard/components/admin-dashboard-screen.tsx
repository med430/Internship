"use client";

import Link from "next/link";
import { Shield, Users, Briefcase, Target, FileText, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdminStats } from "@/lib/api/admin-client";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-lg p-2.5 ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {value ?? <span className="text-muted-foreground text-base">—</span>}
            </p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ADMIN_SECTIONS = [
  {
    title: "User Management",
    description: "View all platform users and their roles.",
    href: "/services/admin/users",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Offers",
    description: "Browse all active internship and job offers.",
    href: "/services/admin/offers",
    icon: Briefcase,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Recommendations",
    description: "Trigger score recomputation and check the ML sidecar.",
    href: "/services/admin/recommendations",
    icon: Target,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

interface AdminDashboardScreenProps {
  stats: AdminStats | null;
}

export function AdminDashboardScreen({ stats }: AdminDashboardScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-destructive/10 text-destructive p-3">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Platform overview and system management.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Users"
            value={stats?.users}
            icon={Users}
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
          <StatCard
            label="Offers"
            value={stats?.offers}
            icon={Briefcase}
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
          <StatCard
            label="Applications"
            value={stats?.applications}
            icon={FileText}
            color="text-amber-500"
            bg="bg-amber-500/10"
          />
          <StatCard
            label="Interviews"
            value={stats?.interviews}
            icon={Video}
            color="text-violet-500"
            bg="bg-violet-500/10"
          />
        </div>

        {/* Sections */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Management</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {ADMIN_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.href} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${section.bg}`}>
                        <Icon className={`h-5 w-5 ${section.color}`} />
                      </div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                    </div>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={section.href}>Open</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
