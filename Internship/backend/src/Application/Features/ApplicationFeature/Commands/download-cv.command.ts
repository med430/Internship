export class DownloadCvCommand {
    constructor(
        public readonly applicationId: string,
        public readonly userId: string
    ) {}
}