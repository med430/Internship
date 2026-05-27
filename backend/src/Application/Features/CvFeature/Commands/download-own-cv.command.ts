export class DownloadOwnCVCommand {
    constructor(
        public readonly userId: string,
        public readonly cvId: string,
    ) {}
}
