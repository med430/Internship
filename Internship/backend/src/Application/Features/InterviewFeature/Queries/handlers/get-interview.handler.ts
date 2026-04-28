import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetInterviewQuery } from '../get-interview.query';
import { IInterviewRepository } from '../../../../repositories/interview.repository';
import { Interview } from '../../../../../Domain/entities/interview.entity';

@QueryHandler(GetInterviewQuery)
export class GetInterviewQueryHandler implements IQueryHandler<GetInterviewQuery> {
  constructor(
    @Inject(IInterviewRepository)
    private readonly repository: IInterviewRepository,
  ) {}

  async execute(query: GetInterviewQuery): Promise<Interview | null> {
    const result = await this.repository.findById(query.id);
    if (!result) throw new NotFoundException('Interview not found');
    return result;
  }
}
