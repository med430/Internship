import { Offer } from './offer.entity'

export class RecruiterProfile {
    constructor(
        public readonly userId: string,
        public readonly company: string,
        public offers: Offer[] = []
    ) {}
}