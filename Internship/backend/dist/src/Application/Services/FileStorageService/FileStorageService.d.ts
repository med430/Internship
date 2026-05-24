export declare abstract class FileStorageService {
    protected basePath: string;
    abstract upload(file: Express.Multer.File, folder: 'cvs' | 'letters'): Promise<string>;
    abstract delete(fileUrl: string): Promise<void>;
    getFilePath(fileUrl: string): string;
}
