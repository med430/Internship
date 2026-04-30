export class GetUsersQuery {
  constructor(pageNumber: number, pageSize: number) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }

  pageNumber: number;
  pageSize: number;
}
