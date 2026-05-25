export class OfferCreatedEvent {
    constructor(
        public readonly offerId: string,
        public readonly offerTitle: string,
        public readonly domain: string,
    ) {}
}