import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobFilterModal from "@/components/job-matcher/job-filter-modal";
import { CVSelector, type CVSource } from "@/components/shared/cv-selector";
import type { JobSearchFilters } from "@/types/job-matcher";

interface JobMatcherModalsProps {
  showCVSelector: boolean;
  showFilterModal: boolean;
  activeFilters: JobSearchFilters;
  onCVSelectorChange: (open: boolean) => void;
  onFilterModalChange: (open: boolean) => void;
  onCVSelect: (source: CVSource | null) => void;
  onApplyFilters: (filters: JobSearchFilters) => void;
}

export function JobMatcherModals({
  showCVSelector,
  showFilterModal,
  activeFilters,
  onCVSelectorChange,
  onFilterModalChange,
  onCVSelect,
  onApplyFilters,
}: JobMatcherModalsProps) {
  return (
    <>
      <Dialog open={showCVSelector} onOpenChange={onCVSelectorChange}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto border-border bg-popover/95">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Select Your CV
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload your CV or select from your saved CVs to get personalized
              job matches
            </DialogDescription>
          </DialogHeader>

          <CVSelector
            onCVSelect={onCVSelect}
            label=""
            description="Choose your CV to start finding jobs tailored to your experience and skills"
          />
        </DialogContent>
      </Dialog>

      <JobFilterModal
        isOpen={showFilterModal}
        onClose={() => onFilterModalChange(false)}
        filters={activeFilters}
        onApplyFilters={onApplyFilters}
      />
    </>
  );
}
