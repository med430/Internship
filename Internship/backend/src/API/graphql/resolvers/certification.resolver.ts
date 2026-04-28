import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { Certification } from '../../../Domain/entities/certification.entity';
import { GetCertificationQuery } from '../../../Application/Features/CertificationFeature/Queries/get-certification.query';
import { GetCertificationsQuery } from '../../../Application/Features/CertificationFeature/Queries/get-certifications.query';

@Resolver('Certification')
export class CertificationResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('certification')
  async getCertification(@Args('id') id: string): Promise<Certification | null> {
    return this.queryBus.execute(new GetCertificationQuery(id));
  }

  @Query('certifications')
  async getCertifications(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Certification[]> {
    return this.queryBus.execute(new GetCertificationsQuery(pageNumber, pageSize));
  }
}
