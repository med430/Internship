import { Recommendation } from './recommendation.entity'
import { Offer } from './offer.entity'

export class TeacherProfile {
    constructor(
        public readonly userId: string,
        public recommendations: Recommendation[] = [],
        public offers: Offer[] = []
    ) {}

}