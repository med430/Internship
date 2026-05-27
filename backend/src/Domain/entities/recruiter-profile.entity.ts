


import { Offer } from './offer.entity'

export class RecruiterProfile {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public company: string,
        public companyDescription?: string, // 🔥
        public website?: string,
        public offers: Offer[] = []
    ) {}
}