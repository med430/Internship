import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetApplicationsQuery } from '../get-applications.query';
import { IApplicationRepository } from '../../../../repositories/application.repository';
import { Application } from '../../../../../Domain/entities/application.entity';

@QueryHandler(GetApplicationsQuery)
export class GetApplicationsQueryHandler implements IQueryHandler<GetApplicationsQuery> {
  constructor(
    @Inject(IApplicationRepository)
    private readonly repository: IApplicationRepository,
  ) {}

  async execute(query: GetApplicationsQuery): Promise<Application[]> {
    const pageNumber = Number(query.pageNumber || 1);
    const pageSize = Number(query.pageSize || 200);

    return this.repository.findPaginated(pageNumber, pageSize);
  }
}
