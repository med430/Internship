import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetRecruiterProfileQuery } from '../../../../Features/RecruiterProfileFeature/Queries/get-recruiter-profile.query';
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository';
import { RecruiterProfile } from '../../../../../Domain/entities/recruiter-profile.entity';

@QueryHandler(GetRecruiterProfileQuery)
export class GetRecruiterProfileQueryHandler implements IQueryHandler<GetRecruiterProfileQuery> {
  constructor(
    @Inject(IRecruiterProfileRepository)
    private readonly repository: IRecruiterProfileRepository,
  ) {}

  async execute(query: GetRecruiterProfileQuery): Promise<RecruiterProfile | null> {
    const result = await this.repository.findById(query.id);
    if (!result) throw new NotFoundException('RecruiterProfile not found');
    return result;
  }
}
