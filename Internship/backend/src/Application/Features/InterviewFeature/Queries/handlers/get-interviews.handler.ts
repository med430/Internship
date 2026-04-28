import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetInterviewsQuery } from '../../../../Features/InterviewFeature/Queries/get-interviews.query';
import { IInterviewRepository } from '../../../../repositories/interview.repository';
import { Interview } from '../../../../../Domain/entities/interview.entity';

@QueryHandler(GetInterviewsQuery)
export class GetInterviewsQueryHandler implements IQueryHandler<GetInterviewsQuery> {
  constructor(
    @Inject(IInterviewRepository)
    private readonly repository: IInterviewRepository,
  ) {}

  async execute(query: GetInterviewsQuery): Promise<Interview[]> {
    return this.repository.findPaginated(query.pageNumber, query.pageSize);
  }
}
