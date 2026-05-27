// Command to recompute recommendation scores (all students, or one if studentUserId is set).

export class ComputeRecommendationsCommand {
    constructor(
        public readonly studentUserId?: string,
    ) {}
}
