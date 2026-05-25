export class GetOwnCoverLetterQuery {
    constructor(
        public readonly userId: string,
        public readonly letterId: string,
    ) {}
}
