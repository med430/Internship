import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCVsQuery } from '../get-cvs.query';
import { ICVRepository } from '../../../../repositories/cv.repository';
import { CV } from '../../../../../Domain/entities/cv.entity';

@QueryHandler(GetCVsQuery)
export class GetCVsQueryHandler implements IQueryHandler<GetCVsQuery> {
  constructor(
    @Inject(ICVRepository)
    private readonly repository: ICVRepository,
  ) {}

  async execute(query: GetCVsQuery): Promise<CV[]> {
    return this.repository.findPaginated(query.pageNumber, query.pageSize);
  }
}
