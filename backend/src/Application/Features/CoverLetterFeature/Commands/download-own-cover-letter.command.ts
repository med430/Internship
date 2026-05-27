export class DownloadOwnCoverLetterCommand {
    constructor(
        public readonly userId: string,
        public readonly letterId: string,
    ) {}
}
