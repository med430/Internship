export class GetApplicationsQuery {
  constructor(
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly userId?: string,
    public readonly role?: string,
  ) {}
}
