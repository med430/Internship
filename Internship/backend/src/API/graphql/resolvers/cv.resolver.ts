import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { CV } from '../../../Domain/entities/cv.entity';
import { GetCVQuery } from '../../../Application/Features/CvFeature/Queries/get-cv.query';
import { GetCVsQuery } from '../../../Application/Features/CvFeature/Queries/get-cvs.query';

@Resolver('CV')
export class CVResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('cv')
  async getCV(@Args('id') id: string): Promise<CV | null> {
    return this.queryBus.execute(new GetCVQuery(id));
  }

  @Query('cvs')
  async getCVs(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<CV[]> {
    return this.queryBus.execute(new GetCVsQuery(pageNumber, pageSize));
  }
}
