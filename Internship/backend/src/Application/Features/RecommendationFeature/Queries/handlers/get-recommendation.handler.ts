import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetRecommendationQuery } from '../get-recommendation.query';
import { IRecommendationRepository } from '../../../../repositories/recommendation.repository';
import { Recommendation } from '../../../../../Domain/entities/recommendation.entity';

@QueryHandler(GetRecommendationQuery)
export class GetRecommendationQueryHandler implements IQueryHandler<GetRecommendationQuery> {
  constructor(
    @Inject(IRecommendationRepository)
    private readonly repository: IRecommendationRepository,
  ) {}

  async execute(query: GetRecommendationQuery): Promise<Recommendation | null> {
    const result = await this.repository.findById(query.id);
    if (!result) throw new NotFoundException('Recommendation not found');
    return result;
  }
}
