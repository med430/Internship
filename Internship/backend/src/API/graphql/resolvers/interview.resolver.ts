import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { Interview } from '../../../Domain/entities/interview.entity';
import { GetInterviewQuery } from '../../../Application/Features/InterviewFeature/Queries/get-interview.query';
import { GetInterviewsQuery } from '../../../Application/Features/InterviewFeature/Queries/get-interviews.query';

@Resolver('Interview')
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
}
