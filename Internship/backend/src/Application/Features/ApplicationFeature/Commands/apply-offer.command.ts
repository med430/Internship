export class ApplyToOfferCommand {
    constructor(
        public readonly studentId: string,
        public readonly offerId: string,
        public readonly cvUrl: string
    ) {}
}