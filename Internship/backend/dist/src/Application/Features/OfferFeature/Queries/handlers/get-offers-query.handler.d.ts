import { IQueryHandler } from '@nestjs/cqrs';
import { GetOffersQuery } from '../get-offers.query';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { Offer } from '../../../../../Domain/entities/offer.entity';
export declare class GetOffersQueryHandler implements IQueryHandler<GetOffersQuery> {
    private readonly offerRepository;
    constructor(offerRepository: IOfferRepository);
    execute(query: GetOffersQuery): Promise<Offer[]>;
}
