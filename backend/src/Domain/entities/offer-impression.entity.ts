export class OfferImpression {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly offerId: string,
        public shownAt: Date,
        public position?: number,
    ) {}
}
