import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { IOfferRepository } from '../../../Application/repositories/offer.repository';
import { GetOfferQuery } from '../../../Application/Features/OfferFeature/Queries/get-offer.query';
import { QueryBus } from '@nestjs/cqrs';
import { Offer } from '../../../Domain/entities/offer.entity';
import { GetOffersQuery } from '../../../Application/Features/OfferFeature/Queries/get-offers.query';
import { GetRecruiterProfileQuery } from '../../../Application/Features/RecruiterProfileFeature/Queries/get-recruiter-profile.query';
import { RecruiterProfile } from '../../../Domain/entities/recruiter-profile.entity';

@Resolver('Offer')
export class OfferResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('offer')
  async getOffer(@Args('id') id: string): Promise<Offer | null> {
    return this.queryBus.execute(new GetOfferQuery(id));
  }

  @Query('offers')
  async getOffers(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Offer[]> {
    return this.queryBus.execute(new GetOffersQuery(pageNumber, pageSize));
  }

  @ResolveField('recruiterProfile')   // ← name must match schema field
  async recruiterProfile(
    @Parent() offer: Offer,            // ← the Offer returned by getOffer above
  ): Promise<RecruiterProfile | null> {
    // offer.recruiterProfileId is the raw ID stored on your domain entity
    return this.queryBus.execute(
      new GetRecruiterProfileQuery(offer.recruiterProfileId)
    );
  }
}