export declare class UploadCVCommand {
    readonly userId: string;
    readonly file: Express.Multer.File;
    constructor(userId: string, file: Express.Multer.File);
}
