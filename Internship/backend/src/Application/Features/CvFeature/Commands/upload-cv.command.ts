// upload-cv.command.ts
export class UploadCVCommand {
    constructor(
        public readonly userId: string,
        public readonly file: Express.Multer.File
    ) {}
}