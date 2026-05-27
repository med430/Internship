import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMyOffersQuery } from '../get-my-offers.query';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository';
import { Offer } from '../../../../../Domain/entities/offer.entity';

@QueryHandler(GetMyOffersQuery)
export class GetMyOffersQueryHandler implements IQueryHandler<GetMyOffersQuery> {
  constructor(
    @Inject(IOfferRepository)
    private readonly offerRepository: IOfferRepository,
    @Inject(IRecruiterProfileRepository)
    private readonly recruiterProfileRepository: IRecruiterProfileRepository,
  ) {}

  async execute(query: GetMyOffersQuery): Promise<Offer[]> {
    const profile = await this.recruiterProfileRepository.findByUserId(query.userId);
    if (!profile) return [];
    return this.offerRepository.findByRecruiter(profile.id);
  }
}