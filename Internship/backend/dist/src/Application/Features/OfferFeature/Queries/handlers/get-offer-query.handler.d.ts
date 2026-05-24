import { IQueryHandler } from '@nestjs/cqrs';
import { GetOfferQuery } from '../get-offer.query';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { Offer } from '../../../../../Domain/entities/offer.entity';
export declare class GetOfferQueryHandler implements IQueryHandler<GetOfferQuery> {
    private readonly offerRepository;
    constructor(offerRepository: IOfferRepository);
    execute(query: GetOfferQuery): Promise<Offer | null>;
}
