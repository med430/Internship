export class ListOwnCoverLettersQuery {
    constructor(
        public readonly userId: string,
        public readonly page: number,
        public readonly pageSize: number,
    ) {}
}
