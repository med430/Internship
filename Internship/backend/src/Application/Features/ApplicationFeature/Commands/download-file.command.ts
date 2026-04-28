export class DownloadApplicationFileCommand {
    constructor(
        public readonly applicationId: string,
        public readonly userId: string,
        public readonly type: 'cv' | 'coverLetter'
    ) {}
}