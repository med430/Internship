export interface ScoreBreakdown {
    skillMatch?: number
    locationMatch?: number
    domainMatch?: number
    workModeMatch?: number
    paidMatch?: number
    availabilityScore?: number
    languageMatch?: number
    offerTypeMatch?: number
    [key: string]: number | undefined
}

export class RecommendationScore {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly offerId: string,
        public contentScore: number,
        public finalScore: number,
        public semanticScore: number = 0,
        public cfScore: number = 0,
        public modelVersion: string = 'v0',
        public computedAt: Date = new Date(),
        public breakdown?: ScoreBreakdown,
    ) {}
}
