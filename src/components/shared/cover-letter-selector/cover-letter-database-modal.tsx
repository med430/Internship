import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, FileText, FileX } from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUserCoverLetters, type CoverLetter } from "@/lib/api/cover-letters";

interface CoverLetterDatabaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (letter: CoverLetter) => void;
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
  if (currentPage >= totalPages - 2) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

export function CoverLetterDatabaseModal({
  open,
  onOpenChange,
  onSelect,
}: CoverLetterDatabaseModalProps) {
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchUserCoverLetters(page, 8);
      setLetters(result.letters);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cover letters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      void load(1);
    }
  }, [open, load]);

  const handleConfirm = () => {
    const selected = letters.find((l) => l.id === selectedId);
    if (!selected) {
      toast.error("Please select a cover letter");
      return;
    }
    onSelect(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[85vw] md:w-[70vw] lg:w-[60vw] h-[80vh] sm:h-[70vh] md:h-[60vh] overflow-hidden flex flex-col border-border bg-popover/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Select Cover Letter from Database</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a cover letter from your saved files
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
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full bg-muted" />
              ))}
            </div>
          ) : letters.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <FileX className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">No cover letters found</h3>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                You have not uploaded any cover letters yet.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {letters.map((letter) => {
                  const formattedDate = format(new Date(letter.created_at), "MMM dd, yyyy");
                  return (
                    <div
                      key={letter.id}
                      className={`group cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 ${
                        selectedId === letter.id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
                          : "border-border/60 bg-card/80 hover:bg-card hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
                      }`}
                      onClick={() => setSelectedId(letter.id)}
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={selectedId === letter.id}
                            onCheckedChange={(checked) => setSelectedId(checked ? letter.id : null)}
                            className="mt-0.5"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              Cover Letter
                            </h3>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">{formattedDate}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => void load(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {getPaginationItems(currentPage, totalPages).map((item, index) => (
                        <PaginationItem key={index}>
                          {item === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => void load(item as number)}
                              isActive={currentPage === item}
                              className="cursor-pointer"
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => void load(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId} className="shadow-lg shadow-primary/25">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
