import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { Recommendation } from '../../../Domain/entities/recommendation.entity';
import { GetRecommendationQuery } from '../../../Application/Features/RecommendationFeature/Queries/get-recommendation.query';
import { GetRecommendationsQuery } from '../../../Application/Features/RecommendationFeature/Queries/get-recommendations.query';

@Resolver('Recommendation')
export class RecommendationResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('recommendation')
  async getRecommendation(@Args('id') id: string): Promise<Recommendation | null> {
    return this.queryBus.execute(new GetRecommendationQuery(id));
  }

  @Query('recommendations')
  async getRecommendations(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Recommendation[]> {
    return this.queryBus.execute(new GetRecommendationsQuery(pageNumber, pageSize));
  }
}
