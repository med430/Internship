import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetEducationQuery } from '../get-education.query';
import { IEducationRepository } from '../../../../repositories/education.repository';
import { Education } from '../../../../../Domain/entities/education.entity';

@QueryHandler(GetEducationQuery)
export class GetEducationQueryHandler implements IQueryHandler<GetEducationQuery> {
  constructor(
    @Inject(IEducationRepository)
    private readonly repository: IEducationRepository,
  ) {}

  async execute(query: GetEducationQuery): Promise<Education | null> {
    const result = await this.repository.findById(query.id);
    if (!result) throw new NotFoundException('Education not found');
    return result;
  }
}
