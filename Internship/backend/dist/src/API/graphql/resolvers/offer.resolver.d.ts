import { QueryBus } from '@nestjs/cqrs';
import { Offer } from '../../../Domain/entities/offer.entity';
export declare class OfferResolver {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    getOffer(id: string): Promise<Offer | null>;
    getOffers(pageNumber: number, pageSize: number): Promise<Offer[]>;
}
