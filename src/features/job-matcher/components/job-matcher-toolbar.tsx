import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  Briefcase,
  RefreshCw,
  User,
  FileText,
} from "lucide-react";
import type { CVSource } from "@/components/shared/cv-selector";
import type { JobSearchFilters } from "@/types/job-matcher";
import JobMatcherHero from "@/components/services/job-matcher-hero";
import type { ActiveFilterTag } from "../types";
import { ActiveFilterTags } from "./active-filter-tags";
import { JobMatcherQuickFilters } from "./job-matcher-quick-filters";
import { SelectedCVBanner } from "./selected-cv-banner";

interface JobMatcherToolbarProps {
  searchQuery: string;
  activeFilterTags: ActiveFilterTag[];
  selectedCVSource: CVSource | null;
  isExtractingCV: boolean;
  isLoading: boolean;
  shouldShowCVPrompt: boolean;
  onSearchChange: (value: string) => void;
  onOpenCVSelector: () => void;
  onRefresh: () => Promise<void>;
  onOpenFilterModal: () => void;
  onResetFilters: () => void;
  onRemoveFilter: (type: keyof JobSearchFilters, value: string) => void;
  onAddQuickFilter: (
    type: keyof JobSearchFilters,
    value: string | number,
  ) => void;
  onRemoveCV: () => void;
}

export function JobMatcherToolbar({
  searchQuery,
  activeFilterTags,
  selectedCVSource,
  isExtractingCV,
  isLoading,
  shouldShowCVPrompt,
  onSearchChange,
  onOpenCVSelector,
  onRefresh,
  onOpenFilterModal,
  onResetFilters,
  onRemoveFilter,
  onAddQuickFilter,
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
            <div className="flex gap-3 max-w-3xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title, company..."
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={onOpenFilterModal}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Edit Filters
                {activeFilterTags.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {activeFilterTags.length}
                  </Badge>
                )}
              </Button>
            </div>

            <ActiveFilterTags
              tags={activeFilterTags}
              onReset={onResetFilters}
              onRemove={onRemoveFilter}
            />

            {/* <JobMatcherQuickFilters onAddQuickFilter={onAddQuickFilter} /> */}

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
