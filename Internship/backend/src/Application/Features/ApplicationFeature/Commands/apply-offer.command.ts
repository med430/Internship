export class ApplyToOfferCommand {
    constructor(
        public readonly userId: string,
        public readonly offerId: string,
        public readonly cvId: string,
        public readonly coverLetterId?: string
    ) {}
}