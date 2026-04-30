import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOfferQuery } from '../get-offer.query';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { Offer } from '../../../../../Domain/entities/offer.entity';
import { Inject } from '@nestjs/common'
@QueryHandler(GetOfferQuery)
export class GetOfferQueryHandler implements IQueryHandler<GetOfferQuery> {
  constructor(
      @Inject(IOfferRepository)        // ← ajouter
      private readonly offerRepository: IOfferRepository,
  ) {}

  async execute(query: GetOfferQuery): Promise<Offer | null> {
    return this.offerRepository.findById(query.id)
  }
}