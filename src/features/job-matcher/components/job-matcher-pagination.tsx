import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationItems } from "../lib/utils";

interface JobMatcherPaginationProps {
  page: number;
  totalPages: number;
  totalResults: number;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
}

export function JobMatcherPagination({
  page,
  totalPages,
  totalResults,
  hasPrevPage,
  onPageChange,
}: JobMatcherPaginationProps) {
  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="mb-3 text-sm text-muted-foreground">
        Showing {Math.min((page - 1) * 6 + 1, totalResults)}-
        {Math.min(page * 6, totalResults)} of {totalResults} results
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className={
                !hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>

          {getPaginationItems(page, totalPages).map((item, index) => (
            <PaginationItem key={`${item}-${index}`}>
              {item === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(item)}
                  isActive={page === item}
                  className="cursor-pointer"
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className={
                page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
