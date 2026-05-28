// Command to recompute recommendation scores (all students, or one if studentUserId is set).

export type RecommendationRecomputeTrigger = 'admin' | 'cron' | 'system'

export class ComputeRecommendationsCommand {
    constructor(
        public readonly studentUserId?: string,
        public readonly trigger: RecommendationRecomputeTrigger = 'system',
    ) {}
}
