"use client";

import { useRef, useState } from "react";
import { FileX, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { uploadCoverLetter } from "@/lib/api/cover-letters";
import { CoverLetterCard } from "./cover-letter-card";
import { useCoverLetterDatabaseController } from "../hooks/use-cover-letter-database-controller";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-md">
      <div className="p-6 space-y-4">
        <Skeleton className="h-14 w-full bg-muted" />
        <Skeleton className="h-4 w-24 bg-muted" />
      </div>
    </div>
  );
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
  if (currentPage >= totalPages - 2) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

export function CoverLetterDatabaseScreen() {
  const { data, loading, error, currentPage, goToPage, goToDetail, reload } =
    useCoverLetterDatabaseController();

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    try {
      setUploading(true);
      await uploadCoverLetter(file);
      toast.success("Cover letter uploaded successfully");
      reload();
    } catch {
      toast.error("Failed to upload cover letter. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isEmpty = !loading && data && data.letters.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-foreground">Your Cover Letters</h1>
            <p className="mt-1 text-xs text-muted-foreground">View and manage all your uploaded cover letters</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="shadow-lg shadow-primary/25"
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploading ? "Uploading..." : "Upload Letter"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200/40 bg-red-50/50 backdrop-blur p-4 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isEmpty ? (
          <div className="flex min-h-[500px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 p-12 backdrop-blur">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-base font-medium text-foreground">No cover letters yet</h3>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Upload your first cover letter using the button above.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data?.letters.map((letter) => (
                <CoverLetterCard key={letter.id} letter={letter} onClick={() => goToDetail(letter.id)} />
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => goToPage(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {getPaginationItems(currentPage, data.totalPages).map((item, index) => (
                      <PaginationItem key={index}>
                        {item === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => goToPage(item as number)}
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
                        onClick={() => goToPage(currentPage + 1)}
                        className={currentPage === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
