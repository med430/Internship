import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetProjectQuery } from '../get-project.query';
import { IProjectRepository } from '../../../../repositories/project.repository';
import { Project } from '../../../../../Domain/entities/project.entity';

@QueryHandler(GetProjectQuery)
export class GetProjectQueryHandler implements IQueryHandler<GetProjectQuery> {
  constructor(
    @Inject(IProjectRepository)
    private readonly repository: IProjectRepository,
  ) {}

  async execute(query: GetProjectQuery): Promise<Project | null> {
    const result = await this.repository.findById(query.id);
    if (!result) throw new NotFoundException('Project not found');
    return result;
  }
}
