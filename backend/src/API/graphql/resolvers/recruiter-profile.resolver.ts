import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';
import { RecruiterProfile } from '../../../Domain/entities/recruiter-profile.entity';
import { GetRecruiterProfileQuery } from '../../../Application/Features/RecruiterProfileFeature/Queries/get-recruiter-profile.query';
import { GetRecruiterProfilesQuery } from '../../../Application/Features/RecruiterProfileFeature/Queries/get-recruiter-profiles.query';

@Resolver('RecruiterProfile')
@UseGuards(GqlAuthGuard, GqlRolesGuard)
@Roles(Role.STUDENT, Role.RECRUITER, Role.ADMIN)
export class RecruiterProfileResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('recruiterProfile')
  async getRecruiterProfile(@Args('id') id: string): Promise<RecruiterProfile | null> {
    return this.queryBus.execute(new GetRecruiterProfileQuery(id));
  }

  @Query('recruiterProfiles')
  async getRecruiterProfiles(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<RecruiterProfile[]> {
    return this.queryBus.execute(new GetRecruiterProfilesQuery(pageNumber, pageSize));
  }
}
