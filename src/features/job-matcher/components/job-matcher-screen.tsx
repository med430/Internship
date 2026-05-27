"use client";

import { JobMatcherToolbar } from "./job-matcher-toolbar";
import { JobMatcherResults } from "./job-matcher-results";
import { useJobMatcherController } from "../hooks/use-job-matcher-controller";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CVSelector } from "@/components/shared/cv-selector";

export function JobMatcherScreen() {
  const {
    page,
    setPage,
    hasPrevPage,
    isLoading,
    isExtractingCV,
    error,
    backendMessage,
    searchQuery,
    setSearchQuery,
    showCVSelector,
    setShowCVSelector,
    selectedCVSource,
    resumeContent,
    filteredAllJobs,
    filteredTotalPages,
    paginatedJobs,
    savedJobs,
    topOfResultsRef,
    shouldShowCVPrompt,
    typeFilter,
    setTypeFilter,
    modeFilter,
    setModeFilter,
    paidOnly,
    setPaidOnly,
    hasDisplayFilters,
    clearDisplayFilters,
    handleSave,
    handleView,
    handleRefresh,
    handleCVSelect,
    handleRemoveCV,
    handleStartMatching,
  } = useJobMatcherController();

  return (
    <div className="min-h-screen bg-background">
      <JobMatcherToolbar
        searchQuery={searchQuery}
        selectedCVSource={selectedCVSource}
        isExtractingCV={isExtractingCV}
        isLoading={isLoading}
        shouldShowCVPrompt={shouldShowCVPrompt}
        typeFilter={typeFilter}
        modeFilter={modeFilter}
        paidOnly={paidOnly}
        hasDisplayFilters={hasDisplayFilters}
        onSearchChange={setSearchQuery}
        onOpenCVSelector={() => setShowCVSelector(true)}
        onRefresh={handleRefresh}
        onTypeFilterChange={setTypeFilter}
        onModeFilterChange={setModeFilter}
        onPaidOnlyChange={setPaidOnly}
        onClearDisplayFilters={clearDisplayFilters}
        onRemoveCV={handleRemoveCV}
      />

      <JobMatcherResults
        error={error}
        isLoading={isLoading}
        isExtractingCV={isExtractingCV}
        paginatedJobs={paginatedJobs}
        selectedCVSource={selectedCVSource}
        backendMessage={backendMessage}
        resumeContent={resumeContent}
        page={page}
        filteredTotalPages={filteredTotalPages}
        filteredAllJobsLength={filteredAllJobs.length}
        hasPrevPage={hasPrevPage}
        savedJobs={savedJobs}
        topOfResultsRef={topOfResultsRef}
        onSave={handleSave}
        onView={handleView}
        onRefresh={handleRefresh}
        onOpenCVSelector={() => setShowCVSelector(true)}
        onPageChange={setPage}
        onStartMatching={handleStartMatching}
      />

      {/* CV Selector modal */}
      <Dialog open={showCVSelector} onOpenChange={setShowCVSelector}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto border-border bg-popover/95">
          <DialogHeader>
            <DialogTitle className="text-foreground">Select Your CV</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload your CV or select from your saved CVs to get personalized job matches
            </DialogDescription>
          </DialogHeader>
          <CVSelector
            onCVSelect={handleCVSelect}
            label=""
            description="Choose your CV to start finding jobs tailored to your experience and skills"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
