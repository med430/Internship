import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCVQuery } from '../get-cv.query';
import { ICVRepository } from '../../../../repositories/cv.repository';
import { CV } from '../../../../../Domain/entities/cv.entity';

@QueryHandler(GetCVQuery)
export class GetCVQueryHandler implements IQueryHandler<GetCVQuery> {
  constructor(
    @Inject(ICVRepository)
    private readonly repository: ICVRepository,
  ) {}

  async execute(query: GetCVQuery): Promise<CV | null> {
    const result = await this.repository.findById(query.id);
    if (!result) throw new NotFoundException('CV not found');
    return result;
  }
}
