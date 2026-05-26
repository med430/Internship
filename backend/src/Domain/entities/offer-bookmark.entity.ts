export class OfferBookmark {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly offerId: string,
        public createdAt: Date,
        public removedAt?: Date,
    ) {}

    get isActive(): boolean {
        return !this.removedAt
    }
}
