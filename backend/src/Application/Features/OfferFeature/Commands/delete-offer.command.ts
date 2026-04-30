export class DeleteOfferCommand {
    constructor(
        public readonly offerId: string,
        public readonly userId: string
    ) {}
}