import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Briefcase,
  RefreshCw,
  User,
  FileText,
  ChevronDown,
  Wifi,
  CircleDollarSign,
  Filter,
  X,
} from "lucide-react";
import type { CVSource } from "@/components/shared/cv-selector";
import JobMatcherHero from "@/components/services/job-matcher-hero";
import { SelectedCVBanner } from "./selected-cv-banner";
import { cn } from "@/lib/utils";

const ALL_TYPES = ["INTERNSHIP", "PFE", "RESEARCH", "PHD", "ALTERNANCE"];
const ALL_MODES = ["remote", "hybrid", "onsite"];

interface JobMatcherToolbarProps {
  searchQuery: string;
  selectedCVSource: CVSource | null;
  isExtractingCV: boolean;
  isLoading: boolean;
  shouldShowCVPrompt: boolean;
  typeFilter: string[];
  modeFilter: string[];
  paidOnly: boolean;
  hasDisplayFilters: boolean;
  onSearchChange: (value: string) => void;
  onOpenCVSelector: () => void;
  onRefresh: () => Promise<void>;
  onTypeFilterChange: (types: string[]) => void;
  onModeFilterChange: (modes: string[]) => void;
  onPaidOnlyChange: (value: boolean) => void;
  onClearDisplayFilters: () => void;
  onRemoveCV: () => void;
}

export function JobMatcherToolbar({
  searchQuery,
  selectedCVSource,
  isExtractingCV,
  isLoading,
  shouldShowCVPrompt,
  typeFilter,
  modeFilter,
  paidOnly,
  hasDisplayFilters,
  onSearchChange,
  onOpenCVSelector,
  onRefresh,
  onTypeFilterChange,
  onModeFilterChange,
  onPaidOnlyChange,
  onClearDisplayFilters,
  onRemoveCV,
}: JobMatcherToolbarProps) {
  return (
    <>
      <div className="container mx-auto px-4 md:px-6 mt-4 md:mt-6 flex justify-center">
        <div className="w-full max-w-5xl">
          <JobMatcherHero />
        </div>
      </div>

      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                AI Job Matcher
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Discover opportunities tailored to your profile
              </p>
            </div>

            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <Button
                variant="outline"
                className="gap-2"
                onClick={onOpenCVSelector}
                disabled={isExtractingCV}
              >
                <User className="w-4 h-4" />
                {isExtractingCV
                  ? "Processing..."
                  : selectedCVSource
                    ? "Change CV"
                    : "Select CV"}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isLoading || isExtractingCV}
                title="Refresh job matches"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {selectedCVSource && (
            <SelectedCVBanner
              selectedCVSource={selectedCVSource}
              isExtractingCV={isExtractingCV}
              onRemove={onRemoveCV}
            />
          )}

          <div className="space-y-4">
            {/* Unified inline filter bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title, company…"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>

              {/* Type filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 gap-1.5",
                      typeFilter.length && "border-primary text-primary",
                    )}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Type
                    {typeFilter.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="h-4 px-1 text-[10px]"
                      >
                        {typeFilter.length}
                      </Badge>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  <DropdownMenuLabel className="text-xs">
                    Offer type
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ALL_TYPES.map((t) => (
                    <DropdownMenuCheckboxItem
                      key={t}
                      checked={typeFilter.includes(t)}
                      onCheckedChange={(v) =>
                        onTypeFilterChange(
                          v ? [...typeFilter, t] : typeFilter.filter((x) => x !== t),
                        )
                      }
                      className="text-xs"
                    >
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Work mode filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 gap-1.5",
                      modeFilter.length && "border-primary text-primary",
                    )}
                  >
                    <Wifi className="h-3.5 w-3.5" />
                    Mode
                    {modeFilter.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="h-4 px-1 text-[10px]"
                      >
                        {modeFilter.length}
                      </Badge>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuLabel className="text-xs">
                    Work mode
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ALL_MODES.map((m) => (
                    <DropdownMenuCheckboxItem
                      key={m}
                      checked={modeFilter.includes(m)}
                      onCheckedChange={(v) =>
                        onModeFilterChange(
                          v ? [...modeFilter, m] : modeFilter.filter((x) => x !== m),
                        )
                      }
                      className="text-xs"
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Paid only */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPaidOnlyChange(!paidOnly)}
                className={cn(
                  "h-9 gap-1.5",
                  paidOnly && "border-green-500 text-green-600 dark:text-green-400",
                )}
              >
                <CircleDollarSign className="h-3.5 w-3.5" />
                Paid only
              </Button>

              {/* Clear */}
              {(hasDisplayFilters || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSearchChange("");
                    onClearDisplayFilters();
                  }}
                  className="h-9 gap-1.5 text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>

            {shouldShowCVPrompt && (
              <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-2">
                  Want personalized job matches?
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload your CV to get jobs tailored to your experience and
                  skills
                </p>
                <Button size="sm" onClick={onOpenCVSelector} className="gap-2">
                  <User className="w-3 h-3" />
                  Select CV
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
