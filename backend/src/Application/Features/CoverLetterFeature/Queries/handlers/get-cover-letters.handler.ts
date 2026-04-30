import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCoverLettersQuery } from '../get-cover-letters.query';
import { ICoverLetterRepository } from '../../../../repositories/coverletter.repository';
import { CoverLetter } from '../../../../../Domain/entities/coverletter.entity';

@QueryHandler(GetCoverLettersQuery)
export class GetCoverLettersQueryHandler implements IQueryHandler<GetCoverLettersQuery> {
  constructor(
    @Inject(ICoverLetterRepository)
    private readonly repository: ICoverLetterRepository,
  ) {}

  async execute(query: GetCoverLettersQuery): Promise<CoverLetter[]> {
    return this.repository.findPaginated(query.pageNumber, query.pageSize);
  }
}
