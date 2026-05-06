import {
  Briefcase,
  Globe,
  LocateFixed,
  Plus,
  TrendingUp,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { JobSearchFilters } from "@/types/job-matcher";

interface QuickFilterAction {
  label: string;
  description: string;
  type: keyof JobSearchFilters;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_FILTER_ACTIONS: QuickFilterAction[] = [
  {
    label: "Remote",
    description: "Add remote work model",
    type: "work_models",
    value: "remote",
    icon: Globe,
  },
  {
    label: "Full-time",
    description: "Add full-time contracts",
    type: "job_types",
    value: "full_time",
    icon: Briefcase,
  },
  {
    label: "Senior Level",
    description: "Add senior experience level",
    type: "experience_levels",
    value: "senior",
    icon: TrendingUp,
  },
  {
    label: "Hybrid",
    description: "Add hybrid work model",
    type: "work_models",
    value: "hybrid",
    icon: LocateFixed,
  },
];

interface JobMatcherQuickFiltersProps {
  onAddQuickFilter: (
    type: keyof JobSearchFilters,
    value: string | number,
  ) => void;
}

export function JobMatcherQuickFilters({
  onAddQuickFilter,
}: JobMatcherQuickFiltersProps) {
  return (
    <Command className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md">
      <CommandInput placeholder="Find quick filters..." />
      <CommandList>
        <CommandEmpty>No quick filters found.</CommandEmpty>
        <CommandGroup heading="Quick Filters">
          {QUICK_FILTER_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={`${action.type}-${action.value}`}
                onSelect={() => onAddQuickFilter(action.type, action.value)}
              >
                <Icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{action.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </div>
                <Plus className="ml-auto h-4 w-4" />
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
