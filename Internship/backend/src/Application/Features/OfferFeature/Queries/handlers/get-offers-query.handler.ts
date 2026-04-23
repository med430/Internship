import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOffersQuery } from '../get-offers.query';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { Offer } from '../../../../../Domain/entities/offer.entity';

@QueryHandler(GetOffersQuery)
export class GetOffersQueryHandler implements IQueryHandler<GetOffersQuery> {
  constructor(private readonly offerRepository: IOfferRepository) {
  }

  async execute(query: GetOffersQuery): Promise<Offer[]> {
    return this.offerRepository.findPaginated(query.pageNumber, query.pageSize);
  }
}