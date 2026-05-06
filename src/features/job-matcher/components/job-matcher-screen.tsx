"use client";

import { JobMatcherToolbar } from "./job-matcher-toolbar";
import { JobMatcherResults } from "./job-matcher-results";
import { JobMatcherModals } from "./job-matcher-modals";
import { useJobMatcherController } from "../hooks/use-job-matcher-controller";

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
    showFilterModal,
    setShowFilterModal,
    showCVSelector,
    setShowCVSelector,
    selectedCVSource,
    resumeContent,
    activeFilters,
    activeFilterTags,
    filteredAllJobs,
    filteredTotalPages,
    paginatedJobs,
    savedJobs,
    topOfResultsRef,
    shouldShowCVPrompt,
    handleSave,
    handleRefresh,
    handleApplyFilters,
    handleResetFilters,
    removeFilter,
    addQuickFilter,
    handleCVSelect,
    handleRemoveCV,
    handleStartMatching,
  } = useJobMatcherController();

  return (
    <div className="min-h-screen bg-background">
      <JobMatcherToolbar
        searchQuery={searchQuery}
        activeFilterTags={activeFilterTags}
        selectedCVSource={selectedCVSource}
        isExtractingCV={isExtractingCV}
        isLoading={isLoading}
        shouldShowCVPrompt={shouldShowCVPrompt}
        onSearchChange={setSearchQuery}
        onOpenCVSelector={() => setShowCVSelector(true)}
        onRefresh={handleRefresh}
        onOpenFilterModal={() => setShowFilterModal(true)}
        onResetFilters={handleResetFilters}
        onRemoveFilter={removeFilter}
        onAddQuickFilter={addQuickFilter}
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
        onRefresh={handleRefresh}
        onOpenCVSelector={() => setShowCVSelector(true)}
        onPageChange={setPage}
        onStartMatching={handleStartMatching}
      />

      <JobMatcherModals
        showCVSelector={showCVSelector}
        showFilterModal={showFilterModal}
        activeFilters={activeFilters}
        onCVSelectorChange={setShowCVSelector}
        onFilterModalChange={setShowFilterModal}
        onCVSelect={handleCVSelect}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
