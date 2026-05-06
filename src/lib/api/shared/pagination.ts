export function getPaginationRange(page: number, pageSize: number): {
  from: number;
  to: number;
} {
  const from = (page - 1) * pageSize;
  return {
    from,
    to: from + pageSize - 1,
  };
}

export function getTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}
