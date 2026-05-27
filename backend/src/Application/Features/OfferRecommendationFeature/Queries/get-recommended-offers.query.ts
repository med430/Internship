// Query for one paginated page of a student's personalised offer feed.

export class GetRecommendedOffersQuery {
    constructor(
        public readonly studentUserId: string,
        public readonly limit: number,
        public readonly cursor?: string,
        public readonly savedOnly = false,
    ) {}
}
