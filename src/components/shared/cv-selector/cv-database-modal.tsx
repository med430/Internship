import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, FileX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUserCVs, type CV } from "@/lib/api/cvs";

interface CVDatabaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (cv: CV) => void;
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export function CVDatabaseModal({
  open,
  onOpenChange,
  onSelect,
}: CVDatabaseModalProps) {
  const [cvs, setCVs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadCVs = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchUserCVs(page, 8);
      setCVs(result.cvs);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load CVs",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedCVId(null);
      void loadCVs(1);
    }
  }, [open, loadCVs]);

  const handleConfirm = () => {
    const selectedCV = cvs.find((cv) => cv.id === selectedCVId);
    if (!selectedCV) {
      toast.error("Please select a CV");
      return;
    }

    onSelect(selectedCV);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[85vw] md:w-[70vw] lg:w-[60vw] h-[80vh] sm:h-[70vh] md:h-[60vh] overflow-hidden flex flex-col border-border bg-popover/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Select CV from Database
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a CV from your saved CVs to use for this service
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200/40 bg-red-50/50 backdrop-blur p-3 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full bg-muted" />
              ))}
            </div>
          ) : cvs.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <FileX className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">
                No CVs found
              </h3>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                You have not generated any CVs yet. Generate your first CV in CV
                Rewriter.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cvs.map((cv) => {
                  const scoreImprovement = Math.round(
                    ((cv.final_score - cv.original_score) / cv.original_score) *
                      100 +
                      10,
                  );
                  const formattedDate = format(
                    new Date(cv.created_at),
                    "MMM dd, yyyy",
                  );

                  return (
                    <HoverCard key={cv.id} openDelay={200}>
                      <HoverCardTrigger asChild>
                        <div
                          className={`group cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 ${
                            selectedCVId === cv.id
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
                              : "border-border/60 bg-card/80 hover:bg-card hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
                          }`}
                          onClick={() => setSelectedCVId(cv.id)}
                        >
                          <div className="p-6 space-y-4 min-h-[140px]">
                            <div className="flex items-start gap-2">
                              <Checkbox
                                checked={selectedCVId === cv.id}
                                onCheckedChange={(checked) => {
                                  setSelectedCVId(checked ? cv.id : null);
                                }}
                                className="mt-0.5"
                                onClick={(event) => event.stopPropagation()}
                              />
                              <h3 className="flex-1 text-base font-semibold text-foreground whitespace-normal break-words group-hover:text-primary transition-colors">
                                {cv.job_title}
                              </h3>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formattedDate}
                              </span>
                              <span className="text-sm font-semibold text-[#05e34f] dark:text-[#04c945]">
                                +{scoreImprovement}% Boost
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="right"
                        align="center"
                        className="hidden md:block w-80 border-border/50 bg-popover/95 backdrop-blur-xl shadow-xl"
                      >
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-foreground">
                            Job Description Summary
                          </h4>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {cv.jobs_summary}
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => void loadCVs(currentPage - 1)}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {getPaginationItems(currentPage, totalPages).map(
                        (item, index) => (
                          <PaginationItem key={index}>
                            {item === "ellipsis" ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                onClick={() => void loadCVs(item)}
                                isActive={currentPage === item}
                                className="cursor-pointer"
                              >
                                {item}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ),
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => void loadCVs(currentPage + 1)}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedCVId}
            className="shadow-lg shadow-primary/25"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
