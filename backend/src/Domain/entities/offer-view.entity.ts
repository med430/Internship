export class OfferView {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly offerId: string,
        public viewedAt: Date,
        public durationMs?: number,
        public source?: string,
    ) {}
}
