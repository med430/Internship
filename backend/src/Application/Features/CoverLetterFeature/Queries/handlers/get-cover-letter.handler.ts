import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCoverLetterQuery } from '../get-cover-letter.query';
import { ICoverLetterRepository } from '../../../../repositories/coverletter.repository';
import { CoverLetter } from '../../../../../Domain/entities/coverletter.entity';

@QueryHandler(GetCoverLetterQuery)
export class GetCoverLetterQueryHandler implements IQueryHandler<GetCoverLetterQuery> {
  constructor(
    @Inject(ICoverLetterRepository)
    private readonly repository: ICoverLetterRepository,
  ) {}

  async execute(query: GetCoverLetterQuery): Promise<CoverLetter | null> {
    const result = await this.repository.findById(query.id);
    if (!result) throw new NotFoundException('CoverLetter not found');
    return result;
  }
}
