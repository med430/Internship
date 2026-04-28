import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { Education } from '../../../Domain/entities/education.entity';
import { GetEducationQuery } from '../../../Application/Features/EducationFeature/Queries/get-education.query';
import { GetEducationsQuery } from '../../../Application/Features/EducationFeature/Queries/get-educations.query';

@Resolver('Education')
export class EducationResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('education')
  async getEducation(@Args('id') id: string): Promise<Education | null> {
    return this.queryBus.execute(new GetEducationQuery(id));
  }

  @Query('educations')
  async getEducations(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Education[]> {
    return this.queryBus.execute(new GetEducationsQuery(pageNumber, pageSize));
  }
}
