export class UploadCVCommand {
    constructor(
        public readonly userId: string,
        public readonly file: Express.Multer.File  // ← était fileUrl: string
    ) {}
}