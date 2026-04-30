import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetExperienceQuery } from '../get-experience.query';
import { IExperienceRepository } from '../../../../repositories/experience.repository';
import { Experience } from '../../../../../Domain/entities/experience.entity';

@QueryHandler(GetExperienceQuery)
export class GetExperienceQueryHandler implements IQueryHandler<GetExperienceQuery> {
  constructor(
    @Inject(IExperienceRepository)
    private readonly repository: IExperienceRepository,
  ) {}

  async execute(query: GetExperienceQuery): Promise<Experience | null> {
    const result = await this.repository.findById(query.id);
    if (!result) throw new NotFoundException('Experience not found');
    return result;
  }
}
