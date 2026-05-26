export class SearchQuery {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public query: string,
        public searchedAt: Date,
        public filters?: Record<string, unknown>,
        public resultsCount?: number,
    ) {}
}
