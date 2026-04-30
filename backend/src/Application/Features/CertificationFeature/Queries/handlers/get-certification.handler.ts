import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCertificationQuery } from '../get-certification.query';
import { ICertificationRepository } from '../../../../repositories/certification.repository';
import { Certification } from '../../../../../Domain/entities/certification.entity';

@QueryHandler(GetCertificationQuery)
export class GetCertificationQueryHandler implements IQueryHandler<GetCertificationQuery> {
  constructor(
    @Inject(ICertificationRepository)
    private readonly repository: ICertificationRepository,
  ) {}

  async execute(query: GetCertificationQuery): Promise<Certification | null> {
    const result = await this.repository.findById(query.id);
    if (!result) throw new NotFoundException('Certification not found');
    return result;
  }
}
