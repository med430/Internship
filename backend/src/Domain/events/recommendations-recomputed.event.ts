export class RecommendationsRecomputedEvent {
    constructor(
        public readonly studentUserIds: string[],
        public readonly offersConsidered: number,
        public readonly pairsWritten: number,
        public readonly trigger: 'admin' | 'cron' | 'system',
        public readonly recomputedAt: Date,
    ) {}
}
