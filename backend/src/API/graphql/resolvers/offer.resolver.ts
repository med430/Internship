import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GetOfferQuery } from '../../../Application/Features/OfferFeature/Queries/get-offer.query';
import { QueryBus } from '@nestjs/cqrs';
import { Offer } from '../../../Domain/entities/offer.entity';
import { GetOffersQuery } from '../../../Application/Features/OfferFeature/Queries/get-offers.query';
import { GetMyOffersQuery } from '../../../Application/Features/OfferFeature/Queries/get-my-offers.query';
import { GetRecruiterProfileQuery } from '../../../Application/Features/RecruiterProfileFeature/Queries/get-recruiter-profile.query';
import { RecruiterProfile } from '../../../Domain/entities/recruiter-profile.entity';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';

@Resolver('Offer')
export class OfferResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('offer')
  async getOffer(@Args('id') id: string): Promise<Offer | null> {
    return this.queryBus.execute(new GetOfferQuery(id));
  }

  @Query('offers')
  async getOffers(
    @Args('pageNumber') pageNumber: number = 1,
    @Args('pageSize') pageSize: number = 200,
  ): Promise<Offer[]> {
    try {
      const result = await this.queryBus.execute(new GetOffersQuery(pageNumber, pageSize));
      return result ?? [];
    } catch (error) {
      console.error('[GraphQL] offers query failed', error);
      return [];
    }
  }

  @Query('myOffers')
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.RECRUITER)
  async getMyOffers(
    @Context() ctx: { req?: { user?: { id: string } } },
  ): Promise<Offer[]> {
    const userId = ctx.req?.user?.id;
    if (!userId) return [];
    try {
      return await this.queryBus.execute(new GetMyOffersQuery(userId));
    } catch (error) {
      console.error('[GraphQL] myOffers query failed', error);
      return [];
    }
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