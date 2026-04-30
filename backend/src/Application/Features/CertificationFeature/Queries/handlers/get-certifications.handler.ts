import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCertificationsQuery } from '../get-certifications.query';
import { ICertificationRepository } from '../../../../repositories/certification.repository';
import { Certification } from '../../../../../Domain/entities/certification.entity';

@QueryHandler(GetCertificationsQuery)
export class GetCertificationsQueryHandler implements IQueryHandler<GetCertificationsQuery> {
  constructor(
    @Inject(ICertificationRepository)
    private readonly repository: ICertificationRepository,
  ) {}

  async execute(query: GetCertificationsQuery): Promise<Certification[]> {
    return this.repository.findPaginated(query.pageNumber, query.pageSize);
  }
}
