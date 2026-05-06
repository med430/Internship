import { InterviewWithPagination } from "@/lib/api/interviews";

export function generatePaginationItems(
  data: InterviewWithPagination | null,
): Array<number | "ellipsis"> {
  if (!data) {
    return [];
  }

  const items: Array<number | "ellipsis"> = [];
  const { page, totalPages } = data;

  if (totalPages <= 7) {
    for (let index = 1; index <= totalPages; index += 1) {
      items.push(index);
    }

    return items;
  }

  if (page <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (page >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}
