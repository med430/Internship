import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { Recommendation } from '../../../Domain/entities/recommendation.entity';
import { GetRecommendationQuery } from '../../../Application/Features/RecommendationFeature/Queries/get-recommendation.query';
import { GetRecommendationsQuery } from '../../../Application/Features/RecommendationFeature/Queries/get-recommendations.query';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';

@Resolver('Recommendation')
@UseGuards(GqlAuthGuard, GqlRolesGuard)
@Roles(Role.ADMIN)
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
