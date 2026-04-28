import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetEducationsQuery } from '../get-educations.query';
import { IEducationRepository } from '../../../../repositories/education.repository';
import { Education } from '../../../../../Domain/entities/education.entity';

@QueryHandler(GetEducationsQuery)
export class GetEducationsQueryHandler implements IQueryHandler<GetEducationsQuery> {
  constructor(
    @Inject(IEducationRepository)
    private readonly repository: IEducationRepository,
  ) {}

  async execute(query: GetEducationsQuery): Promise<Education[]> {
    return this.repository.findPaginated(query.pageNumber, query.pageSize);
  }
}
