import {CreateOfferDTO} from "../../../../API/http/offer/dto/create-offer.dto";

export class UpdateOfferCommand {
    constructor(
        public readonly offerId: string,
        public readonly dto: Partial<CreateOfferDTO>,
        public readonly userId: string
    ) {}
}