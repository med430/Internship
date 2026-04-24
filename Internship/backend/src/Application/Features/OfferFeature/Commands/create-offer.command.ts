import {CreateOfferDTO} from "../../../../API/http/offer/dto/create-offer.dto";

export class CreateOfferCommand {
    constructor(
        public readonly dto: CreateOfferDTO,
        public readonly creatorId: string
    ) {}
}