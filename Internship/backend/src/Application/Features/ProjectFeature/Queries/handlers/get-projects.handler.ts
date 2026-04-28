import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProjectsQuery } from '../get-projects.query';
import { IProjectRepository } from '../../../../repositories/project.repository';
import { Project } from '../../../../../Domain/entities/project.entity';

@QueryHandler(GetProjectsQuery)
export class GetProjectsQueryHandler implements IQueryHandler<GetProjectsQuery> {
  constructor(
    @Inject(IProjectRepository)
    private readonly repository: IProjectRepository,
  ) {}

  async execute(query: GetProjectsQuery): Promise<Project[]> {
    return this.repository.findPaginated(query.pageNumber, query.pageSize);
  }
}
