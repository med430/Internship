export class OfferDeletedEvent {
    constructor(
        public readonly offerId: string,
        public readonly offerTitle: string,
        public readonly activeApplicationIds: string[],
    ) {}
}
