import { Args, Query, Resolver } from '@nestjs/graphql';
import { IOfferRepository } from '../../../Application/repositories/offer.repository';
import { GetOfferQuery } from '../../../Application/Features/OfferFeature/Queries/get-offer.query';
import { QueryBus } from '@nestjs/cqrs';
import { Offer } from '../../../Domain/entities/offer.entity';
import { GetOffersQuery } from '../../../Application/Features/OfferFeature/Queries/get-offers.query';

@Resolver('Offer')
export class OfferResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('offer')
  async getOffer(@Args('id') id: string): Promise<Offer | null> {
    return this.queryBus.execute(new GetOfferQuery(id));
  }

  @Query('offers')
  async getOffers(): Promise<Offer[]> {
    return this.queryBus.execute(new GetOffersQuery());
  }
}