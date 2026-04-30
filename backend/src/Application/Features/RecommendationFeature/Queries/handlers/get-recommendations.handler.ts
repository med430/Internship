import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRecommendationsQuery } from '../../../../Features/RecommendationFeature/Queries/get-recommendations.query';
import { IRecommendationRepository } from '../../../../repositories/recommendation.repository';
import { Recommendation } from '../../../../../Domain/entities/recommendation.entity';

@QueryHandler(GetRecommendationsQuery)
export class GetRecommendationsQueryHandler implements IQueryHandler<GetRecommendationsQuery> {
  constructor(
    @Inject(IRecommendationRepository)
    private readonly repository: IRecommendationRepository,
  ) {}

  async execute(query: GetRecommendationsQuery): Promise<Recommendation[]> {
    return this.repository.findPaginated(query.pageNumber, query.pageSize);
  }
}
