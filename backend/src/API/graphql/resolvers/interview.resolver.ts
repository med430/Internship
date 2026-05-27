import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { Interview } from '../../../Domain/entities/interview.entity';
import { GetInterviewQuery } from '../../../Application/Features/InterviewFeature/Queries/get-interview.query';
import { GetInterviewsQuery } from '../../../Application/Features/InterviewFeature/Queries/get-interviews.query';
import { GetStudentProfileQuery } from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query';
import { GetUserQuery } from '../../../Application/Features/UserFeature/Queries/get-user.query';
import { GetOfferQuery } from '../../../Application/Features/OfferFeature/Queries/get-offer.query';
import { User } from '../../../Domain/entities/user.entity';
import { Offer } from '../../../Domain/entities/offer.entity';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';

@Resolver('Interview')
@UseGuards(GqlAuthGuard, GqlRolesGuard)
@Roles(Role.STUDENT, Role.ADMIN)
export class InterviewResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('interview')
  async getInterview(@Args('id') id: string): Promise<Interview | null> {
    return this.queryBus.execute(new GetInterviewQuery(id));
  }

  @Query('interviews')
  async getInterviews(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Interview[]> {
    return this.queryBus.execute(new GetInterviewsQuery(pageNumber, pageSize));
  }

  @ResolveField('student')
  async student(@Parent() interview: Interview): Promise<User | null> {
    const profile = await this.queryBus.execute(
      new GetStudentProfileQuery(interview.studentId),
    )

    if (!profile) return null

    return this.queryBus.execute(new GetUserQuery(profile.userId))
  }

  @ResolveField('offer')
  async offer(@Parent() interview: Interview): Promise<Offer | null> {
    if (!interview.offerId) return null
    return this.queryBus.execute(new GetOfferQuery(interview.offerId))
  }
}
