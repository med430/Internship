// upload-cover-letter.command.ts
export class UploadCoverLetterCommand {
    constructor(
        public readonly userId: string,
        public readonly fileUrl: string
    ) {}
}