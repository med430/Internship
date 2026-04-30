import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRecruiterProfilesQuery } from '../../../../Features/RecruiterProfileFeature/Queries/get-recruiter-profiles.query';
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository';
import { RecruiterProfile } from '../../../../../Domain/entities/recruiter-profile.entity';

@QueryHandler(GetRecruiterProfilesQuery)
export class GetRecruiterProfilesQueryHandler implements IQueryHandler<GetRecruiterProfilesQuery> {
  constructor(
    @Inject(IRecruiterProfileRepository)
    private readonly repository: IRecruiterProfileRepository,
  ) {}

  async execute(query: GetRecruiterProfilesQuery): Promise<RecruiterProfile[]> {
    return this.repository.findPaginated(query.pageNumber, query.pageSize);
  }
}
