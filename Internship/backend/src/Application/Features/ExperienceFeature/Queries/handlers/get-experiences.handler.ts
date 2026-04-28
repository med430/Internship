import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExperiencesQuery } from '../get-experiences.query';
import { IExperienceRepository } from '../../../../repositories/experience.repository';
import { Experience } from '../../../../../Domain/entities/experience.entity';

@QueryHandler(GetExperiencesQuery)
export class GetExperiencesQueryHandler implements IQueryHandler<GetExperiencesQuery> {
  constructor(
    @Inject(IExperienceRepository)
    private readonly repository: IExperienceRepository,
  ) {}

  async execute(query: GetExperiencesQuery): Promise<Experience[]> {
    return this.repository.findPaginated(query.pageNumber, query.pageSize);
  }
}
